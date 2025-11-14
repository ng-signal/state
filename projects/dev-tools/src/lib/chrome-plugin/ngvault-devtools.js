console.log('[ngVault DevTools] DevTools entry loaded.');

chrome.devtools.panels.create('ngVault', 'icons/ngvault-128.png', 'panel.html', function (panel) {
  console.log('[ngVault DevTools] Panel created.');
});
