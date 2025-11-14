console.log('bridge called');

(function () {
  console.log('[ngVault bridge] injected');

  function wait() {
    const monitor = window.ngVaultMonitorInstance;

    if (monitor) {
      hook(monitor);
    } else {
      setTimeout(wait, 100);
    }
  }

  function hook(monitor) {
    console.log('[ngVault bridge] Hooking monitor');

    try {
      monitor.activateGlobalInsights({
        wantsState: true,
        wantsPayload: true,
        wantsErrors: true
      });
    } catch (e) {
      console.error('[ngVault] Failed to enable insights', e);
    }

    const bus = monitor.eventBus;
    if (!bus?.subscribe) return;

    bus.subscribe((event) => {
      window.dispatchEvent(new CustomEvent('__ngvault_event__', { detail: event }));
    });

    console.log('[ngVault bridge] Ready');
  }

  wait();
})();
