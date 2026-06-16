<div align="center">
  
# 🎨 Tintd Pro 

**Customize Windows Folders Like Magic.**

[![Download Latest Release](https://img.shields.io/github/v/release/momanamjad/Tinted-?color=22c55e&label=Download%20for%20Windows&style=for-the-badge)](https://github.com/momanamjad/Tinted-/releases/latest)

Tintd Pro is a modern, lightweight desktop application that lets you instantly apply stunning colors, beautiful icons, and custom styling to any folder on Windows 10 & 11. No registry hacks, no system bloat—just right-click and transform.

</div>

---

## 🚀 How to Install (For Beginners)

Since Tintd Pro is an independent, open-source app, installing it takes just a few clicks:

1. **Download the App:** Click [here to go to the Releases page](https://github.com/momanamjad/Tinted-/releases/latest).
2. Look for the file named `Tintd Pro-0.1.0-Setup.exe` (the version number might be higher) under the **Assets** section and click it to download.
3. **Run the Installer:** Double click the downloaded `.exe` file.
4. **Bypass the Warning:** Because we are independent developers and not a massive corporation, Windows might show a blue screen saying *"Windows protected your PC"*. 
   * Simply click **"More info"**, and then click the **"Run anyway"** button. This is totally normal for new open-source apps!
5. **Follow the Prompts:** The installer will automatically install the app and place a shortcut on your Desktop.

---

## 📖 How to Use Tintd Pro

Tintd Pro is designed to be incredibly simple to use.

### 1. Colorizing a Folder (The Basics)
1. Open **Tintd Pro** from your Start menu or Desktop shortcut.
2. At the top of the app, click the **"Select Folder"** button.
3. Browse your computer and select the folder you want to change.
4. Choose a color from the palette, or enter a custom Hex code.
5. Choose an icon style.
6. Click **"Apply Icon"**. 
7. *Magic!* Your folder will instantly update in Windows Explorer. 

### 2. Auto-Styling (Set it and Forget it)
Want folders to automatically color themselves based on their name? (e.g., Every folder named "Photos" automatically becomes blue with a camera icon).
1. Go to the **Settings** tab in Tintd Pro.
2. Enable the **Folder Watcher** switch.
3. The app will now quietly run in the background. Whenever you create a new folder on your Desktop or Documents, it will automatically style it for you!

### 3. Resetting a Folder
Don't like the color anymore? 
1. Select the folder in the app.
2. Click the **"Reset to Default"** button. The folder will immediately go back to the standard yellow Windows folder.

---

## 🛠️ Troubleshooting & FAQ

**Q: I applied a color, but the folder didn't change in Windows Explorer!**
> **A:** Sometimes Windows Explorer's cache gets stuck. Just click the **"Restart Explorer"** button in the Tintd Pro app, or simply press `F5` on your keyboard while looking at your desktop/folder to force it to refresh.

**Q: Does it slow down my computer?**
> **A:** No! Tintd Pro uses native Windows `desktop.ini` files to style the folders. You can even close the app completely, and your folders will stay colored! (Note: Keep the app running in the background if you want to use the "Auto-Styling" feature).

**Q: Will the colors stay if I move the folder to a USB drive?**
> **A:** Yes! The styling is self-contained within the folder itself.

---

## 👨‍💻 For Developers

Want to build from source? 

```bash
# Clone the repository
git clone https://github.com/momanamjad/Tinted-.git

# Install dependencies
npm install

# Run the app in development mode
npm run dev

# Build the production installer
npm run dist
```

*Built with Electron, React, Vite, and Tailwind CSS.*
