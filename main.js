const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// --- State Management ---
const userDataPath = app.getPath('userData');
const stateFilePath = path.join(userDataPath, 'state.json');
const cacheFolderPath = path.join(userDataPath, 'stl_cache');

console.log(`[Main Process] State file path is: ${stateFilePath}`);
console.log(`[Main Process] Cache folder path is: ${cacheFolderPath}`);

// Ensure cache directory exists
if (!fs.existsSync(cacheFolderPath)) {
    fs.mkdirSync(cacheFolderPath);
}

function saveState(state) {
  try {
    console.log('[Main Process] Saving state to file...');
    console.log('[Main Process] State content being saved:', JSON.stringify(state, null, 2));
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
    console.log('[Main Process] State saved successfully.');
  } catch (error) {
    console.error('[Main Process] Failed to save state:', error);
  }
}

function loadState() {
  try {
    if (fs.existsSync(stateFilePath)) {
      console.log('[Main Process] Found state file. Reading...');
      const stateData = fs.readFileSync(stateFilePath, 'utf-8');
      const state = JSON.parse(stateData);
      console.log('[Main Process] State loaded successfully. Content:', JSON.stringify(state, null, 2));
      return state;
    } else {
      console.log('[Main Process] No state file found.');
    }
  } catch (error) {
    console.error('[Main Process] Failed to load state:', error);
  }
  return null;
}

function deleteStateFile() {
  try {
    if (fs.existsSync(stateFilePath)) {
      console.log('[Main Process] Deleting state file.');
      fs.unlinkSync(stateFilePath);
      // Also clear the cache when starting fresh
      fs.readdirSync(cacheFolderPath).forEach(file => {
          try {
              fs.unlinkSync(path.join(cacheFolderPath, file));
          } catch (err) {
              console.error(`Failed to delete cached file ${file}:`, err);
          }
      });
      console.log('[Main Process] Cache cleared.');
    }
  } catch (error) {
    console.error('[Main Process] Failed to delete state file:', error);
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

  // Automatically open DevTools for debugging has been removed for now.
  // win.webContents.openDevTools();

  // Ask renderer to load state if it exists
  win.webContents.on('did-finish-load', () => {
    const state = loadState();
    // Only ask if a state exists and has models
    if (state && state.length > 0) {
      console.log('[Main Process] State file has data. Asking renderer to show load prompt.');
      win.webContents.send('ask-to-load-state');
    } else {
      // If no state, tell the renderer it's ready to start fresh.
      win.webContents.send('state-ready');
    }
  });
}

app.whenReady().then(() => {
  // --- IPC Listeners ---
  ipcMain.on('save-state', (event, state) => {
    console.log('[Main Process] Received save-state request from renderer.');
    saveState(state);
  });

  ipcMain.handle('cache-file', (event, sourcePath) => {
      console.log(`[Main Process] cache-file request received for: ${sourcePath}`);
      if (!fs.existsSync(sourcePath)) {
          console.error(`[Main Process] cache-file: Source file does not exist at ${sourcePath}`);
          return null;
      }
      try {
          const uniqueId = `${Date.now()}-${path.basename(sourcePath)}`;
          const cachedPath = path.join(cacheFolderPath, uniqueId);
          fs.copyFileSync(sourcePath, cachedPath);
          console.log(`[Main Process] Successfully copied ${sourcePath} to ${cachedPath}`);
          return cachedPath;
      } catch (error) {
          console.error(`[Main Process] Failed to cache file ${sourcePath}:`, error);
          return null;
      }
  });

  ipcMain.on('delete-cached-file', (event, filePath) => {
      if (filePath && fs.existsSync(filePath)) {
          try {
              fs.unlinkSync(filePath);
              console.log(`[Main Process] Deleted cached file: ${filePath}`);
          } catch (error) {
              console.error(`[Main Process] Failed to delete cached file ${filePath}:`, error);
          }
      }
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
    console.log('[Main Process] User confirmed to load previous state. Loading and sending to renderer.');
    const state = loadState();
    if (state) {
      event.sender.send('load-state', state);
    }
  });

  ipcMain.on('deny-load-state', (event) => {
    console.log('[Main Process] User denied loading previous state. Deleting old state file.');
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
