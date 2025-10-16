import { state } from './state.js'
import { applyTheme } from './theme.js'
import { initFavicon } from './favicon.js'
import { attachWebviewHandlers } from './webviewHandlers.js'
import { attachSearchHandlers } from './searchHandlers.js'

document.addEventListener('DOMContentLoaded', async () => {
  const webview = document.getElementById('main-webview')
  const searchInput = document.getElementById('search-input')
  const urlOverlay = document.getElementById('url-overlay')
  const searchIconEl = document.querySelector('.search-icon')

  await applyTheme(searchInput)

  const fav = initFavicon(searchIconEl)

  attachWebviewHandlers(
    webview,
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
