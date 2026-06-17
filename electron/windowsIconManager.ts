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
  
  const pixels = new Uint8ClampedArray(pixelData);
  
  const icoBuffer = makeIco(pixels);

  // Ensure target directory exists
  await fs.mkdir(path.dirname(icoPath), { recursive: true });
  
  await fs.writeFile(icoPath, icoBuffer);

  return icoPath;
}

/**
 * Write desktop.ini pointing to the custom .ico file.
 * Handles removing previous read-only/hidden/system attributes first to avoid write block errors.
 */
export async function createDesktopIni(folderPath: string, icoPath: string): Promise<boolean> {
  const desktopIniPath = path.join(folderPath, "desktop.ini");

  // Temporarily strip attributes to allow overwrite
  try {
    await execFilePromise("attrib", ["-h", "-s", desktopIniPath]);
  } catch (e: any) {
    // File does not exist yet — OK
  }

  // Prepend UTF-8 BOM (\uFEFF) to ensure Windows Explorer parses it correctly
  const content = `\uFEFF[.ShellClassInfo]\r\nIconResource=${icoPath},0\r\nIconFile=${icoPath}\r\nIconIndex=0\r\n`;
  await fs.writeFile(desktopIniPath, content, "utf8");

  return true;
}

/**
 * Make desktop.ini hidden and system-protected so it is invisible to users by default.
 */
export async function setFileHidden(filePath: string): Promise<boolean> {
  try {
    await execFilePromise("attrib", ["+h", "+s", filePath]);
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
  // Clear attributes first to force Windows Explorer to detect a change event when we re-apply them
  try {
    await execFilePromise("attrib", ["-r", "-s", folderPath]);
  } catch (e: any) {
    // Warning clearing attributes — non-critical
  }
  // Set both Read-only and System attributes to trigger reload
  try {
    await execFilePromise("attrib", ["+r", "+s", folderPath]);
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
  try {
    await execFilePromise("attrib", ["-r", "-s", folderPath]);
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
  const ps1Path = path.join(__dirname, "refresh-icon.ps1");
  
  try {
    const args = ["-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File", ps1Path];
    if (folderPath) {
      args.push("-FolderPath", folderPath);
    }
    
    // Execute asynchronously and don't block
    const { execFile } = await import("node:child_process");
    execFile("powershell.exe", args, (error) => {
      if (error) {
        console.error("[REFRESH] PowerShell refresh script failed:", error);
      }
    });
  } catch (e) {
    console.error("[REFRESH] Failed to execute refresh script:", e);
  }
}
