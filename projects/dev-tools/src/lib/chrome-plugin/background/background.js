// background/background.js
const ports = new Set();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'ngvault-devtools') return;

  ports.add(port);
  console.log('[ngVault DevTools] Panel connected');

  port.onDisconnect.addListener(() => {
    ports.delete(port);
    console.log('[ngVault DevTools] Panel disconnected');
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'NGVAULT_EVENT') {
    for (const port of ports) {
      try {
        port.postMessage(msg.event);
      } catch (e) {
        console.warn('[ngVault DevTools] Failed to deliver event to panel:', e);
      }
    }
  }
});
