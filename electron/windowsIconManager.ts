import { makeIco } from "./icon-generator.js";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFilePromise = promisify(execFile);

/**
 * Generate an .ico file from raw RGBA pixel data and save it.
 */
export async function generateIcoFile(
  pixelData: number[],
  width: number,
  height: number,
  icoPath: string
): Promise<string> {
  console.log("[GENERATE ICO] Starting ICO generation");
  console.log("[GENERATE ICO]   Width:", width, "Height:", height);
  console.log("[GENERATE ICO]   Pixel data length:", pixelData.length);
  console.log("[GENERATE ICO]   Target path:", icoPath);
  
  const pixels = new Uint8ClampedArray(pixelData);
  console.log("[GENERATE ICO]   Created Uint8ClampedArray, length:", pixels.length);
  
  const icoBuffer = makeIco(pixels);
  console.log("[GENERATE ICO]   ICO buffer created, size:", icoBuffer.length, "bytes");

  // Ensure target directory exists
  await fs.mkdir(path.dirname(icoPath), { recursive: true });
  console.log("[GENERATE ICO]   Directory ensured:", path.dirname(icoPath));
  
  await fs.writeFile(icoPath, icoBuffer);
  console.log("[GENERATE ICO] ✓ ICO file written successfully");

  return icoPath;
}

/**
 * Write desktop.ini pointing to the custom .ico file.
 * Handles removing previous read-only/hidden/system attributes first to avoid write block errors.
 */
export async function createDesktopIni(folderPath: string, icoPath: string): Promise<boolean> {
  console.log("[CREATE DESKTOP.INI] Starting");
  console.log("[CREATE DESKTOP.INI]   Folder path:", folderPath);
  console.log("[CREATE DESKTOP.INI]   Icon path:", icoPath);
  
  const desktopIniPath = path.join(folderPath, "desktop.ini");
  console.log("[CREATE DESKTOP.INI]   Target path:", desktopIniPath);

  // Temporarily strip attributes to allow overwrite
  try {
    console.log("[CREATE DESKTOP.INI]   Removing existing attributes...");
    await execFilePromise("attrib", ["-h", "-s", desktopIniPath]);
    console.log("[CREATE DESKTOP.INI] ✓ Attributes removed");
  } catch (e: any) {
    console.log("[CREATE DESKTOP.INI]   File does not exist yet (OK):", e.message);
  }

  // Prepend UTF-8 BOM (\uFEFF) to ensure Windows Explorer parses it correctly
  const content = `\uFEFF[.ShellClassInfo]\r\nIconResource=${icoPath},0\r\nIconFile=${icoPath}\r\nIconIndex=0\r\n`;
  console.log("[CREATE DESKTOP.INI]   Content length:", content.length);
  console.log("[CREATE DESKTOP.INI]   Content preview:", content.substring(0, 80));
  
  await fs.writeFile(desktopIniPath, content, "utf8");
  console.log("[CREATE DESKTOP.INI] ✓ desktop.ini file written");

  return true;
}

/**
 * Make desktop.ini hidden and system-protected so it is invisible to users by default.
 */
export async function setFileHidden(filePath: string): Promise<boolean> {
  console.log("[SET FILE HIDDEN] Setting attributes on:", filePath);
  try {
    await execFilePromise("attrib", ["+h", "+s", filePath]);
    console.log("[SET FILE HIDDEN] ✓ File attributes set");
    return true;
  } catch (e: any) {
    console.error("[SET FILE HIDDEN] ✗ Error:", e.message);
    throw e;
  }
}

/**
 * Enable the system/readonly flag on the folder path, which triggers Windows to look for desktop.ini.
 */
