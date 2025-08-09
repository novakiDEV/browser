import { state } from './state.js'
import { searchIconSVG, globeSVG } from './icons.js'

export function initFavicon(searchIconEl) {
  const showSearchIcon = () => searchIconEl && (searchIconEl.innerHTML = searchIconSVG)
  const showFavicon = (url) => searchIconEl && (searchIconEl.innerHTML = `<img src="${url}" width="16" height="16" style="filter: none;">`)
  const showGlobeIcon = () => searchIconEl && (searchIconEl.innerHTML = globeSVG)

  const cleanUrl = (url) => url.replace(/https?:\/\//, '').split('/')[0]

  const updateUrlDisplay = (domain, searchInput, urlOverlay) => {
    if (!searchInput || !urlOverlay) return
    searchInput.value = domain
    if (domain.startsWith('www.')) {
      searchInput.classList.add('has-url')
      urlOverlay.innerHTML = `<span class="www-part">www.</span>${domain.substring(4)}`
      urlOverlay.style.display = 'block'
    } else {
      searchInput.classList.remove('has-url')
      urlOverlay.style.display = 'none'
    }
  }

  const loadFavicon = (domain) => {
    const faviconUrl = `https://${domain}/favicon.ico`
    const testImg = new Image()
    testImg.onload = () => {
      showFavicon(faviconUrl)
      state.currentFaviconUrl = faviconUrl
    }
    testImg.onerror = () => {
      showGlobeIcon()
      state.currentFaviconUrl = null
    }
    testImg.src = faviconUrl
  }

  return { showSearchIcon, showFavicon, showGlobeIcon, cleanUrl, updateUrlDisplay, loadFavicon }
}
