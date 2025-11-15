// bridge/bridge-inject.js
(function () {
  if (window.__ngVaultDevtoolsBridgeInjected) return;
  window.__ngVaultDevtoolsBridgeInjected = true;

  console.warn('[ngVault DevTools] bridge-inject.js executing in page context');

  function waitForNgVault() {
    const monitor = window.ngVaultMonitorInstance;
    const bus = window.ngVaultEventBus;

    if (!monitor || !bus) {
      console.error('monitor', monitor);
      console.error('bus', bus);
      // Keep polling until app boots fully
      return setTimeout(waitForNgVault, 500);
    }

    console.warn('[ngVault DevTools] Found monitor + event bus', { monitor, bus });

    try {
      // Enable global insights so we get state/payload/error
      if (typeof monitor.activateGlobalInsights === 'function') {
        monitor.activateGlobalInsights({
          wantsState: true,
          wantsPayload: true,
          wantsErrors: true
        });
        console.warn('[ngVault DevTools] Global insights enabled');
      } else {
        console.warn('[ngVault DevTools] monitor.activateGlobalInsights not found');
      }
    } catch (e) {
      console.error('[ngVault DevTools] Failed to enable insights:', e);
    }

    const observable = bus.asObservable();

    if (!observable || typeof observable.subscribe !== 'function') {
      console.warn('[ngVault DevTools] NgVaultEventBus.asObservable() missing or broken');
      return;
    }

    console.warn('[ngVault DevTools] Subscribing to NgVaultEventBus…');

    observable.subscribe((event) => {
      window.postMessage(
        {
          source: 'ngvault-devtools',
          event
        },
        '*'
      );
    });

    console.warn('[ngVault DevTools] Event bus subscription active');
  }

  waitForNgVault();
})();
