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

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim()
      if (query && webview) {
        // Allow direct navigation for any protocol (e.g., about:, mailto:, file:, custom:, or anything with ://)
        let url;
        if (/^[a-zA-Z0-9+.-]+:/.test(query)) {
          url = query;
        } else if (query.includes('.') && !query.includes(' ')) {
          url = `https://${query}`;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
        webview.src = url;
      }
    }
  }
  searchInput.addEventListener('keypress', handleEnter)
  searchInput.addEventListener('keydown', handleEnter)
}
