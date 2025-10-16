import { state } from './state.js'
import { searchIconSVG, globeSVG } from './icons.js'

export function initFavicon(searchIconEl) {
  const showSearchIcon = () => searchIconEl && (searchIconEl.innerHTML = searchIconSVG)
  const showFavicon = (url) => {
    if (!searchIconEl) return
    searchIconEl.innerHTML = `<img src="${url}" width="16" height="16" style="filter: none;">`
  }
  const showGlobeIcon = () => {
    if (!searchIconEl) return
    searchIconEl.innerHTML = globeSVG
  }

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

  const tryLoad = (url, onSuccess, onFail) => {
    const img = new Image()
  img.onload = () => onSuccess(url)
    img.onerror = onFail
    img.referrerPolicy = 'no-referrer'
    img.src = url
  }

  const loadFavicon = (domain) => {
    const ico = domain ? `https://${domain}/favicon.ico` : null
    if (!ico) {
      state.currentFaviconUrl = null
      showGlobeIcon()
      return
    }

    state.currentFaviconUrl = null
    tryLoad(ico, (okUrl) => {
      showFavicon(okUrl)
      state.currentFaviconUrl = okUrl
      window.__haveFaviconOnce = true
    }, () => {
      state.currentFaviconUrl = null
      showGlobeIcon()
    })
  }

  const pickBestIcon = (icons = []) => {
    const scored = icons.map(i => ({
      url: i.url,
      size: Number.isFinite(i.size) ? i.size : (/apple-touch-icon/i.test(i.rel) ? 180 : (/svg/i.test(i.type) ? 512 : 0)),
      rel: i.rel || ''
    }))
    scored.sort((a, b) => (b.size || 0) - (a.size || 0))
    return scored[0]?.url
  }

  const loadFromCandidates = (domain, icons) => {
  const best = pickBestIcon(icons)
    if (best) {
      tryLoad(best, (ok) => {
        showFavicon(ok)
        state.currentFaviconUrl = ok
        window.__haveFaviconOnce = true
      }, () => loadFavicon(domain))
      return
    }

    loadFavicon(domain)
  }

  return { showSearchIcon, showFavicon, showGlobeIcon, cleanUrl, updateUrlDisplay, loadFavicon, loadFromCandidates }
}
