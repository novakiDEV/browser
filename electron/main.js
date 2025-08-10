const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
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
const acceptedInsecureHosts = new Set();

function createWindow() {
  const theme = readTheme();
  if (process.platform === 'win32') {
    try { app.setAppUserModelId('cnvrs-browser'); } catch {}
  }
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'icons', 'appicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
      webSecurity: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  ipcMain.handle('get-theme', () => readTheme());
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

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexHtml);
  }

  mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    const preloadPath = path.join(__dirname, 'webview-preload.js');
    webPreferences.preload = preloadPath;
    webPreferences.contextIsolation = false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// Allow proceeding on specific certificate errors (dev-only prompt). Unsafe if misused.
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  try {
    const host = new URL(url).host;
    if (acceptedInsecureHosts.has(host)) {
      event.preventDefault();
      return callback(true);
    }
    if (isDev) {
      event.preventDefault();
      // Ask once per host
      dialog.showMessageBox(mainWindow || BrowserWindow.getFocusedWindow(), {
        type: 'warning',
        buttons: ['Continue (unsafe)', 'Cancel'],
        defaultId: 1,
        cancelId: 1,
        title: 'Certificate error',
        message: `The certificate for ${host} is invalid: ${error}.`,
        detail: 'Only continue if you trust this site. This exception applies for this session only.'
      }).then(res => {
        if (res.response === 0) {
          acceptedInsecureHosts.add(host);
          callback(true);
        } else {
          callback(false);
        }
      }).catch(() => callback(false));
    } else {
      callback(false);
    }
  } catch {
    callback(false);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
