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
    fs.mkdirSync(cacheFolderPath, { recursive: true });
}

// Function to ensure cache directory exists before any operation
function ensureCacheDirectory() {
    if (!fs.existsSync(cacheFolderPath)) {
        console.log('[Main Process] Creating cache directory...');
        fs.mkdirSync(cacheFolderPath, { recursive: true });
    }
}

function saveState(state) {
  try {
    ensureCacheDirectory(); // Ensure cache dir exists before saving
    console.log('[Main Process] Saving state to file...');
    // The state object now includes models and transparencyMode
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
      let state = JSON.parse(stateData);
      
      // Migration for old state format (array of models)
      if (Array.isArray(state)) {
        console.log('[Main Process] Migrating old state format...');
        state = {
          models: state,
          transparencyMode: 'hash' // Default to stable mode
        };
      }
      
      // Fix old file paths that might have spaces
      if (state.models) {
        state.models = state.models.map(item => {
          if (item.filePath) {
            const dir = path.dirname(item.filePath);
            const filename = path.basename(item.filePath);
            const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
            
            const sanitizedPath = path.join(dir, sanitizedFilename);
            if (!fs.existsSync(item.filePath) && fs.existsSync(sanitizedPath)) {
              console.log(`[Main Process] Fixing path: ${item.filePath} -> ${sanitizedPath}`);
              item.filePath = sanitizedPath;
            }
          }
          return item;
        });
      }
      
      console.log('[Main Process] State loaded successfully.');
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
    // Attempt to delete the state file, don't fail if it doesn't exist.
    if (fs.existsSync(stateFilePath)) {
      console.log('[Main Process] Deleting state file.');
      fs.unlinkSync(stateFilePath);
    } else {
      console.log('[Main Process] No state file to delete.');
    }

    // Attempt to clear the cache folder.
    ensureCacheDirectory(); // Make sure the folder exists before trying to read it.
    if (fs.existsSync(cacheFolderPath)) {
      console.log('[Main Process] Clearing cache folder...');
      const files = fs.readdirSync(cacheFolderPath);
      files.forEach(file => {
          try {
              fs.unlinkSync(path.join(cacheFolderPath, file));
          } catch (err) {
              console.error(`[Main Process] Failed to delete cached file ${file}:`, err);
          }
      });
      console.log(`[Main Process] Cache cleared. ${files.length} files deleted.`);
    }
  } catch (error) {
    console.error('[Main Process] Failed to delete state or cache:', error);
  }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "STL2GLB",
    icon: path.join(__dirname, 'GLBICON.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      allowRunningInsecureContent: true,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  win.loadFile('index.html');

  // Automatically open DevTools for debugging has been removed for now.
  // win.webContents.openDevTools();

  // Ask renderer to load state if it exists
  win.webContents.on('did-finish-load', () => {
    const state = loadState();
    // Only ask if a state exists and has models
    if (state && state.models && state.models.length > 0) {
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

  ipcMain.handle('cache-file-data', (event, fileName, arrayBuffer) => {
      console.log(`[Main Process] cache-file-data request received for: ${fileName}`);
      try {
          ensureCacheDirectory(); // Ensure cache directory exists
          
          // Sanitize filename - remove/replace problematic characters
          const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const uniqueId = `${Date.now()}-${sanitizedFileName}`;
          const cachedPath = path.join(cacheFolderPath, uniqueId);
          
          // Convert ArrayBuffer to Buffer and write to file
          const buffer = Buffer.from(arrayBuffer);
          fs.writeFileSync(cachedPath, buffer);
          
          console.log(`[Main Process] Successfully cached file data for ${fileName} (as ${sanitizedFileName}) to ${cachedPath}`);
          return cachedPath;
      } catch (error) {
          console.error(`[Main Process] Failed to cache file data for ${fileName}:`, error);
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

  ipcMain.handle('list-cache-files', (event) => {
      try {
          ensureCacheDirectory();
          const files = fs.readdirSync(cacheFolderPath);
          console.log(`[Main Process] Cache files: ${files.join(', ')}`);
          return files;
      } catch (error) {
          console.error('[Main Process] Failed to list cache files:', error);
          return [];
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
    // Also tell renderer it's ready to start fresh, otherwise it might wait.
    event.sender.send('state-ready');
  });

  ipcMain.on('reset-app', (event) => {
    console.log('[Main Process] User requested to reset the application.');
    deleteStateFile();
    event.sender.send('reset-complete');
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
