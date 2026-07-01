# refresh-icon.ps1
# Called by the Electron app to force Windows Explorer to repaint folder icons.
# Usage: powershell -ExecutionPolicy Bypass -File refresh-icon.ps1 [-FolderPath "C:\path\to\folder"]

param(
    [string]$FolderPath = ""
)

# --- P/Invoke: SHChangeNotify + PostMessage ---
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class ShellRefresh {
    // SHChangeNotify: Tell Explorer that a shell item has changed
    // IMPORTANT: Use SHCNF_PATHW (0x0005) with string pointers
    //            Use SHCNF_FLUSH (0x1000) to make it synchronous (not queued)
    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    public static extern void SHChangeNotify(int wEventId, uint uFlags, string dwItem1, string dwItem2);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr FindWindow(string lpClassName, IntPtr lpWindowName);

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, IntPtr lpszWindow);

    [DllImport("user32.dll")]
    public static extern int PostMessage(IntPtr hWnd, int wMsg, int wParam, int lParam);
}
"@

# SHChangeNotify event IDs
$SHCNE_ATTRIBUTES   = 0x00000800  # Attributes of an item changed
$SHCNE_UPDATEITEM   = 0x00002000  # An item that Explorer is displaying has changed
$SHCNE_UPDATEDIR    = 0x00001000  # A directory's contents changed
$SHCNE_ASSOCCHANGED = 0x08000000  # Association between file types and programs changed

# SHChangeNotify flags
# SHCNF_PATHW = 0x0005  — dwItem is a wide string path pointer
# SHCNF_FLUSH = 0x1000  — synchronous (wait for notification to be processed)
$SHCNF_PATHW       = [uint32]0x0005
$SHCNF_PATHW_FLUSH = [uint32]0x1005   # SHCNF_PATHW | SHCNF_FLUSH

function Notify-Path {
    param([string]$targetPath, [int]$eventId, [bool]$flush = $true)
    try {
        $flags = if ($flush) { $SHCNF_PATHW_FLUSH } else { $SHCNF_PATHW }
        [ShellRefresh]::SHChangeNotify($eventId, $flags, $targetPath, $null)
        Write-Host "[SHCNE] event=0x$($eventId.ToString('X4')) flush=$flush -> $targetPath"
    } catch {
        Write-Host "[SHCNE] Error: $_"
    }
}

# ============================================================
# MAIN LOGIC
# ============================================================

if ($FolderPath -and (Test-Path $FolderPath)) {
    $parentPath = Split-Path -Parent $FolderPath
    $iniPath    = Join-Path $FolderPath "desktop.ini"

    Write-Host "[REFRESH] Folder : $FolderPath"
    Write-Host "[REFRESH] Parent : $parentPath"

    # 1. Read attributes (logs current state + touches access time)
    try { $out = & attrib $FolderPath 2>&1;  Write-Host "[ATTRIB] folder : $out" } catch {}
    if (Test-Path $iniPath) {
        try { $out = & attrib $iniPath 2>&1; Write-Host "[ATTRIB] ini    : $out" } catch {}
    }
    if ($parentPath) {
        try { $out = & attrib $parentPath 2>&1; Write-Host "[ATTRIB] parent : $out" } catch {}
    }

    # 2. TOGGLE Read-only attribute on the folder — this creates a REAL filesystem change
    #    event that Explorer's ReadDirectoryChangesW picks up, forcing it to re-read desktop.ini
    try {
        & attrib -r $FolderPath 2>&1 | Out-Null
        Start-Sleep -Milliseconds 80
        & attrib +r $FolderPath 2>&1 | Out-Null
        Write-Host "[TOGGLE] Toggled -r/+r on folder to trigger Explorer change event"
    } catch {
        Write-Host "[TOGGLE] Error: $_"
    }

    # 3. SHChangeNotify with correct SHCNF_PATHW flag + FLUSH (synchronous)
    #    Tell Explorer: this folder's attributes changed, and its contents changed
    Notify-Path -targetPath $FolderPath -eventId $SHCNE_ATTRIBUTES  -flush $true
    Notify-Path -targetPath $FolderPath -eventId $SHCNE_UPDATEITEM  -flush $true
    Notify-Path -targetPath $FolderPath -eventId $SHCNE_UPDATEDIR   -flush $true

    # Also notify the parent so it refreshes the folder's icon in the listing
    if ($parentPath) {
        Notify-Path -targetPath $parentPath -eventId $SHCNE_UPDATEDIR  -flush $true
        # Notify the folder as an item within the parent
        Notify-Path -targetPath $FolderPath -eventId $SHCNE_UPDATEITEM -flush $true
    }

    # SHCNE_RENAMEFOLDER (0x20000) rename-to-self trick:
    # Telling Explorer the folder was "renamed" to the same path forces it to completely
    # drop all cached info (including icon) and re-read everything from disk.
    try {
        $SHCNE_RENAMEFOLDER = 0x00020000
        [ShellRefresh]::SHChangeNotify($SHCNE_RENAMEFOLDER, $SHCNF_PATHW_FLUSH, $FolderPath, $FolderPath)
        Write-Host "[SHCNE] SHCNE_RENAMEFOLDER (rename-to-self) sent for: $FolderPath"
    } catch {
        Write-Host "[SHCNE] RENAMEFOLDER error: $_"
    }
}

