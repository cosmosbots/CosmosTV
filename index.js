const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
    console.log("Creating main application window");
    mainWindow = new BrowserWindow({
        width: 0,
        height: 0,
        frame: false,
        resizable: false,
        backgroundColor: '#000000',
    });
    mainWindow.loadURL('file://' + __dirname + '/assets/index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.setFullScreen(true);
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});