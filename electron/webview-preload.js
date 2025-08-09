const { ipcRenderer } = require('electron');

window.addEventListener('contextmenu', (e) => {
  try {
    let imageSrc = null;
    try {
      const img = e.target && (e.target.closest ? e.target.closest('img') : null);
      if (img && img.src) {
        imageSrc = new URL(img.getAttribute('src') || img.src, location.href).href;
      }
    } catch {}
  ipcRenderer.sendToHost('context-menu', { x: e.clientX, y: e.clientY, imageSrc, prevented: e.defaultPrevented === true });
  } catch {}
});

window.addEventListener('mousedown', (e) => {
  if (e.button !== 2) {
    try { ipcRenderer.sendToHost('dismiss-context-menu'); } catch {}
  }
});
window.addEventListener('wheel', () => {
  try { ipcRenderer.sendToHost('dismiss-context-menu'); } catch {}
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    try { ipcRenderer.sendToHost('dismiss-context-menu'); } catch {}
  }
});
const sendOpenUrl = (url) => {
  if (!url) return;
  try { ipcRenderer.sendToHost('open-url', { url }); } catch {}
};
try {
  const originalOpen = window.open;
  window.open = function(url, target, features) {
    if (url) {
      try {
        const abs = new URL(url, location.href).href;
        sendOpenUrl(abs);
        return null;
      } catch {
        return originalOpen?.apply(window, arguments);
      }
    }
    return originalOpen?.apply(window, arguments);
  };
} catch {}
document.addEventListener('click', (e) => {
  const a = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
  if (!a) return;
  const targetBlank = a.target === '_blank';
  const relNoOpener = (a.rel || '').split(/\s+/).includes('noopener') || (a.rel || '').split(/\s+/).includes('noreferrer');
  if (targetBlank || relNoOpener) {
    e.preventDefault();
    try {
      const abs = new URL(a.getAttribute('href'), location.href).href;
      sendOpenUrl(abs);
    } catch {}
  }
}, true);
document.addEventListener('auxclick', (e) => {
  if (e.button !== 1) return;
  const a = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
  if (!a) return;
  e.preventDefault();
  try {
    const abs = new URL(a.getAttribute('href'), location.href).href;
    sendOpenUrl(abs);
  } catch {}
}, true);
