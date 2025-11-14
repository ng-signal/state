// bridge/bridge-inject.js
(function () {
  if (window.__ngVaultDevtoolsBridgeInjected) return;
  window.__ngVaultDevtoolsBridgeInjected = true;

  console.log('[ngVault DevTools] bridge-inject.js executing in page context');

  function waitForNgVault() {
    const monitor = window.ngVaultMonitorInstance;
    const bus = window.ngVaultEventBus;

    if (!monitor || !bus) {
      // Keep polling until app boots fully
      return setTimeout(waitForNgVault, 200);
    }

    console.log('[ngVault DevTools] Found monitor + event bus', { monitor, bus });

    try {
      // Enable global insights so we get state/payload/error
      if (typeof monitor.activateGlobalInsights === 'function') {
        monitor.activateGlobalInsights({
          wantsState: true,
          wantsPayload: true,
          wantsErrors: true
        });
        console.log('[ngVault DevTools] Global insights enabled');
      } else {
        console.warn('[ngVault DevTools] monitor.activateGlobalInsights not found');
      }
    } catch (e) {
      console.error('[ngVault DevTools] Failed to enable insights:', e);
    }

    if (!bus || typeof bus.subscribe !== 'function') {
      console.warn('[ngVault DevTools] NgVaultEventBus missing or not subscribable');
      return;
    }

    console.log('[ngVault DevTools] Subscribing to NgVaultEventBus…');

    bus.subscribe((event) => {
      window.postMessage(
        {
          source: 'ngvault-devtools',
          event
        },
        '*'
      );
    });

    console.log('[ngVault DevTools] Event bus subscription active');
  }

  waitForNgVault();
})();
