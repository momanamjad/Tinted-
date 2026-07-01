import { makeIco } from "./icon-generator.js";
import fs from "node:fs/promises";
import path from "node:path";
import { exec, execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import log from "electron-log";

const execPromise = promisify(exec);
const execFilePromise = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
let refreshTimeout: NodeJS.Timeout | null = null;
const pathsToRefresh = new Set<string>();

export async function refreshWindowsShell(folderPath?: string): Promise<void> {
  if (folderPath) {
    pathsToRefresh.add(folderPath);
  }

  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  refreshTimeout = setTimeout(async () => {
    refreshTimeout = null;
    const paths = Array.from(pathsToRefresh);
    pathsToRefresh.clear();

    // 1. Force Windows to flush folder metadata by querying attrib on each folder
    for (const p of paths) {
      // Run attrib on the folder and its desktop.ini to force Windows OS to flush its icon cache
      try {
        log.info(`[REFRESH WINDOWS SHELL] Querying folder + desktop.ini attributes: ${p}`);
        const iniPath = path.join(p, "desktop.ini");
        await execPromise(`attrib "${p}" && attrib "${iniPath}"`);
      } catch (attribErr: any) {
        log.error(`[REFRESH WINDOWS SHELL] Attrib query failed for folder: ${p}:`, attribErr.message);
      }

      // Also run attrib on the PARENT directory so Explorer refreshes the containing folder
      // (e.g. Desktop, Documents) — this is what makes the icon change visible immediately
      try {
        const parentDir = path.dirname(p);
        log.info(`[REFRESH WINDOWS SHELL] Querying parent directory attributes: ${parentDir}`);
        await execPromise(`attrib "${parentDir}"`);
      } catch (parentErr: any) {
        log.error(`[REFRESH WINDOWS SHELL] Attrib query failed for parent dir:`, parentErr.message);
      }
    }

    const runPS1 = async (p: string) => {
      const scriptPath = path.join(__dirname, "refresh-icon.ps1");
      const { stdout, stderr } = await execPromise(
        `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -FolderPath "${p}"`
      );
      if (stdout.trim()) log.info(`[REFRESH WINDOWS SHELL] PS stdout: ${stdout.trim()}`);
      if (stderr?.trim()) log.error(`[REFRESH WINDOWS SHELL] PS stderr: ${stderr.trim()}`);
    };

    // 2. Fire PS1 (SHChangeNotify) immediately
    for (const p of paths) {
      try {
        log.info(`[REFRESH WINDOWS SHELL] Running PS1 refresh for: ${p}`);
        await runPS1(p);
      } catch (err: any) {
        log.error("[REFRESH WINDOWS SHELL] PS1 failed:", err);
      }
    }

    // 3. Trigger ie4uinit in the background (non-blocking) to update cache
    execFilePromise("ie4uinit.exe", ["-show"]).catch((e: any) => {
      log.warn("[REFRESH WINDOWS SHELL] ie4uinit failed (non-critical):", e.message);
    });


    // If no specific path was given, still run the script for a global refresh
    if (paths.length === 0) {
      try {
        const scriptPath = path.join(__dirname, "refresh-icon.ps1");
        log.info("[REFRESH WINDOWS SHELL] Spawning PowerShell (global refresh, no specific path)");
        const { stdout, stderr } = await execPromise(
          `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`
        );
        log.info(`[REFRESH WINDOWS SHELL] PS stdout: ${stdout.trim()}`);
        if (stderr && stderr.trim()) {
          log.error(`[REFRESH WINDOWS SHELL] PS stderr: ${stderr.trim()}`);
        }
      } catch (err: any) {
        log.error("[REFRESH WINDOWS SHELL] PS script (global) failed:", err);
      }
    }
  }, 800);
}