# 4. Global association change — flushes icon cache associations
[ShellRefresh]::SHChangeNotify($SHCNE_ASSOCCHANGED, [uint32]0x0000, $null, $null)
Write-Host "[SHCNE] Global SHCNE_ASSOCCHANGED sent"

# 5. Refresh all open Explorer windows via COM (Shell.Application)
try {
    $shell   = New-Object -ComObject Shell.Application
    $windows = $shell.Windows()
    $count   = 0
    $windows | ForEach-Object { try { $_.Refresh(); $count++ } catch {} }
    Write-Host "[COM] Refreshed $count open Explorer window(s)"
} catch {
    Write-Host "[COM] Error: $_"
}

# 6. Send F5 to Desktop (Program Manager) and any open File Explorer
try {
    $wshell = New-Object -ComObject WScript.Shell
    if ($wshell.AppActivate("Program Manager")) {
        Start-Sleep -Milliseconds 100
        $wshell.SendKeys('{F5}')
        Write-Host "[WSCRIPT] F5 sent to Desktop (Program Manager)"
    }
    if ($wshell.AppActivate("File Explorer")) {
        Start-Sleep -Milliseconds 100
        $wshell.SendKeys('{F5}')
        Write-Host "[WSCRIPT] F5 sent to File Explorer"
    }
} catch {
    Write-Host "[WSCRIPT] Error: $_"
}

# 7. PostMessage WM_COMMAND Refresh to Desktop shell view
try {
    $progman   = [ShellRefresh]::FindWindow("Progman", [IntPtr]::Zero)
    $shellView = [ShellRefresh]::FindWindowEx($progman, [IntPtr]::Zero, "SHELLDLL_DefView", [IntPtr]::Zero)

    if ($shellView -eq [IntPtr]::Zero) {
        $workerW = [IntPtr]::Zero
        do {
            $workerW   = [ShellRefresh]::FindWindowEx([IntPtr]::Zero, $workerW, "WorkerW", [IntPtr]::Zero)
            $shellView = [ShellRefresh]::FindWindowEx($workerW, [IntPtr]::Zero, "SHELLDLL_DefView", [IntPtr]::Zero)
        } while ($workerW -ne [IntPtr]::Zero -and $shellView -eq [IntPtr]::Zero)
    }

    if ($shellView -ne [IntPtr]::Zero) {
        [ShellRefresh]::PostMessage($shellView, 0x0111, 28931, 0) | Out-Null
        $listView = [ShellRefresh]::FindWindowEx($shellView, [IntPtr]::Zero, "SysListView32", [IntPtr]::Zero)
        if ($listView -ne [IntPtr]::Zero) {
            [ShellRefresh]::PostMessage($listView, 0x0100, 0x74, 0) | Out-Null
            [ShellRefresh]::PostMessage($listView, 0x0101, 0x74, 0) | Out-Null
            Write-Host "[HWND] F5 sent via PostMessage to SysListView32"
        }
    } else {
        Write-Host "[HWND] SHELLDLL_DefView not found"
    }
} catch {
    Write-Host "[HWND] Error: $_"
}

# 8. Touch icon cache files to force rebuild on next Explorer restart
try {
    $cacheDir = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Explorer"
    if (Test-Path $cacheDir) {
        $files = Get-ChildItem -Path $cacheDir -Filter "iconcache_*" -ErrorAction SilentlyContinue
        $files | ForEach-Object { try { $_.LastWriteTime = Get-Date } catch {} }
        Write-Host "[CACHE] Touched $($files.Count) iconcache file(s)"
    }
} catch {}

Write-Host "Icon refresh completed."
