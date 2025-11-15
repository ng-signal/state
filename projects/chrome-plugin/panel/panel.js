// panel/panel.js
console.warn('[ngVault DevTools] Panel loaded.');

// Connect to background to receive events
const port = chrome.runtime.connect({ name: 'ngvault-devtools' });

port.onMessage.addListener((event) => {
  console.warn('[ngVault DevTools] Panel received event', event);
  appendEvent(event);
});

function appendEvent(event) {
  const container = document.getElementById('events');
  if (!container) return;

  if (container.textContent === 'Waiting for events…') {
    container.textContent = '';
  }

  const row = document.createElement('div');
  row.className = 'event-row';
  row.textContent = `[${event.type}] cell=${event.cell} | behavior=${event.behaviorKey}`;
  container.appendChild(row);
}

// Relay events from background → Angular app
chrome.runtime.onMessage.addListener((msg) => {
  console.log('[ngVault DevTools] new listener.');
  if (msg?.type === 'NGVAULT_EVENT') {
    window.postMessage(
      {
        source: 'ngvault-angular-devtools',
        event: msg.event
      },
      '*'
    );
  }
});
