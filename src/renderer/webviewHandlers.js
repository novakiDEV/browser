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
}
