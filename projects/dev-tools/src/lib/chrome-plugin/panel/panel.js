// panel/panel.js
console.log('[ngVault DevTools] Panel loaded.');

// Connect to background to receive events
const port = chrome.runtime.connect({ name: 'ngvault-devtools' });

port.onMessage.addListener((event) => {
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
