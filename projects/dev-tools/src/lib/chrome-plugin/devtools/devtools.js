// devtools/devtools.js
console.log('[ngVault DevTools] DevTools page loaded');

chrome.devtools.panels.create('ngVault', '../icons/ngvault-128.png', '../panel/panel.html', (panel) => {
  console.log('[ngVault DevTools] Panel created', panel);
});
