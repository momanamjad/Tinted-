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

  // Prepend UTF-8 BOM (\uFEFF) to ensure Windows Explorer parses it correctly
  const content = `\uFEFF[.ShellClassInfo]\r\nIconResource=${icoPath},0\r\nIconFile=${icoPath}\r\nIconIndex=0\r\n`;
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
  // Clear attributes first to force Windows Explorer to detect a change event when we re-apply them
  try {
    await execFilePromise("attrib", ["-r", "-s", folderPath]);
  } catch (e) {}
  // Set both Read-only and System attributes to trigger reload
  await execFilePromise("attrib", ["+r", "+s", folderPath]);
  return true;
}

/**
 * Disable the system/readonly flag on the folder path when removing customization.
 */
export async function unsetFolderSystem(folderPath: string): Promise<boolean> {
  await execFilePromise("attrib", ["-r", "-s", folderPath]);
  return true;
}

export async function refreshWindowsShell(folderPath?: string): Promise<void> {
  let script = `
$definition = '[System.Runtime.InteropServices.DllImport("shell32.dll", CharSet = System.Runtime.InteropServices.CharSet.Unicode)] public static extern void SHChangeNotify(int eventId, int flags, string item1, string string2);'
Add-Type -MemberDefinition $definition -Name Explorer -Namespace WinAPI
`;

  if (folderPath) {
    const escapedPath = folderPath.replace(/'/g, "''");
    const parentPath = path.dirname(folderPath);
    const escapedParent = parentPath.replace(/'/g, "''");
    // Notify update item on the folder itself, and update directory on its parent folder
    script += `[WinAPI.Explorer]::SHChangeNotify(0x00002000, 0x0005, "${escapedPath}", $null)\n`;
    script += `[WinAPI.Explorer]::SHChangeNotify(0x00001000, 0x0005, "${escapedParent}", $null)\n`;
  }
  script += `[WinAPI.Explorer]::SHChangeNotify(0x08000000, 0, $null, $null)\n`;

  try {
    const base64 = Buffer.from(script, "utf16le").toString("base64");
    const { exec } = await import("node:child_process");
    const { promisify } = await import("node:util");
    // Run PowerShell in a hidden window to prevent taskbar flash
    await promisify(exec)(`powershell -WindowStyle Hidden -EncodedCommand ${base64}`);
  } catch (e) {
    console.error("Failed to refresh Windows Shell:", e);
  }
}
