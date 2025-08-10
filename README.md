# cnvrs-browser

best browser of all time

## npm cmds

- `npm run dev` - devtools
- `npm run build` - build product
- `npm start` - production stage

## notes

- Electron loads the Vite dev server in development and the `dist/index.html` in production.
- Security: `nodeIntegration` is disabled and `contextIsolation` is enabled. Use `preload.js` to expose safe APIs.
