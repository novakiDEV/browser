const { ipcRenderer } = require('electron');



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

// Hover link status
let hoverTimer = null;
const sendHover = (href) => {
  try { ipcRenderer.sendToHost('hover-link', { href: href || null }); } catch {}
};
document.addEventListener('mouseover', (e) => {
  const a = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
  clearTimeout(hoverTimer);
  if (a) {
    hoverTimer = setTimeout(() => {
      try { const abs = new URL(a.getAttribute('href'), location.href).href; sendHover(abs); } catch { sendHover(a.getAttribute('href')); }
    }, 60);
  } else {
    hoverTimer = setTimeout(() => sendHover(null), 60);
  }
}, true);
document.addEventListener('mouseout', (e) => {
  const rel = e.relatedTarget;
  if (!rel || !e.currentTarget?.contains?.(rel)) sendHover(null);
}, true);

// Basic progress hints
try {
  window.addEventListener('beforeunload', () => { ipcRenderer.sendToHost('load-progress', { type: 'start' }); });
} catch {}

function collectFavicons() {
  try {
    const links = Array.from(document.querySelectorAll('link[rel]'));
    const icons = [];
    const pushIcon = (href, rel, sizes, type) => {
      if (!href) return;
      try {
        const abs = new URL(href, location.href).href;
        let sizeNum = null;
        if (sizes && typeof sizes === 'string') {
          const s = sizes.trim().split(/\s+/)[0];
          const m = s.match(/(\d+)x(\d+)/i);
          if (m) sizeNum = Math.max(parseInt(m[1],10), parseInt(m[2],10));
        }
        icons.push({ url: abs, rel: String(rel || ''), sizes: String(sizes || ''), size: sizeNum, type: String(type || '') });
      } catch {}
    };
    links.forEach(l => {
      const rel = (l.getAttribute('rel') || '').toLowerCase();
      if (/(^|\s)(icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed|mask-icon)(\s|$)/.test(rel)) {
        pushIcon(l.getAttribute('href') || l.href, rel, l.getAttribute('sizes') || '', l.getAttribute('type') || '');
      }
    });
    const og = document.querySelector('meta[property="og:image"], meta[name="og:image"]');
    if (og && og.getAttribute('content')) pushIcon(og.getAttribute('content'), 'og:image', '', '');
    ipcRenderer.sendToHost('favicons', { icons });
  } catch {}
}

window.addEventListener('DOMContentLoaded', () => {
  collectFavicons();
  try {
    const mo = new MutationObserver((mut) => {
      for (const m of mut) {
        if (m.type === 'childList') {
          const addedLinks = Array.from(m.addedNodes || []).some(n => n.tagName && n.tagName.toLowerCase() === 'link');
          if (addedLinks) { collectFavicons(); return; }
        } else if (m.type === 'attributes') {
          if (m.target && m.target.tagName && m.target.tagName.toLowerCase() === 'link') { collectFavicons(); return; }
        }
      }
    });
    mo.observe(document.head || document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['rel','href','sizes','type'] });
  } catch {}
});
