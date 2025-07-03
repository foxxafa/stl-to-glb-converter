// preload.js

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer to Main
  saveState: (state) => ipcRenderer.send('save-state', state),
  confirmLoadState: () => ipcRenderer.send('confirm-load-state'),
  denyLoadState: () => ipcRenderer.send('deny-load-state'),
  deleteCachedFile: (filePath) => ipcRenderer.send('delete-cached-file', filePath),
  
  // Main to Renderer
  onLoadState: (callback) => ipcRenderer.on('load-state', (_event, value) => callback(value)),
  onAskToLoadState: (callback) => ipcRenderer.on('ask-to-load-state', callback),
  onStateReady: (callback) => ipcRenderer.on('state-ready', callback),

  // Renderer to Main (Invoke for response)
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  cacheFile: (sourcePath) => ipcRenderer.invoke('cache-file', sourcePath),
  cacheFileData: (fileName, arrayBuffer) => ipcRenderer.invoke('cache-file-data', fileName, arrayBuffer)
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
