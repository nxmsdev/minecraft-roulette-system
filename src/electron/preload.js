const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    drawTheWinner: () => ipcRenderer.invoke('draw-the-winner'),
    onDashboardUpdate: (callback) => {ipcRenderer.on('dashboard-update', (event, data) => {callback(data);});},
    onLastWinnerUpdate: (callback) => {ipcRenderer.on('last-winner-update', (event, data) => {callback(data);});},
    onBestWinnersUpdate: (callback) => {ipcRenderer.on('best-winners-update', (event, data) => {callback(data);});},
    onLuckyGuysUpdate: (callback) => {ipcRenderer.on('lucky-guys-update', (event, data) => {callback(data);});},
    onViewerConfigUpdate: (callback) => ipcRenderer.on("viewer-config-update", (_, data) => callback(data)),
    removeViewerConfigUpdate: (callback) => ipcRenderer.removeListener("viewer-config-update", callback),
    onTranslationsUpdate: (callback) => ipcRenderer.on("translations-update", (_, data) => callback(data)),
});
