// Electron Preload Script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  getVersion: () => '2.5.0',
  printDocument: () => ipcRenderer.invoke('print-document'),
});
