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
  } catch (e) {
    // Ignore if file does not exist
  }

  const content = `[.ShellClassInfo]\r\nIconResource=${icoPath},0\r\nIconFile=${icoPath}\r\nIconIndex=0\r\n`;
  await fs.writeFile(desktopIniPath, content, "utf8");

  return true;
}

/**
 * Make desktop.ini hidden and system-protected so it is invisible to users by default.
 */
export async function setFileHidden(filePath: string): Promise<boolean> {
  await execFilePromise("attrib", ["+h", "+s", filePath]);
  return true;
}

/**
 * Enable the system/readonly flag on the folder path, which triggers Windows to look for desktop.ini.
 */
export async function setFolderSystem(folderPath: string): Promise<boolean> {
  await execFilePromise("attrib", ["+s", folderPath]);
  return true;
}

/**
 * Disable the system flag on the folder path when removing customization.
 */
export async function unsetFolderSystem(folderPath: string): Promise<boolean> {
  await execFilePromise("attrib", ["-s", folderPath]);
  return true;
}

export async function refreshWindowsShell(): Promise<void> {
  const definition = '[System.Runtime.InteropServices.DllImport(\\"Shell32.dll\\")] public static extern int SHChangeNotify(int eventId, int flags, System.IntPtr item1, System.IntPtr item2);';
  const command = `Add-Type -MemberDefinition '${definition}' -Name Explorer -Namespace WinAPI; [WinAPI.Explorer]::SHChangeNotify(0x08000000, 0, [System.IntPtr]::Zero, [System.IntPtr]::Zero)`;
  try {
    const { exec } = await import("node:child_process");
    const { promisify } = await import("node:util");
    // Run PowerShell in a hidden window to prevent taskbar flash
    await promisify(exec)(`powershell -WindowStyle Hidden -Command "${command}"`);
  } catch (e) {
    console.error("Failed to refresh Windows Shell:", e);
  }
}
