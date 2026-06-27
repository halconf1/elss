# Elss

Elss es una PWA local-first para registrar como amaneces cada manana, revisar tendencias semanales y conservar respaldos en JSON/CSV. Los datos se guardan en IndexedDB dentro del navegador.

## Scripts

```bash
npm install
npm run dev
npm test
npm run coverage
npm run lint
npm run build
```

## Calidad

- Tests con Vitest y React Testing Library.
- IndexedDB en tests con `fake-indexeddb`.
- Cobertura enfocada en `src/lib/**` y `src/db/**`.
- Build de produccion con Vite y PWA generada por `vite-plugin-pwa`.

## Deploy

El build estatico se publica en GitHub Pages desde la rama `gh-pages`.

URL: https://halconf1.github.io/elss/
