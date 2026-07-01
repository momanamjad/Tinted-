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

      // 2. Read database settings to check keepIconCopy preference
      const settings = db.getSettings();
      const keepIconCopy = settings.keepIconCopy;

      // 3. Clean up previous .ico file to avoid bloating and cache reuse
      const existing = db.getFolderCustomization(folderPath);
      if (existing && existing.icoPath) {
        try {
          await fs.rm(existing.icoPath, { force: true });
        } catch (e: any) {
          // Old icon could not be removed — not critical
        }
      }

      // 4. Generate a unique hash based on folder path and current timestamp
      const hashContent = `${folderPath}_${Date.now()}`;
      const hash = crypto.createHash("md5").update(hashContent).digest("hex");

      let icoPath = "";
      let desktopIniContent = "";

      if (keepIconCopy) {
        // Save the .ico inside the folder itself in a hidden ".tintd-icons" folder
        const localIconDir = path.join(folderPath, ".tintd-icons");
        await fs.mkdir(localIconDir, { recursive: true });
        icoPath = path.join(localIconDir, `folder-${hash}.ico`);

        // Hide localIconDir
        try {
          const { execFile } = await import("node:child_process");
          const { promisify } = await import("node:util");
          await promisify(execFile)("attrib", ["+h", localIconDir]);
        } catch (e) {}

        // Use absolute path in desktop.ini to support virtual namespaces like Desktop
        desktopIniContent = `\uFEFF[.ShellClassInfo]\r\nIconResource=${icoPath},0\r\nIconFile=${icoPath}\r\nIconIndex=0\r\n`;
      } else {
        // Save in AppData
        const iconsDir = path.join(app.getPath("userData"), "icons");
        await fs.mkdir(iconsDir, { recursive: true });
        icoPath = path.join(iconsDir, `${hash}.ico`);

        // Use absolute path in desktop.ini
        desktopIniContent = `\uFEFF[.ShellClassInfo]\r\nIconResource=${icoPath},0\r\nIconFile=${icoPath}\r\nIconIndex=0\r\n`;
      }

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
      try {
        const { execFile } = await import("node:child_process");
        const { promisify } = await import("node:util");
        await promisify(execFile)("attrib", ["-h", "-s", desktopIniPath]);
      } catch (e: any) {}

      await fs.writeFile(desktopIniPath, desktopIniContent, "utf8");
      
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

      // 8. Explicitly apply Read-only and System attributes to the folder itself
      // Windows Explorer REQUIRES a folder to be Read-only (+r) or System (+s) to read desktop.ini
      try {
        const { execFile } = await import("node:child_process");
        const { promisify } = await import("node:util");
        await promisify(execFile)("attrib", ["+r", "+s", folderPath]);
      } catch (e: any) {
        console.error("[ICON APPLY] ✗ Error setting folder attributes (+r +s):", e.message);
      }

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

      // Schedule a final refresh in exactly 60 seconds (60000ms) to guarantee that Explorer repaints
      // after the OS cache has fully stabilized/rebuilt.
      setTimeout(() => {
        refreshWindowsShell(folderPath).catch(() => {});
      }, 60000);

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

      // 3. Remove System/Read-only attributes from the folder itself
      try {
        const { execFile } = await import("node:child_process");
        const { promisify } = await import("node:util");
        await promisify(execFile)("attrib", ["-r", "-s", folderPath]);
      } catch (e) {}

      // 4. Clean up generated .ico file
      if (customization && customization.icoPath) {
        try {
          await fs.rm(customization.icoPath, { force: true });
        } catch (e) {}
      }

      // Clean up local .tintd-icons directory if it exists
      const localIconDir = path.join(folderPath, ".tintd-icons");
      try {
        await fs.rm(localIconDir, { recursive: true, force: true });
      } catch (e) {}

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
