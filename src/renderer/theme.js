export async function applyTheme(searchInput) {
  try {
    const theme = await window.themeAPI.get();
    const mica = !!theme?.mica;
    if (mica) {
      document.body.classList.add('mica-enabled');
    } else {
      document.body.classList.remove('mica-enabled');
    }
    if (!theme?.background) return;
    const hex = theme.background.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const lightR = Math.min(255, r + 60);
    const lightG = Math.min(255, g + 60);
    const lightB = Math.min(255, b + 60);

    // Keep body transparent if Mica is enabled; otherwise color the background
    if (!mica) {
      document.body.style.background = `rgb(${r}, ${g}, ${b})`;
    }
    document.documentElement.style.setProperty('--content-bg', `rgba(${r}, ${g}, ${b}, 0.20)`);
  const track = `rgba(${r}, ${g}, ${b}, 0.18)`;
  const thumb = `rgba(${r}, ${g}, ${b}, 0.50)`;
  const thumbHover = `rgba(${r}, ${g}, ${b}, 0.65)`;
  document.documentElement.style.setProperty('--scrollbar-track', track);
  document.documentElement.style.setProperty('--scrollbar-thumb', thumb);
  document.documentElement.style.setProperty('--scrollbar-thumb-hover', thumbHover);

    if (searchInput) {
      searchInput.style.background = `rgba(${r}, ${g}, ${b}, 0.3)`;
      searchInput.style.borderColor = `rgba(${lightR}, ${lightG}, ${lightB}, 0.6)`;
    }

  // Keep bottom bar transparent; do not override with theme background

    const ctxMenu = document.getElementById('context-menu');
    if (ctxMenu) {
      ctxMenu.style.background = `rgba(${r}, ${g}, ${b}, 0.10)`;
      ctxMenu.style.borderColor = `rgba(${lightR}, ${lightG}, ${lightB}, 0.25)`;
    }

    const style = document.createElement('style');
    style.textContent = `
      .search-input:focus, .bottombar:focus {
        background: rgba(${r}, ${g}, ${b}, 0.4) !important;
        border-color: rgba(${lightR}, ${lightG}, ${lightB}, 0.8) !important;
        box-shadow: 0 0 0 2px rgba(${r}, ${g}, ${b}, 0.2) !important;
      }`;
    document.head.appendChild(style);
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
}
