const {app, components, ipcMain, BrowserWindow, screen} = require('electron');

const path = require('path');

let mainWindow;

var invokedWindows = {};
var state = {};

function createWindow() {
    console.log("Creating main application window");
    mainWindow = new BrowserWindow({
        width: 0,
        height: 0,
        frame: false,
        resizable: false,
        backgroundColor: '#000000',
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    mainWindow.loadURL('file://' + __dirname + '/assets/index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.setFullScreen(true);
}

function newWindow(url, fullscreen = false) {
    console.log("Creating a new window with location: " + url)

    windowid = parseInt(Math.random() * 99999999999).toString()

    win = new BrowserWindow({
        width: 0,
        height: 0,
        frame: false,
        resizable: false,
        backgroundColor: '#000000',
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.loadURL(url);
    win.setFullScreen(fullscreen)

    invokedWindows[windowid] = win;

    return windowid;
}

ipcMain.handle('fetchCwd', () => {
    return __dirname
});

ipcMain.handle('cmdExec', (_, data, cb) => {
    console.log("Attempting to execute command:", data);

    const instructions = {
        'oa': {
            runner: (data) => {
                if (data == "" || data == undefined || data == null) {
                    return false
                }
                var id = newWindow(data, true) // "data" should be a url
                invokedWindows[id].show()
                return id
            }
        },
        'ol-disneyplus': {
            runner: async (data) => {
                if (data == "" || data == undefined || data == null) {
                    return false
                }
                var nid = newWindow(data, true) // "data" should be a url
                invokedWindows[nid].show()
                const id = parseInt(Math.random() * 99999999999).toString();
                invokedWindows[nid].webContents.once('ready-to-show', () => {
                    invokedWindows[nid].webContents.executeJavaScript(`
                        const loadElement = document.createElement("div")
                        loadElement.id = "application-loader-text"
                        loadElement.style.color = "white"
                        loadElement.style.width = "100%"
                        loadElement.style.height = "100%"
                        loadElement.style.position = "fixed"
                        loadElement.style.zIndex = "99999999"
                        loadElement.style.top = "0"
                        loadElement.style.left = "0"
                        loadElement.style.background = "black"
                        loadElement.style.display = "flex"
                        loadElement.style.justifyContent = "center"
                        loadElement.style.alignItems = "center"
                        loadElement.style.transition = ".3s"
                        loadElement.style.opacity = "1"
                        loadElement.innerHTML = \`
                            <h1 style="width: 100%; text-align: center;">Disney+ is loading, please wait...</h1>
                        \`
                        document.body.appendChild(loadElement)
                    `, true)
                    .then(d => {
                        console.log(d)
                    });
                    var waiter = setInterval(() => {
                        invokedWindows[nid].setAlwaysOnTop(false)
                        invokedWindows[nid].webContents.executeJavaScript(`
                            document.getElementsByClassName("hero-card").length
                        `, true)
                        .then(d => {
                            if (parseInt(d) > 0) {
                                invokedWindows[nid].webContents.executeJavaScript(`
                                try {
                                    document.getElementById("application-loader-text").style.opacity = "0"
                                    setTimeout(() => {
                                        document.getElementById("application-loader-text").remove()
                                    }. 300)
                                } catch { }
                                `, true);

                                console.log("Disney+ page has finished loading")
                                state[id] = "success"
                                clearInterval(waiter)
                            }
                        });
                    }, 100);
                });
                state[id] = false
                return id
            }
        },
        'ol': {
            runner: async (data) => {
                if (data == "" || data == undefined || data == null) {
                    return false
                }
                var nid = newWindow(data) // "data" should be a url
                const id = parseInt(Math.random() * 99999999999).toString();
                invokedWindows[nid].webContents.once('ready-to-show', () => {
                    console.log("Page finished loading")
                    state[id] = "success"
                });
                state[id] = false
                return id
            }
        },
        'wtl': {
            runner: (data) => {
                if (data === "main") {
                    console.log("Waiting for content on main window to finish loading")
                    mainWindow.webContents.executeJavaScript(`
                        return document.readyState
                    `, true)
                    .then(d => {
                        console.log(d)
                    });
                }
            }
        },
        'cw': {
            runner: (data) => {
                if (data == "" || data == undefined || data == null) {
                    return false
                }
                if (!Object.keys(invokedWindows).includes(data)) {
                    return false
                }
                invokedWindows[data].close();
            }
        },
        'chkid': {
            runner: (data) => {
                if (Object.keys(state).includes(data)) {
                    return state[data]
                }
                return false
            }
        }
    }

    if (Object.keys(instructions).includes(data.instruction)) {
        const res = instructions[data.instruction].runner(data.data)
        if (!res) {
            return "Failed to run: instruction returned a failed state"
        }
        return res
    } else {
        return "Failed to run: instruction not found"
    }
});

ipcMain.handle('ping', (event, msg) => {
    return "pong"
});

app.whenReady().then(async () => {
    try {
        await components.whenReady().catch(err => console.log(`component ready fail:`, err));
        console.log('components ready:', components.status());
    } catch {
        console.warn("Detected errors loading Widevine CDM, encrypted video may not load correctly")
    }
    createWindow();
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});