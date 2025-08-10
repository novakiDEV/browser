export function attachWebviewHandlers(webview, showContextMenu, hideContextMenu, onNavigated, onFavicons) {
  if (!webview) return
  webview.addEventListener('new-window', (e) => {
    if (e?.url) webview.src = e.url
  })
  webview.addEventListener('ipc-message', (e) => {
    if (e.channel === 'context-menu' && e.args && e.args[0]) {
      const { x, y, imageSrc, prevented } = e.args[0]
      const rect = webview.getBoundingClientRect()
      showContextMenu(rect.left + x, rect.top + y, { imageSrc, prevented })
    } else if (e.channel === 'dismiss-context-menu') {
      hideContextMenu()
    } else if (e.channel === 'open-url' && e.args && e.args[0]?.url) {
      const next = e.args[0].url
      if (next) webview.src = next
    } else if (e.channel === 'favicons' && e.args && e.args[0]?.icons) {
      onFavicons?.(e.args[0].icons)
    }
  })
  ;['will-navigate', 'did-navigate', 'did-start-loading', 'did-stop-loading']
    .forEach(ev => webview.addEventListener(ev, hideContextMenu))

  webview.addEventListener('did-navigate', (e) => {
    onNavigated?.(e.url)
  })

  webview.addEventListener('dom-ready', () => {
    try {
      const css = `
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.15); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.35); border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.55); }
      `
      webview.insertCSS(css)
    } catch {}
  })
}
