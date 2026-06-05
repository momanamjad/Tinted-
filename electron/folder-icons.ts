import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { shell } from "electron";
import { generateFolderIco } from "./icon-generator.js";
import type { ApplyIconRequest, FolderIconRecord } from "./types.js";

const ICON_DIR = ".tintd-icons";

export async function applyFolderIcon(
  request: ApplyIconRequest
): Promise<Omit<FolderIconRecord, "id">> {
  const timestamp = new Date().toISOString();
  const iconDirectory = path.join(request.folderPath, ICON_DIR);
  const iconName = `folder-${request.color.replace("#", "")}.ico`;
  const iconPath = path.join(iconDirectory, iconName);
  const desktopIniPath = path.join(request.folderPath, "desktop.ini");

  await fs.mkdir(iconDirectory, { recursive: true });
  await fs.writeFile(iconPath, generateFolderIco(request.color));
  await fs.writeFile(
    desktopIniPath,
    `[.ShellClassInfo]\r\nIconResource=${ICON_DIR}\\${iconName},0\r\nIconFile=${ICON_DIR}\\${iconName}\r\nIconIndex=0\r\n`,
    "utf8"
  );

  await setAttributes(desktopIniPath, ["+h", "+s"]);
  await setAttributes(iconDirectory, ["+h"]);
  await setAttributes(request.folderPath, ["+s"]);

  if (request.autoRefreshExplorer) {
    shell.showItemInFolder(request.folderPath);
  }

  return {
    folderPath: request.folderPath,
    color: request.color,
    iconPath,
    status: "applied",
    updatedAt: timestamp,
    message: "Folder icon tint applied."
  };
}

export async function resetFolderIcon(
  folderPath: string
): Promise<Omit<FolderIconRecord, "id">> {
  const timestamp = new Date().toISOString();
  const desktopIniPath = path.join(folderPath, "desktop.ini");

  await fs.rm(desktopIniPath, { force: true });
  await setAttributes(folderPath, ["-s"]);

  return {
    folderPath,
    color: "#64748b",
    iconPath: "",
    status: "reset",
    updatedAt: timestamp,
    message: "Folder icon reset to Windows default."
  };
}

function setAttributes(targetPath: string, attributes: string[]) {
  return new Promise<void>((resolve, reject) => {
    execFile("attrib", [...attributes, targetPath], (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
