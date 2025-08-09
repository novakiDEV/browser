const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('themeAPI', {
  get: () => ipcRenderer.invoke('get-theme')
});
contextBridge.exposeInMainWorld('system', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
contextBridge.exposeInMainWorld('files', {
  saveImage: (payload) => ipcRenderer.invoke('save-image', payload),
  saveImageBytes: (payload) => ipcRenderer.invoke('save-image-bytes', payload)
});
