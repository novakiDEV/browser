import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example API methods (you can expand these as needed)
  platform: process.platform,
  
  // IPC communication methods
  send: (channel: string, data: any) => {
    // Whitelist channels for security
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  receive: (channel: string, func: Function) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Remove the listener to avoid memory leaks
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },

  // App control methods
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
});

// Add type declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      platform: string;
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: Function) => void;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
    };
  }
}
