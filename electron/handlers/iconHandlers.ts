import { ipcMain, app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  generateIcoFile,
  createDesktopIni,
  setFileHidden,
  setFolderSystem,
  refreshWindowsShell
} from "../windowsIconManager.js";

export function registerIconHandlers(db: any) {
  // IPC Handler to Apply Folder Icon
  ipcMain.handle("applyFolderIcon", async (_event, data) => {
    console.log("\n" + "=".repeat(70));
    console.log("[ICON APPLY] ===== NEW ICON APPLICATION CALL =====");
    console.log("=".repeat(70));
    
    try {
      const { folderPath, canvasImageData, selectedIcon, selectedColor } = data;

      console.log("[ICON APPLY] Input validation:");
      console.log("[ICON APPLY]   folderPath:", folderPath);
      console.log("[ICON APPLY]   selectedIcon:", selectedIcon);
      console.log("[ICON APPLY]   selectedColor:", selectedColor);
      console.log("[ICON APPLY]   canvasImageData length:", canvasImageData?.length || 0);

      if (!folderPath || !folderPath.trim()) {
        throw new Error("Folder path cannot be empty.");
      }

      // 1. Verify folder exists
      console.log("[ICON APPLY] Step 1: Checking if folder exists...");
      const stat = await fs.stat(folderPath);
      console.log("[ICON APPLY] ✓ Folder exists, isDirectory:", stat.isDirectory());
      
      if (!stat.isDirectory()) {
        throw new Error("The target path is not a valid directory.");
      }

      // 2. Clean up previous .ico file to avoid bloating and cache reuse
      console.log("[ICON APPLY] Step 2: Checking for existing customization...");
      const existing = db.getFolderCustomization(folderPath);
      if (existing && existing.icoPath) {
        console.log("[ICON APPLY]   Found existing icon:", existing.icoPath);
        try {
          await fs.rm(existing.icoPath, { force: true });
          console.log("[ICON APPLY] ✓ Old icon removed");
        } catch (e: any) {
          console.log("[ICON APPLY]   Warning: Could not remove old icon:", e.message);
        }
      } else {
        console.log("[ICON APPLY]   No existing customization found");
      }

      // 3. Generate a unique hash based on folder path and current timestamp
      console.log("[ICON APPLY] Step 3: Generating unique hash...");
      const hashContent = `${folderPath}_${Date.now()}`;
      const hash = crypto.createHash("md5").update(hashContent).digest("hex");
      console.log("[ICON APPLY] ✓ Hash generated:", hash);

      // 4. Define target .ico path inside userData\icons\
      console.log("[ICON APPLY] Step 4: Setting up icon directory...");
      const iconsDir = path.join(app.getPath("userData"), "icons");
      console.log("[ICON APPLY]   Icons dir:", iconsDir);
      const icoPath = path.join(iconsDir, `${hash}.ico`);
      console.log("[ICON APPLY] ✓ Target ico path:", icoPath);

      // 5. Generate the .ico file
      console.log("[ICON APPLY] Step 5: Generating ICO file...");
      console.log("[ICON APPLY]   Canvas data size:", canvasImageData?.length);
      await generateIcoFile(canvasImageData, 256, 256, icoPath);
      console.log("[ICON APPLY] ✓ ICO file generated");
      
      // Verify file was created
      try {
        const icoStats = await fs.stat(icoPath);
        console.log("[ICON APPLY] ✓ ICO file verified, size:", icoStats.size, "bytes");
      } catch (e: any) {
        console.error("[ICON APPLY] ✗ ICO file verification failed:", e.message);
        throw new Error(`ICO file not created at ${icoPath}`);
      }

      // 6. Create desktop.ini in folder
      console.log("[ICON APPLY] Step 6: Creating desktop.ini...");
      const desktopIniPath = path.join(folderPath, "desktop.ini");
      console.log("[ICON APPLY]   desktop.ini path:", desktopIniPath);
      await createDesktopIni(folderPath, icoPath);
      console.log("[ICON APPLY] ✓ desktop.ini created");
      
      // Verify desktop.ini was created
      try {
        const iniStats = await fs.stat(desktopIniPath);
        const iniContent = await fs.readFile(desktopIniPath, "utf8");
        console.log("[ICON APPLY] ✓ desktop.ini verified, size:", iniStats.size, "bytes");
        console.log("[ICON APPLY]   Content preview:", iniContent.substring(0, 100));
      } catch (e: any) {
        console.error("[ICON APPLY] ✗ desktop.ini verification failed:", e.message);
        throw new Error(`desktop.ini not created at ${desktopIniPath}`);
      }

      // 7. Set hidden + system attributes on desktop.ini
      console.log("[ICON APPLY] Step 7: Setting file attributes on desktop.ini...");
      try {
        await setFileHidden(desktopIniPath);
        console.log("[ICON APPLY] ✓ desktop.ini attributes set (hidden + system)");
      } catch (e: any) {
        console.warn("[ICON APPLY]   Warning: Could not set attributes:", e.message);
      }

      // 8. Folder kept as normal (Explorer requirement)
      console.log("[ICON APPLY] Step 8: Folder kept as normal (not system) for Explorer compatibility");

      // 9. Save customization to SQLite
      console.log("[ICON APPLY] Step 9: Saving to database...");
      db.saveFolderCustomization({
        folderPath,
        icoPath,
        selectedIcon,
        selectedColor,
        appliedDate: new Date().toISOString()
      });
      console.log("[ICON APPLY] ✓ Customization saved to database");

      // Save debug PNG preview to workspace
      if (data.canvasDataUrl) {
        console.log("[ICON APPLY] Step 10: Saving debug PNG preview...");
        try {
          const base64Data = data.canvasDataUrl.replace(/^data:image\/png;base64,/, "");
          const debugPngPath = path.join(process.cwd(), "debug-preview.png");
          await fs.writeFile(debugPngPath, base64Data, "base64");
          console.log("[ICON APPLY] ✓ Debug PNG saved");
        } catch (e: any) {
          console.warn("[ICON APPLY]   Warning: Failed to save debug preview PNG:", e.message);
        }
      }

      // Silently notify Windows Shell to redraw the folder icon (handled in background with retries)
      console.log("[ICON APPLY] Step 11: Triggering Explorer refresh...");
      refreshWindowsShell(folderPath).catch((err: any) => {
        console.warn("[ICON APPLY]   Warning: refreshWindowsShell failed:", err.message);
      });

      console.log("\n" + "=".repeat(70));
      console.log("[ICON APPLY] ✓✓✓ SUCCESS - Icon applied to:", folderPath);
      console.log("=".repeat(70) + "\n");

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
      console.log("[ICON REMOVE] Step 3: Folder attribute cleanup (not needed)");

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
