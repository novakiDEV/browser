const { contextBridge, ipcRenderer } = require('electron');

// Keep the preload surface minimal and validate inputs.
// Exposed contract:
// - theme.get(): Promise<object>
// - system.openExternal(url: string): Promise<void>
// - files.saveImage(url: string, suggestedName?: string, title?: string): Promise<boolean>
// - files.saveImageBytes(dataUrl: string, suggestedName?: string, title?: string): Promise<boolean>

contextBridge.exposeInMainWorld('themeAPI', {
  get: async () => {
    return ipcRenderer.invoke('get-theme');
  }
});

contextBridge.exposeInMainWorld('system', {
  openExternal: async (url) => {
    try {
      if (!url || typeof url !== 'string') return;
      // Basic URL validation
      new URL(url);
      return ipcRenderer.invoke('open-external', url);
    } catch {
      return;
    }
  }
});

contextBridge.exposeInMainWorld('files', {
  saveImage: async (urlOrOptions, suggestedName, title) => {
    try {
      // Accept either (url, suggestedName, title) or ({ url, suggestedName, title })
      let url = null;
      let name = '';
      let t = '';
      if (urlOrOptions && typeof urlOrOptions === 'object') {
        url = String(urlOrOptions.url || '');
        name = String(urlOrOptions.suggestedName || '');
        t = String(urlOrOptions.title || '');
      } else {
        url = String(urlOrOptions || '');
        name = String(suggestedName || '');
        t = String(title || '');
      }
      if (!url) return false;
      // Basic URL validation
      new URL(url);
      return ipcRenderer.invoke('save-image', { url, suggestedName: name, title: t });
    } catch {
      return false;
    }
  },
  saveImageBytes: async (dataUrlOrOptions, suggestedName, title) => {
    try {
      let dataUrl = null;
      let name = '';
      let t = '';
      if (dataUrlOrOptions && typeof dataUrlOrOptions === 'object') {
        dataUrl = String(dataUrlOrOptions.dataUrl || dataUrlOrOptions.url || '');
        name = String(dataUrlOrOptions.suggestedName || '');
        t = String(dataUrlOrOptions.title || '');
      } else {
        dataUrl = String(dataUrlOrOptions || '');
        name = String(suggestedName || '');
        t = String(title || '');
      }
      if (!dataUrl) return false;
      if (!dataUrl.startsWith('data:')) return false;
      return ipcRenderer.invoke('save-image-bytes', { dataUrl, suggestedName: name, title: t });
    } catch {
      return false;
    }
  }
});
