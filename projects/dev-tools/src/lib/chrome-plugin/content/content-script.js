console.log('[ngVault] content-script loaded');

// Inject the bridging script into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('bridge/bridge-inject.js');
(document.head || document.documentElement).appendChild(script);

// Receive events from bridge-inject.js
window.addEventListener('__ngvault_event__', (event) => {
  chrome.runtime.sendMessage({
    type: 'ngvault-event',
    event: event.detail
  });
});

// Bridge: Page → ContentScript → DevTools panel
window.addEventListener('message', (event) => {
  if (event.data?.source === 'ngvault-devtools') {
    chrome.runtime.sendMessage({
      type: 'NGVAULT_EVENT',
      event: event.data.event
    });
  }
});
