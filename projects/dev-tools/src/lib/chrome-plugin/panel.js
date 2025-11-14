chrome.devtools.inspectedWindow.eval('Boolean(window.ngVault)', (exists) => {
  if (!exists) {
    console.warn('[ngVault DevTools] ngVault not found on page');
    return;
  }

  console.log('[ngVault DevTools] Injecting inline hook…');
  injectInlineHook();
});

function injectInlineHook() {
  const code = `
    (function() {
      if (window.__ngVaultDevtoolsInjected) return;
      window.__ngVaultDevtoolsInjected = true;

      console.log('[ngVault DevTools] Inline hook activated inside inspected page');

      function waitForMonitor() {
        const monitor = window.ngVaultMonitorInstance;
        if (monitor) {
          hook(monitor);
        } else {
          setTimeout(waitForMonitor, 100);
        }
      }

      function hook(monitor) {
        console.log('[ngVault DevTools] Monitor found, enabling insights');

        try {
          monitor.activateGlobalInsights({
            wantsState: true,
            wantsPayload: true,
            wantsErrors: true
          });
        } catch (e) {
          console.error('[ngVault DevTools] Failed to activate insights:', e);
        }

        const bus = monitor.eventBus || window.ngVaultEventBus;
        if (!bus || typeof bus.subscribe !== 'function') {
          console.warn('[ngVault DevTools] Event bus not found');
          return;
        }

        console.log('[ngVault DevTools] Subscribing to event bus…');

        bus.subscribe((event) => {
          window.postMessage(
            { source: 'ngvault-devtools', event },
            '*'
          );
        });

        console.log('[ngVault DevTools] Event stream enabled');
      }

      waitForMonitor();
    })();
  `;

  chrome.devtools.inspectedWindow.eval(code, (res, err) => {
    if (err) {
      console.error('[ngVault DevTools] Injection failed:', err);
    } else {
      console.log('[ngVault DevTools] Inline hook injected successfully');
    }
  });
}

// Receive forwarded events
window.addEventListener('message', (event) => {
  if (event.data?.source === 'ngvault-devtools') {
    addEvent(event.data.event);
  }
});

function addEvent(event) {
  const log = document.getElementById('ngvault-events');
  if (!log) return;

  const row = document.createElement('div');
  row.className = 'event-row';
  row.textContent = JSON.stringify(event);
  log.appendChild(row);
}
