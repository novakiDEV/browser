const { app, BrowserWindow } = require('electron');
const path = require('path');


let mainWindow;


function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'app.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f0f11',
      symbolColor: '#6b6f7c',
      height: 32
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });


  mainWindow.loadFile('index.html');


  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }


  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}



app.whenReady().then(createWindow);


app.on('window-all-closed', function () {

  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {

  if (mainWindow === null) createWindow();
});
