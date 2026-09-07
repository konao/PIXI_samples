// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // メインプロセスに 'get-data' という名前でデータを請求する
  getData: () => ipcRenderer.invoke('get-data')
});
