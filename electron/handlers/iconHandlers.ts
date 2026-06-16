import { ipcMain, app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  generateIcoFile,
  createDesktopIni,
  setFileHidden,
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
        } catch (e: any) {
          // Old icon could not be removed — not critical
        }
      }

      // 3. Generate a unique hash based on folder path and current timestamp
      const hashContent = `${folderPath}_${Date.now()}`;
      const hash = crypto.createHash("md5").update(hashContent).digest("hex");

      // 4. Define target .ico path inside userData\icons\
      const iconsDir = path.join(app.getPath("userData"), "icons");
      const icoPath = path.join(iconsDir, `${hash}.ico`);

      // 5. Generate the .ico file
      await generateIcoFile(canvasImageData, 256, 256, icoPath);
      
      // Verify file was created
      try {
        await fs.stat(icoPath);
      } catch (e: any) {
        console.error("[ICON APPLY] ✗ ICO file verification failed:", e.message);
        throw new Error(`ICO file not created at ${icoPath}`);
      }

      // 6. Create desktop.ini in folder
      const desktopIniPath = path.join(folderPath, "desktop.ini");
      await createDesktopIni(folderPath, icoPath);
      
      // Verify desktop.ini was created
      try {
        await fs.stat(desktopIniPath);
      } catch (e: any) {
        console.error("[ICON APPLY] ✗ desktop.ini verification failed:", e.message);
        throw new Error(`desktop.ini not created at ${desktopIniPath}`);
      }

      // 7. Set hidden + system attributes on desktop.ini
      try {
        await setFileHidden(desktopIniPath);
      } catch (e: any) {
        // Could not set attributes — non-critical
      }

      // 8. Folder kept as normal (Explorer requirement)

      // 9. Save customization to SQLite
      db.saveFolderCustomization({
        folderPath,
        icoPath,
        selectedIcon,
        selectedColor,
        appliedDate: new Date().toISOString()
      });

      // Silently notify Windows Shell to redraw the folder icon (handled in background with retries)
      refreshWindowsShell(folderPath).catch(() => {});


      return {
        success: true,
        icoPath,
        message: "Icon applied successfully! Windows Explorer has been refreshed."
      };
    } catch (error: any) {
      console.error("\n" + "=".repeat(70));
      console.error("[ICON APPLY] ✗✗✗ FAILED");
      console.error("[ICON APPLY] Error:", error.message);
      console.error("[ICON APPLY] Stack:", error.stack);
      console.error("=".repeat(70) + "\n");
      
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

      // 3. Folder system attribute no longer used
      // (We don't set it during apply, so no need to unset it during removal)

      // 4. Clean up generated .ico file from AppData
      if (customization && customization.icoPath) {
        await fs.rm(customization.icoPath, { force: true });
      }

      // 5. Delete entry from SQLite
      db.removeFolderCustomization(folderPath);

      // Notify Windows Shell to refresh (handled in background with retries)
      refreshWindowsShell(folderPath).catch(() => {});

      return { success: true, message: "Icon removed successfully!" };
    } catch (error: any) {
      console.error("removeFolderIcon IPC error:", error);
      return { success: false, error: error.message || "Unknown error occurred." };
    }
  });
}
