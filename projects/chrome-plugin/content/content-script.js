//content/content-script.js

// console.info('[ngVault DevTools] CONTENT SCRIPT running on', location.href);

(function injectBridge() {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('bridge/bridge-inject.js');
    script.async = true;
    (document.documentElement || document.head || document.body).appendChild(script);
    script.remove();
    // console.info('[ngVault DevTools] bridge-inject.js tag inserted');
  } catch (e) {
    console.error('[ngVault DevTools] Failed to inject bridge script:', e);
  }
})();

// Listen for messages from the injected page script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== 'ngvault-devtools') return;

  chrome.runtime.sendMessage({
    type: 'NGVAULT_EVENT',
    event: event.data.event
  });
});
