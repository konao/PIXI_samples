const { app, BrowserWindow } = require("electron");
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1280, 
        height: 900, 
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadURL(`file://${__dirname}/index.html`);
    win.on("closed", ()=>{win=null;});
}
app.on("ready", createWindow);
app.on("window-all-closed", ()=>{
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", ()=>{
    if (win === null) {
        createWindow();
    }
});
