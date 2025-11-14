let panelPort = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'ngvault-panel') {
    panelPort = port;
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'ngvault-event' && panelPort) {
    panelPort.postMessage(msg.event);
  }
});
