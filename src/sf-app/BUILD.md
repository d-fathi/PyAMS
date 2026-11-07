# Building PyAMS software

PyAMS software is the PyAMS CAD (schematic editor, symbol editor, simulator, waveform viewer)
packaged as an **Electron** desktop application. The editor code in `media/` is the same as in
the VS Code extension; `src/` (main process) replaces `extension.js` / `pyamsEditor.js`.

## Run from source
```
npm install
npm start
```

## Make the executables
Requires Node.js 18 or newer and internet access (npm downloads Electron and electron-builder).

| Target | Command | Output (`dist/`) |
| --- | --- | --- |
| Windows installer + portable | `npm run dist:win` (or double-click `build-windows.bat`) | `PyAMS-0.3.0-Setup-x64.exe`, `PyAMS-0.3.0-Portable-x64.exe` |
| Linux | `npm run dist:linux` (or `./build-linux.sh`) | `PyAMS-0.3.0-x64.AppImage`, `.deb` |
| Unpacked folder (quick test) | `npm run pack` | `dist/win-unpacked/` |

Build the Windows installer on Windows. (On Linux/macOS electron-builder needs Wine for the Windows target.)

## Logo
`build/icon.ico` (your logo) is the application, installer and file-association icon.
`build/icon.png` is the same logo (256 px) used for Linux and for the start page.

## Layout
```
src/            Electron main process (tabbed window, menus, files, undo/redo, Python processes)
  main.js       application logic          preload.js / preload-shell.js / preload-start.js   bridges
  workspace.js  project folder (= folder of the open file)
  librarySync.js / symbolsSync.js   (from the extension)
renderer/       shell.html (tab bar + status bar), editor.html (loads media/*), host-shim.js (acquireVsCodeApi replacement), start page
media/          PyAMS CAD (unchanged from the extension)
resources/      files that must stay real files on disk: pyams/ (Python library), symbols/, demo/, data.json
build/          icon.ico, icon.png
```

## Notes
* Simulation runs the bundled `pyams` Python library, so Python 3 + `numpy` + `matplotlib` must be installed
  on the user's computer. **Tools > Set Python Path...** selects the interpreter.
* Settings (recent files, Python path) are stored in the user-data folder of the application.
