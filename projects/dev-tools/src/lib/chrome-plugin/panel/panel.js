chrome.devtools.inspectedWindow.eval(`(${injectNgVaultHook.toString()})()`, (res, err) => {
  if (err) console.error('[ngVault DevTools] Injection failed:', err);
  else console.log('[ngVault DevTools] Hook injected into page.');
});

// This function runs INSIDE the inspected page — not the devtools panel.
function injectNgVaultHook() {
  if (window.__ngVaultDevtoolsInjected) {
    console.log('[ngVault DevTools] Already injected.');
    return;
  }

  window.__ngVaultDevtoolsInjected = true;

  console.log('[ngVault DevTools] Inline hook activated in inspected page.');

  function wait() {
    if (window.ngVaultMonitorInstance) {
      hook(window.ngVaultMonitorInstance);
    } else {
      setTimeout(wait, 100);
    }
  }

  function hook(monitor) {
    console.log('[ngVault DevTools] Monitor found in inspected page.');

    try {
      monitor.activateGlobalInsights({
        wantsState: true,
        wantsPayload: true,
        wantsErrors: true
      });
    } catch (e) {
      console.error('[ngVault DevTools] Failed enabling insights:', e);
    }

    const bus = monitor.eventBus || window.ngVaultEventBus;
    if (!bus || typeof bus.subscribe !== 'function') {
      console.warn('[ngVault DevTools] Event bus not available in inspected page.');
      return;
    }

    bus.subscribe((event) => {
      window.postMessage({ source: 'ngvault-devtools', event }, '*');
    });
  }

  wait();
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'NGVAULT_EVENT') {
    addEvent(msg.event);
  }
});
