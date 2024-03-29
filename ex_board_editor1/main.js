const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1400,
        height: 900,
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // win.setContentBounds({x: 100, y: 100, width: 500, height: 400});
    // win.setBounds({x: 100, y: 0, width: 1200, height: 1000});
    // let b = win.getBounds();
    // console.log('aaa');
    win.loadURL(`file://${__dirname}/index.html`);
    win.on("closed", () => { win = null; });

    // ここを有効にするとデバッガウィンドウが開く
    // win.webContents.openDevTools();

    const template = Menu.buildFromTemplate([
        {
            label: "ファイル",
            submenu: [
                { role: 'close', label: 'ウィンドウを閉じる' },
                {
                    label: 'マップロード', click() {
                        dialog.showOpenDialog(win, {
                            title: 'マップデータロード',
                            filters: [
                                { name: 'mapData', extensions: 'json' }
                            ]
                        }).then(({filePaths, canceled}) => {
                            if (!canceled) {
                                if (filePaths.length > 0) {
                                    const filePath = filePaths[0];
                                    console.log(filePath);
                                    fs.readFile(filePath, { encoding: 'utf8' }, (err, text) => {
                                        if (err) {
                                            console.log('[ERROR] load failed');
                                        } else {
                                            const data = JSON.parse(text);
                                            console.log(JSON.stringify(data, null, 2));
                                            console.log('load ok');
    
                                            // メインプロセスからレンダラープロセスへの通信関連
                                            // https://sourcechord.hatenablog.com/entry/2015/11/03/124814
                                            // https://webbibouroku.com/Blog/Article/electron-ipc
                                            // https://qiita.com/Quantum/items/4841aa18643b8ef1fc11
                                            win.webContents.send('mapLoadClicked', data);
                                        }
                                    });    
                                }
                            } else {
                                console.log('load canceled');
                            }
                        })
                    }
                },
                {
                    label: 'マップセーブ', click() {
                        win.webContents.send('mapSaveClicked', 'msg from main: mapSave clicked');
                    }
                }
            ]
        },
        {
            label: "編集",
            submenu: [
                { role: 'undo', label: '元に戻す' },
                { role: 'redo', label: 'やり直す' },
                { type: 'separator' },
                { role: 'cut', label: '切り取り' },
                { role: 'copy', label: 'コピー' },
                { role: 'paste', label: '貼り付け' },
            ]
        },
        {
            label: "システム",
            submenu: [
                { role: 'reload', label: 'Reload' },
                { role: 'toggleDevTools', label: 'ToggleDevTools' }
            ]
        }
    ]);
    win.setMenu(template);
}
// Menu.setApplicationMenu(template);
app.on("ready", createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

ipcMain.on("mapSaveData", (event, saveData) => {
    // マップセーブメニューをクリックすると、レンダラープロセスがマップデータをjson化して送るので、
    // それをここで受け取る．
    // メインプロセスはnode.jsのファイル操作関連APIが使えるので、ここでマップデータをファイルにセーブする．
    // console.log("ipcMain: mapSaveData");
    const jsonSaveData = JSON.stringify(saveData, null, 2);

    dialog.showSaveDialog(win, {
        title: 'マップデータ保存',
        filters: [
            { name: 'mapData', extensions: 'json' }
        ]
    }).then(({filePath, canceled}) => {
        if (!canceled) {
            console.log(filePath);
            fs.writeFile(filePath, jsonSaveData, (err) => {
                if (err) {
                    console.log('[ERROR] write failed');
                } else {
                    console.log('save ok');
                }
            });
        } else {
            console.log('save canceled');
        }
    })
})
