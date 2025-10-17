export function attachWebviewHandlers(webview, onNavigated, onFavicons) {
  if (!webview) return
  const statusEl = document.getElementById('status-center')
  const loadbar = document.getElementById('loadbar')
  const setProgress = (p) => { if (loadbar) loadbar.style.setProperty('--loadbar-progress', `${Math.max(0, Math.min(100, p))}%`) }
  const setStatus = (text) => { if (statusEl) { statusEl.textContent = text || ''; statusEl.style.opacity = text ? '1' : '0'; } }
  webview.addEventListener('new-window', (e) => {
    if (e?.url) webview.src = e.url
  })
  webview.addEventListener('ipc-message', (e) => {
    if (e.channel === 'open-url' && e.args && e.args[0]?.url) {
      const next = e.args[0].url
      if (next) webview.src = next
    } else if (e.channel === 'favicons' && e.args && e.args[0]?.icons) {
      onFavicons?.(e.args[0].icons)
    } else if (e.channel === 'hover-link') {
      const href = e.args && e.args[0] ? e.args[0].href : null
      setStatus(href || '')
    } else if (e.channel === 'load-progress') {
      setProgress(10)
    }
  })
  ;['will-navigate', 'did-navigate', 'did-start-loading', 'did-stop-loading']
    .forEach(ev => webview.addEventListener(ev, () => {}))

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

  // Handle system color scheme preference by injecting JavaScript
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const updateColorScheme = () => {
    const isDark = mediaQuery.matches
    const scheme = isDark ? 'dark' : 'light'
    try {
      // Inject CSS color-scheme property
      webview.insertCSS(`html { color-scheme: ${scheme}; }`)
      
      // Inject JavaScript to modify the page for dark/light mode
      const script = `
        (function() {
          // Set data attributes that websites can detect
          document.documentElement.setAttribute('data-theme', '${scheme}');
          document.documentElement.setAttribute('data-color-scheme', '${scheme}');
          
          // Dispatch custom event for websites to listen to
          window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: '${scheme}', dark: ${isDark} }
          }));
          
          // Some sites check for this class
          document.documentElement.classList.toggle('dark-theme', ${isDark});
          document.documentElement.classList.toggle('light-theme', !${isDark});
          
          // Override media query if site doesn't respect color-scheme
          if (window.matchMedia) {
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = function(query) {
              if (query === '(prefers-color-scheme: dark)') {
                return { matches: ${isDark}, media: query, addListener: function(){}, removeListener: function(){} };
              }
              if (query === '(prefers-color-scheme: light)') {
                return { matches: ${!isDark}, media: query, addListener: function(){}, removeListener: function(){} };
              }
              return originalMatchMedia.call(this, query);
            };
          }
        })();
      `
      webview.executeJavaScript(script)
    } catch {}
  }
  
  webview.addEventListener('dom-ready', updateColorScheme)
  mediaQuery.addEventListener('change', updateColorScheme)

  webview.addEventListener('did-start-loading', () => { setProgress(15); setStatus('') })
  webview.addEventListener('did-stop-loading', () => { setProgress(100); setTimeout(() => setProgress(0), 500) })
}
