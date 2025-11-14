console.log('[ngVault DevTools] Panel loaded.');

window.addEventListener('message', (event) => {
  if (event.data?.source === 'ngvault-devtools') {
    addEvent(event.data.event);
  }
});

chrome.devtools.inspectedWindow.eval('Boolean(window.ngVault)', (exists) => {
  if (!exists) return console.warn('[ngVault DevTools] ngVault not found.');
  injectHook();
});

function injectHook() {
  const url = chrome.runtime.getURL('scripts/ngvault-inject.js');
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      var s = document.createElement('script');
      s.src = "${url}";
      document.documentElement.appendChild(s);
    })();
  `);
}

function addEvent(e) {
  const log = document.getElementById('ngvault-events');
  const div = document.createElement('div');
  div.className = 'event-row';
  div.textContent = JSON.stringify(e);
  log.appendChild(div);
}
