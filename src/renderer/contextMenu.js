import { state } from './state.js'

const blockedHosts = new Set([])

export function createContextMenu(webview, contextMenuEl) {
  const hide = () => {
    if (!contextMenuEl) return
    contextMenuEl.style.display = 'none'
    contextMenuEl.setAttribute('aria-hidden', 'true')
  }

  const show = (x, y, opts = {}) => {
    if (!contextMenuEl) return
    state.lastImageSrc = opts.imageSrc || null
    try {
      const currentUrl = webview?.getURL?.()
      const host = currentUrl ? new URL(currentUrl).host : ''
      const isBlocked = Array.from(blockedHosts).some(h => host === h || host.endsWith('.' + h))
      if (isBlocked || opts.prevented) return
    } catch {}

    const canBack = webview?.canGoBack?.()
    const canFwd = webview?.canGoForward?.()
    contextMenuEl?.querySelector('[data-action="back"]').classList.toggle('disabled', !canBack)
    contextMenuEl?.querySelector('[data-action="forward"]').classList.toggle('disabled', !canFwd)

    contextMenuEl.style.display = 'block'
    contextMenuEl.setAttribute('aria-hidden', 'false')

    const menuRect = contextMenuEl.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const left = Math.min(x, vw - menuRect.width - 6)
    const top = Math.min(y, vh - menuRect.height - 6)
    contextMenuEl.style.left = left + 'px'
    contextMenuEl.style.top = top + 'px'

    contextMenuEl.querySelectorAll('.image-only').forEach(el => {
      el.style.display = state.lastImageSrc ? '' : 'none'
    })
  }

  const handleAction = async (action) => {
    switch (action) {
      case 'back':
        if (webview?.canGoBack()) webview.goBack()
        break
      case 'forward':
        if (webview?.canGoForward()) webview.goForward()
        break
      case 'reload':
        webview?.reload()
        break
      case 'copy-url': {
        const url = webview?.getURL()
        if (url) {
          try { await navigator.clipboard.writeText(url) } catch {}
        }
        break
      }
      case 'save-image': {
        if (state.lastImageSrc) {
          const nameFromPath = (state.lastImageSrc.split('/').pop() || 'image').split('?')[0] || 'image'
          const title = `Save Image: ${nameFromPath}`
          if (window.files?.saveImage) {
            try {
              const ok = await window.files.saveImage({ url: state.lastImageSrc, suggestedName: nameFromPath, title })
              if (!ok) {}
            } catch (e) {
              try {
                const res = await fetch(state.lastImageSrc)
                const blob = await res.blob()
                const objUrl = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = objUrl
                a.download = nameFromPath
                document.body.appendChild(a)
                a.click()
                a.remove()
                setTimeout(() => URL.revokeObjectURL(objUrl), 2000)
              } catch {
                window.open(state.lastImageSrc, '_blank')
              }
            }
          } else {
            try {
              const res = await fetch(state.lastImageSrc)
              const blob = await res.blob()
              const objUrl = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = objUrl
              a.download = nameFromPath
              document.body.appendChild(a)
              a.click()
              a.remove()
              setTimeout(() => URL.revokeObjectURL(objUrl), 2000)
            } catch {
              window.open(state.lastImageSrc, '_blank')
            }
          }
        }
        break
      }
      case 'copy-image-url': {
        if (state.lastImageSrc) {
          try { await navigator.clipboard.writeText(state.lastImageSrc) } catch {}
        }
        break
      }
      case 'open-external': {
        const url = webview?.getURL()
        if (url) {
          if (window.system?.openExternal) {
            window.system.openExternal(url)
          } else {
            window.open(url, '_blank')
          }
        }
        break
      }
      case 'inspect':
        try { webview?.openDevTools?.() } catch {}
        break
    }
  }

  return { show, hide, handleAction }
}
