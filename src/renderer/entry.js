import { state } from './state.js'
import { applyTheme } from './theme.js'
import { initFavicon } from './favicon.js'
import { createContextMenu } from './contextMenu.js'
import { attachWebviewHandlers } from './webviewHandlers.js'
import { attachSearchHandlers } from './searchHandlers.js'

document.addEventListener('DOMContentLoaded', async () => {
  const webview = document.getElementById('main-webview')
  const searchInput = document.getElementById('search-input')
  const urlOverlay = document.getElementById('url-overlay')
  const contextMenu = document.getElementById('context-menu')
  const searchIconEl = document.querySelector('.search-icon')

  await applyTheme(searchInput)

  const fav = initFavicon(searchIconEl)

  const { show: showContextMenu, hide: hideContextMenu, handleAction } = createContextMenu(webview, contextMenu)

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    showContextMenu(e.clientX, e.clientY)
  })
  window.addEventListener('blur', () => hideContextMenu())
  document.addEventListener('click', (e) => {
    if (!contextMenu?.contains(e.target)) hideContextMenu()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideContextMenu()
  })
  contextMenu?.addEventListener('click', (e) => {
    const item = e.target.closest('.menu-item')
    if (!item || item.classList.contains('disabled')) return
    const action = item.getAttribute('data-action')
    hideContextMenu()
    handleAction(action)
  })

  attachWebviewHandlers(
    webview,
    (x, y, opts) => showContextMenu(x, y, opts),
    () => hideContextMenu(),
    (url) => {
      const domain = fav.cleanUrl(url)
      fav.updateUrlDisplay(domain, searchInput, urlOverlay)
      fav.loadFavicon(domain)
    },
    (icons) => {
      try {
        const currentUrl = webview?.getURL?.()
        if (!currentUrl) return
        const domain = fav.cleanUrl(currentUrl)
        fav.loadFromCandidates(domain, icons)
      } catch {}
    }
  )

  setTimeout(() => {
    const currentUrl = webview?.getURL?.()
    if (currentUrl && currentUrl !== 'about:blank') {
      const domain = fav.cleanUrl(currentUrl)
      fav.updateUrlDisplay(domain, searchInput, urlOverlay)
      if (!window.__haveFaviconOnce) { 
        fav.loadFavicon(domain)
      }
    }
  }, 1000)

  attachSearchHandlers(searchInput, urlOverlay, webview, fav)
})
