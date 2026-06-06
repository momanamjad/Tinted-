# Tintd Pro

Tintd Pro (Windows Edition) is an Electron + React desktop application for customizing Windows folder icons and colors.

## Project Details

Tinted is an Electron + React application for managing and customizing folder icons and colors on Windows. It includes a web-based UI (built with Vite, React, and Tailwind) and an Electron backend for OS integration. The repository contains source for both the renderer (`src/`) and Electron main process (`electron/`).

Key features:
- Color and icon picker UI
- Generate and assign folder icons
- Persisted settings and history
- Cross-platform development using Electron (Windows-targeted features included)

## Scripts

- `npm run dev` starts Vite and Electron for local development.
- `npm run build` type-checks and builds the renderer and Electron main process.
- `npm run dist` creates a Windows `.exe` installer with electron-builder.

## How to Use

Prerequisites:
- Node.js (16+ recommended)
- Yarn or npm

Local development (renderer):

1. Install dependencies:

```bash
npm install
# or
yarn
```

2. Start the dev server:

```bash
npm run dev
# or
yarn dev
```

3. Open the app in the browser at the URL shown by Vite, or run the Electron app for full functionality.

Running Electron (development):

1. Build the renderer or run it in parallel with Electron.
2. Start Electron from the project root:

```bash
npm run electron:dev
# or your configured script in package.json
```

Production build:

```bash
npm run build
npm run package
```

## Stack

- Electron
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui-style components
- SQLite via `better-sqlite3`

## Windows folder icons

Tintd Pro writes a generated `.ico` file inside each selected folder, updates `desktop.ini`, and applies the required Windows folder attributes.

## Where to look

- Renderer source: `src/`
- Electron main/process code: `electron/`
- Built outputs: `dist-electron/` and `build/`

## Contributing

- Open issues for bugs or feature requests.
- Submit PRs against the `main` branch and follow the existing code style.

## License

MIT License

Copyright (c) 2026 Moman Amjad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
