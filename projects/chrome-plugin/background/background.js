// background/background.js
let devtoolsPort = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'ngvault-devtools') {
    // console.warn(`[ngVault DevTools] Panel connected on port ${port.name}`);
    devtoolsPort = port;

    port.onDisconnect.addListener(() => {
      // console.warn('[ngVault DevTools] Panel disconnected');
      devtoolsPort = null;
    });
  }
});

// Receive events from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'NGVAULT_EVENT' && devtoolsPort) {
    devtoolsPort.postMessage(msg.event);
  }
});