export async function setFolderSystem(folderPath: string): Promise<boolean> {
  console.log("[SET FOLDER SYSTEM] Setting system flag on:", folderPath);
  // Clear attributes first to force Windows Explorer to detect a change event when we re-apply them
  try {
    console.log("[SET FOLDER SYSTEM]   Clearing existing attributes...");
    await execFilePromise("attrib", ["-r", "-s", folderPath]);
    console.log("[SET FOLDER SYSTEM] ✓ Attributes cleared");
  } catch (e: any) {
    console.warn("[SET FOLDER SYSTEM]   Warning clearing attributes:", e.message);
  }
  // Set both Read-only and System attributes to trigger reload
  try {
    console.log("[SET FOLDER SYSTEM]   Applying system + read-only attributes...");
    await execFilePromise("attrib", ["+r", "+s", folderPath]);
    console.log("[SET FOLDER SYSTEM] ✓ Folder system attribute set");
    return true;
  } catch (e: any) {
    console.error("[SET FOLDER SYSTEM] ✗ Error:", e.message);
    throw e;
  }
}

/**
 * Disable the system/readonly flag on the folder path when removing customization.
 */
export async function unsetFolderSystem(folderPath: string): Promise<boolean> {
  console.log("[UNSET FOLDER SYSTEM] Removing system flag from:", folderPath);
  try {
    await execFilePromise("attrib", ["-r", "-s", folderPath]);
    console.log("[UNSET FOLDER SYSTEM] ✓ Folder system attribute removed");
    return true;
  } catch (e: any) {
    console.error("[UNSET FOLDER SYSTEM] ✗ Error:", e.message);
    throw e;
  }
}

/**
 * Force Windows Explorer to repaint a folder's custom icon.
 *
 * WINDOWS EXPLORER BEHAVIOR:
 * When a folder is newly created or selected, Explorer holds a "selection lock"
 * that prevents external changes from displaying immediately. This is intentional—
 * it prevents flickering when users interact with folders.
 *
 * STRATEGY: Toggle the Read-only attribute to signal a filesystem change.
 * This creates a change event that Explorer cannot ignore, forcing it to
 * re-read the desktop.ini file and refresh the icon. We then flush the
 * icon cache with ie4uinit.exe -show.
 *
 * RETRY LOGIC: Multiple attempts (0s, 2s, 5s) to handle Explorer's selection lock
 * on newly created/renamed folders. Users may still need to click elsewhere to
 * see the icon immediately if the folder is selected.
 *
 * USER EXPECTATION:
 * Icon is APPLIED immediately (saved to disk). It will DISPLAY when the folder
 * is deselected or after a few seconds. This is Windows Explorer's normal behavior.
 */
export async function refreshWindowsShell(folderPath?: string): Promise<void> {
  if (!folderPath) {
    // Global refresh only
    try {
      await execFilePromise("ie4uinit.exe", ["-show"]);
      console.log("[REFRESH] Global icon cache flushed");
    } catch (e) {
      console.error("[REFRESH] ie4uinit failed:", e);
    }
    return;
  }

  let attemptCount = 0;

  const doRefresh = async () => {
    attemptCount++;
    try {
      // 1. Briefly strip Read-only to create a change event Explorer will detect
      await execFilePromise("attrib", ["-r", folderPath]);
      // 2. Small delay so the OS registers the attribute change
      await new Promise(r => setTimeout(r, 150));
      // 3. Re-apply Read-only + System so Explorer re-reads desktop.ini
      await execFilePromise("attrib", ["+r", "+s", folderPath]);
      // 4. Flush icon cache globally
      await execFilePromise("ie4uinit.exe", ["-show"]);
      
      console.log(`[REFRESH] Attempt ${attemptCount}: Icon refresh sent to Explorer`);
    } catch (e) {
      // Folder may have been deleted/moved — ignore silently
      console.log(`[REFRESH] Attempt ${attemptCount}: Folder not accessible (this is OK)`);
    }
  };

  // Immediate attempt (folder may not be selected yet)
  doRefresh();

  // Retry after 2 seconds (Explorer may still hold a selection lock)
  setTimeout(() => doRefresh(), 2000);

  // Final retry after 5 seconds (failsafe)
  setTimeout(() => doRefresh(), 5000);
}
