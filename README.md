# cnvrs-browser

A minimal Electron + React (Vite) app using plain JavaScript.

## Scripts

- `npm run dev` — start Vite and launch Electron in development.
- `npm run build` — build the React UI with Vite to `dist/`.
- `npm start` — run Electron against the built `dist/` (production mode).

## Getting started

1. Install dependencies

```powershell
npm install
```

2. Run in development

```powershell
npm run dev
```

3. Build and run production

```powershell
npm run build
npm start
```

## Notes

- Electron loads the Vite dev server in development and the `dist/index.html` in production.
- Security: `nodeIntegration` is disabled and `contextIsolation` is enabled. Use `preload.js` to expose safe APIs.
