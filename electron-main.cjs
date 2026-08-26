const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: "University Course Weekly Progress Tracker",
    autoHideMenuBar: true,
    backgroundColor: "#0f172a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    icon: path.join(__dirname, "public/icon-512.png")
  });

  const distIndexPath = path.join(__dirname, "dist", "index.html");

  if (fs.existsSync(distIndexPath)) {
    mainWindow.loadFile(distIndexPath).catch((err) => {
      console.error("Failed to load dist/index.html, falling back to local server:", err);
      mainWindow.loadURL("http://localhost:3000");
    });
  } else {
    mainWindow.loadURL("http://localhost:3000");
  }

  // Allow F12 or Ctrl+Shift+I to open DevTools if needed
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i")) {
      mainWindow.webContents.toggleDevTools();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

