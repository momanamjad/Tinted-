# refresh-icon.ps1
# Called by the Electron app to force Windows Explorer to repaint folder icons.
# Usage: powershell -ExecutionPolicy Bypass -File refresh-icon.ps1 [-FolderPath "C:\path\to\folder"]

param(
    [string]$FolderPath = ""
)

# --- 1. SHChangeNotify via P/Invoke ---
# This is the official Windows Shell API to notify Explorer of filesystem changes.
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class ShellNotify {
    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@

if ($FolderPath -and (Test-Path $FolderPath)) {
    # SHCNE_UPDATEDIR (0x1000) on the folder itself
    $ptr = [System.Runtime.InteropServices.Marshal]::StringToHGlobalUni($FolderPath)
    [ShellNotify]::SHChangeNotify(0x00001000, 0x0005, $ptr, [IntPtr]::Zero)
    [System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr)

    # SHCNE_UPDATEITEM (0x2000) on the folder (treats it as an item in the parent)
    $ptr2 = [System.Runtime.InteropServices.Marshal]::StringToHGlobalUni($FolderPath)
    [ShellNotify]::SHChangeNotify(0x00002000, 0x0005, $ptr2, [IntPtr]::Zero)
    [System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr2)

    # Notify the parent directory
    $parentPath = Split-Path -Parent $FolderPath
    if ($parentPath) {
        $ptr3 = [System.Runtime.InteropServices.Marshal]::StringToHGlobalUni($parentPath)
        [ShellNotify]::SHChangeNotify(0x00001000, 0x0005, $ptr3, [IntPtr]::Zero)
        [System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr3)
    }
}

# SHCNE_ASSOCCHANGED (0x08000000) - global icon cache invalidation
[ShellNotify]::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero)

# --- 2. Refresh all open Explorer windows via COM ---
# This forces any visible Explorer/Desktop window to repaint immediately.
try {
    $shell = New-Object -ComObject Shell.Application
    $shell.Windows() | ForEach-Object {
        try { $_.Refresh() } catch {}
    }
} catch {}

# --- 3. Clear the icon cache database (forces full rebuild) ---
try {
    $cacheDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Explorer"
    if (Test-Path $cacheDir) {
        Get-ChildItem -Path $cacheDir -Filter "iconcache_*" | ForEach-Object {
            try {
                # Can't delete while Explorer holds them, but we can signal the rebuild
                $_.LastWriteTime = Get-Date
            } catch {}
        }
    }
    # Also touch the legacy IconCache.db if it exists
    $legacyCache = Join-Path $env:LOCALAPPDATA "IconCache.db"
    if (Test-Path $legacyCache) {
        try { (Get-Item $legacyCache).LastWriteTime = Get-Date } catch {}
    }
} catch {}

Write-Host "Icon refresh completed."
