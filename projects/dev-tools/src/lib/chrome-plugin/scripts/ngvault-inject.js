console.log('ngvault-inject.js loaded');
(function () {
  console.log('ngvault-inject.js called');
  if (window.__ngVaultDevtoolsInjected) return;
  window.__ngVaultDevtoolsInjected = true;

  function waitForNgVault() {
    if (window.ngVault && window.ngVault.NgVaultMonitor) {
      hookNgVault();
    } else {
      setTimeout(waitForNgVault, 100);
    }
  }

  function hookNgVault() {
    console.log('[ngVault DevTools] Hook activated');

    // Enable global insights
    try {
      window.ngVault.NgVaultMonitor.prototype.activateGlobalInsights({
        wantsState: true,
        wantsPayload: true,
        wantsErrors: true
      });
    } catch (err) {
      console.warn('[ngVault DevTools] Failed to activate insights:', err);
    }

    // Listen to event bus
    const bus = window.ngVaultEventBus;
    if (bus?.subscribe) {
      bus.subscribe((event) => {
        // This is the ONLY valid bridge to DevTools panel
        window.postMessage({ source: 'ngvault-devtools', event }, '*');
      });
    }
  }

  waitForNgVault();
})();
