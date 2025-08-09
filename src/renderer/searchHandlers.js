import { state } from './state.js'

export function attachSearchHandlers(searchInput, urlOverlay, webview, helpers) {
  if (!searchInput) return
  document.querySelector('.search-container')?.addEventListener('click', () => searchInput.focus())

  searchInput.addEventListener('focus', () => {
    helpers.showSearchIcon()
    urlOverlay.style.display = 'none'
    searchInput.classList.remove('has-url')
  })

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      const currentUrl = webview?.getURL()
      if (currentUrl && currentUrl !== 'about:blank') {
        const domain = helpers.cleanUrl(currentUrl)
        helpers.updateUrlDisplay(domain, searchInput, urlOverlay)
        state.currentFaviconUrl ? helpers.showFavicon(state.currentFaviconUrl) : helpers.showGlobeIcon()
      }
    }
  })

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim()
      if (query && webview) {
        const url = query.includes('.') && !query.includes(' ')
          ? (query.startsWith('http') ? query : `https://${query}`)
          : `https://www.google.com/search?q=${encodeURIComponent(query)}`
        webview.src = url
      }
    }
  })
}
