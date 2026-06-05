import { ipcMain, app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  generateIcoFile,
  createDesktopIni,
  setFileHidden,
  setFolderSystem,
  unsetFolderSystem,
  refreshWindowsShell
} from "../windowsIconManager.js";

export function registerIconHandlers(db: any) {
  // IPC Handler to Apply Folder Icon
  ipcMain.handle("applyFolderIcon", async (_event, data) => {
    try {
      const { folderPath, canvasImageData, selectedIcon, selectedColor } = data;

      if (!folderPath || !folderPath.trim()) {
        throw new Error("Folder path cannot be empty.");
      }

      // 1. Verify folder exists
      const stat = await fs.stat(folderPath);
      if (!stat.isDirectory()) {
        throw new Error("The target path is not a valid directory.");
      }

      // 2. Clean up previous .ico file to avoid bloating and cache reuse
      const existing = db.getFolderCustomization(folderPath);
      if (existing && existing.icoPath) {
        try {
          await fs.rm(existing.icoPath, { force: true });
        } catch (e) {
          // Ignore if old icon is missing
        }
      }

      // 3. Generate a unique hash based on folder path and current timestamp
      // This forces Windows Explorer to treat the new icon file path as unique, bypassing the shell icon cache
      const hashContent = `${folderPath}_${Date.now()}`;
      const hash = crypto.createHash("md5").update(hashContent).digest("hex");

      // 4. Define target .ico path inside userData\icons\
      const iconsDir = path.join(app.getPath("userData"), "icons");
      const icoPath = path.join(iconsDir, `${hash}.ico`);

      // 5. Generate the .ico file
      await generateIcoFile(canvasImageData, 256, 256, icoPath);

      // 6. Create desktop.ini in folder
      await createDesktopIni(folderPath, icoPath);

      // 7. Set hidden + system attributes on desktop.ini
      const desktopIniPath = path.join(folderPath, "desktop.ini");
      await setFileHidden(desktopIniPath);

      // 8. Make the folder a system folder (critical for Windows to load desktop.ini)
      await setFolderSystem(folderPath);

      // 9. Save customization to SQLite
      db.saveFolderCustomization({
        folderPath,
        icoPath,
        selectedIcon,
        selectedColor,
        appliedDate: new Date().toISOString()
      });

      // Save debug PNG preview to workspace
      if (data.canvasDataUrl) {
        try {
          const base64Data = data.canvasDataUrl.replace(/^data:image\/png;base64,/, "");
          const debugPngPath = path.join(process.cwd(), "debug-preview.png");
          await fs.writeFile(debugPngPath, base64Data, "base64");
        } catch (e) {
          console.error("Failed to save debug preview PNG:", e);
        }
      }

      // Wait 1s to let the OS flush attributes and desktop.ini writes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Silently notify Windows Shell to redraw the folder icon
      await refreshWindowsShell(folderPath);

      return {
        success: true,
        icoPath,
        message: "Icon applied successfully! Windows Explorer has been refreshed."
      };
    } catch (error: any) {
      console.error("applyFolderIcon IPC error:", error);
      return { success: false, error: error.message || "Unknown error occurred." };
    }
  });

  // IPC Handler to Remove/Reset Folder Icon
  ipcMain.handle("removeFolderIcon", async (_event, folderPath) => {
    try {
      if (!folderPath || !folderPath.trim()) {
        throw new Error("Folder path cannot be empty.");
      }

      // 1. Get the customization from DB to locate the icon file
      const customization = db.getFolderCustomization(folderPath);

      // 2. Clear attributes and delete desktop.ini
      const desktopIniPath = path.join(folderPath, "desktop.ini");
      try {
        const { execFile } = await import("node:child_process");
        const { promisify } = await import("node:util");
        await promisify(execFile)("attrib", ["-h", "-s", desktopIniPath]);
        await fs.rm(desktopIniPath, { force: true });
      } catch (e) {
        // Ignore if desktop.ini doesn't exist
      }

      // 3. Remove folder system attribute so it reverts to normal look
      try {
        await unsetFolderSystem(folderPath);
      } catch (e) {
        // Ignore
      }

      // 4. Clean up generated .ico file from AppData
      if (customization && customization.icoPath) {
        await fs.rm(customization.icoPath, { force: true });
      }

      // 5. Delete entry from SQLite
      db.removeFolderCustomization(folderPath);

      // Wait 1s to let the OS flush attribute removals
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Notify Windows Shell to refresh
      await refreshWindowsShell(folderPath);

      return { success: true, message: "Icon removed successfully!" };
    } catch (error: any) {
      console.error("removeFolderIcon IPC error:", error);
      return { success: false, error: error.message || "Unknown error occurred." };
    }
  });
}
