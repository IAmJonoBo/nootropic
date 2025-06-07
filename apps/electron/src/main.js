import { app, BrowserWindow } from "electron";
import { Logger } from "@nootropic/shared";
/**
 * @todo Implement Electron main process
 * - Create main window
 * - Set up IPC communication
 * - Handle app lifecycle
 * - Configure security
 */
const logger = new Logger();
async function createWindow() {
  // TODO: Create main window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // TODO: Load app URL
  await mainWindow.loadURL("http://localhost:3000");
  logger.info("Main window created");
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
//# sourceMappingURL=main.js.map
