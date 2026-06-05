# Tintd Pro

Tintd Pro (Windows Edition) is an Electron + React desktop application for customizing Windows folder icons.

## Scripts

- `npm run dev` starts Vite and Electron for local development.
- `npm run build` type-checks and builds the renderer and Electron main process.
- `npm run dist` creates a Windows `.exe` installer with electron-builder.

## Stack

- Electron
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui-style components
- SQLite via `better-sqlite3`

## Windows folder icons

Tintd Pro writes a generated `.ico` file inside each selected folder, updates `desktop.ini`, and applies the required Windows folder attributes.
# Tinted-
