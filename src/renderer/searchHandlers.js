import { state } from './state.js'

export function attachSearchHandlers(searchInput, urlOverlay, webview, helpers) {
  if (!searchInput) return
  document.querySelector('.search-container')?.addEventListener('click', (e) => {
    if (!e.target.closest('.lock-button') && !e.target.closest('.menu-button')) {
      searchInput.focus()
    }
  })

  const restoreDisplay = () => {
    const currentUrl = webview?.getURL?.()
    if (currentUrl && currentUrl !== 'about:blank') {
      const domain = helpers.cleanUrl(currentUrl)
      helpers.updateUrlDisplay(domain, searchInput, urlOverlay)
      if (state.currentFaviconUrl) {
        helpers.showFavicon(state.currentFaviconUrl)
      } else {
        helpers.showGlobeIcon()
      }
    } else {
      urlOverlay.style.display = 'none'
      searchInput.classList.remove('has-url')
    }
  }

  searchInput.addEventListener('focus', () => {
    helpers.showSearchIcon()
    urlOverlay.style.display = 'none'
    searchInput.classList.remove('has-url')
    const currentUrl = webview?.getURL?.()
    if (currentUrl && currentUrl !== 'about:blank') {
      searchInput.value = currentUrl
      try { searchInput.setSelectionRange(0, currentUrl.length) } catch {}
    }
  })

  searchInput.addEventListener('blur', restoreDisplay)

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      restoreDisplay()
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
        try { searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length) } catch {}
        searchInput.blur()
      }
    }
  }
  searchInput.addEventListener('keypress', handleEnter)
  searchInput.addEventListener('keydown', handleEnter)
}
