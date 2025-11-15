//devtools/devtools.js

console.warn('[ngVault DevTools] DevTools page loaded');

chrome.devtools.panels.create('ngVault', '../icons/ngvault-128.png', 'panel/panel.html', () => {
  console.warn('[ngVault DevTools] Panel created');
});
