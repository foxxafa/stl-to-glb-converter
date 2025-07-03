const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// --- State Management ---
const stateFilePath = path.join(app.getPath('userData'), 'state.json');

function saveState(state) {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

function loadState() {
  try {
    if (fs.existsSync(stateFilePath)) {
      const stateData = fs.readFileSync(stateFilePath, 'utf-8');
      return JSON.parse(stateData);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return null;
}

function deleteStateFile() {
  try {
    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
    }
  } catch (error) {
    console.error('Failed to delete state file:', error);
  }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  // Ask renderer to load state if it exists
  win.webContents.on('did-finish-load', () => {
    const state = loadState();
    // Only ask if a state exists and has models
    if (state && state.length > 0) {
      win.webContents.send('ask-to-load-state');
    }
  });
}

app.whenReady().then(() => {
  // --- IPC Listeners ---
  ipcMain.on('save-state', (event, state) => {
    saveState(state);
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      // For STLLoader, we need an ArrayBuffer
      const buffer = fs.readFileSync(filePath);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch (error) {
      console.error('Failed to read file:', filePath, error);
      return null;
    }
  });

  ipcMain.on('confirm-load-state', (event) => {
    const state = loadState();
    if (state) {
      event.sender.send('load-state', state);
    }
  });

  ipcMain.on('deny-load-state', (event) => {
    deleteStateFile();
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
