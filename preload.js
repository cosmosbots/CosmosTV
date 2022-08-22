const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  pingBackend: (d) => ipcRenderer.invoke('ping', d),
  cwd: () => ipcRenderer.invoke('fetchCwd'),
  executeCommand: async (instruction, data) => {
    return await ipcRenderer.invoke('cmdExec', {
      instruction: instruction,
      data: data
    });
  }
});