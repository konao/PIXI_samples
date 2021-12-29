const { app, BrowserWindow } = require("electron");
let win;
function createWindow() {
    win = new BrowserWindow({width: 1400, height: 900, useContentSize: true});
    // win.setContentBounds({x: 100, y: 100, width: 500, height: 400});
    // win.setBounds({x: 100, y: 0, width: 1200, height: 1000});
    // let b = win.getBounds();
    // console.log('aaa');
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
