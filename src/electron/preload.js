const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    drawTheWinner: () => ipcRenderer.invoke('draw-the-winner'),
    onDashboardUpdate: (callback) => {ipcRenderer.on('dashboard-update', (event, data) => {callback(data);});},
    onViewerConfigUpdate: (callback) => ipcRenderer.on("viewer-config-update", (_, data) => callback(data)),
    removeViewerConfigUpdate: (callback) => ipcRenderer.removeListener("viewer-config-update", callback),
});
