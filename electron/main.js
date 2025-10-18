const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
let MicaBrowserWindow;
try {
  // Only available on Windows; wrapped in try in case native module isn't present
  // eslint-disable-next-line import/no-extraneous-dependencies
  ({ MicaBrowserWindow } = require('mica-electron'));
} catch (_) {
  MicaBrowserWindow = null;
}
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

function readTheme() {
  try {
    const p = path.join(__dirname, '..', 'theme.json');
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return { background: '#000000' };
  }
}

const isDev = !!process.env.VITE_DEV_SERVER_URL;

let mainWindow;
let micaEnabled = false;
const acceptedInsecureHosts = new Set();

function createWindow() {
  const theme = readTheme();
  if (process.platform === 'win32') {
    try { app.setAppUserModelId('cnvrs-browser'); } catch {}
  }
  // Use Mica-enabled window on Windows if available; fall back otherwise
  const WinClass = process.platform === 'win32' && MicaBrowserWindow ? MicaBrowserWindow : BrowserWindow;
  const windowOpts = {
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'icons', 'appicon.png'),
    ...(process.platform === 'win32' ? {
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#00000000',
        symbolColor: '#ffffff',
        height: 34
      }
    } : {
      frame: false
    }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
  // Keep the main renderer unsandboxed to allow the preload to function as intended.
  sandbox: false,
  // Enable webSecurity in production. Dev server often requires relaxed CORS/headers, so keep it off in dev.
  webSecurity: isDev ? false : true
    }
  };
  if (WinClass !== BrowserWindow) {
    // Let the system effect show through any transparent regions
    windowOpts.backgroundColor = '#00000000';
  }
  mainWindow = new WinClass(windowOpts);

  // Apply Mica effect (Windows 11/10) if supported
  if (WinClass !== BrowserWindow && typeof mainWindow.setMicaAcrylicEffect === 'function') {
    try {
      if (typeof mainWindow.setDarkTheme === 'function') mainWindow.setDarkTheme();
      mainWindow.setMicaAcrylicEffect();
      micaEnabled = true;
    } catch (_) {
      micaEnabled = false;
    }
  }

  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  ipcMain.handle('get-theme', () => ({ ...readTheme(), mica: micaEnabled }));
  ipcMain.handle('open-external', async (_event, url) => {
    if (url && typeof url === 'string') {
      try { await shell.openExternal(url); } catch (e) { /* noop */ }
    }
  });

  ipcMain.handle('save-image', async (_event, { url, suggestedName, title }) => {
    if (!url) return false;
    const res = await dialog.showSaveDialog(mainWindow, {
      title: title || (suggestedName ? `Save Image: ${suggestedName}` : 'Save Image'),
      defaultPath: suggestedName || 'image',
      filters: [
        { name: 'Images', extensions: ['png','jpg','jpeg','gif','webp','svg','bmp'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (res.canceled || !res.filePath) return false; 
    const filePath = res.filePath;
    await new Promise((resolve, reject) => {
      try {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (response) => {
          if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            const redirectUrl = new URL(response.headers.location, url).href;
            return client.get(redirectUrl, (resp2) => {
              const file = fs.createWriteStream(filePath);
              resp2.pipe(file);
              file.on('finish', () => file.close(resolve));
              resp2.on('error', reject);
            }).on('error', reject);
          }
          const file = fs.createWriteStream(filePath);
          response.pipe(file);
          file.on('finish', () => file.close(resolve));
          response.on('error', reject);
        }).on('error', reject);
      } catch (e) { reject(e); }
    });
    return true;
  });

  ipcMain.handle('save-image-bytes', async (_event, { dataUrl, suggestedName, title }) => {
    if (!dataUrl) return false;
    const res = await dialog.showSaveDialog(mainWindow, {
      title: title || (suggestedName ? `Save Image: ${suggestedName}` : 'Save Image'),
      defaultPath: suggestedName || 'image',
      filters: [
        { name: 'Images', extensions: ['png','jpg','jpeg','gif','webp','svg','bmp'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (res.canceled || !res.filePath) return false;
    const filePath = res.filePath;
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    await fs.promises.writeFile(filePath, buffer);
    return true;
  });

  mainWindow.once('ready-to-show', () => {
    // Set the zoom factor to 90% for the entire Electron app
    mainWindow.webContents.setZoomFactor(0.9)
    mainWindow.show()
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexHtml);
  }

  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
  const preloadPath = path.join(__dirname, 'webview-preload.js');
  // Harden webview preferences: enable contextIsolation and sandboxing in non-dev environments.
  webPreferences.preload = preloadPath;
  webPreferences.contextIsolation = true;
  webPreferences.nodeIntegration = false;
  webPreferences.sandbox = isDev ? false : true;
  webPreferences.webSecurity = isDev ? false : true;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const { registerProtocols } = require('./protocols.js');
app.whenReady().then(() => {
  registerProtocols();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
