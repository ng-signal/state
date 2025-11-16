//devtools/devtools.js

// console.info('[ngVault DevTools] DevTools page loaded');

chrome.devtools.panels.create('ngVault', '../icons/ngvault-128.png', 'panel/panel.html', () => {
  // console.info('[ngVault DevTools] Panel created');
});
