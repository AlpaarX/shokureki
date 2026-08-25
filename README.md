# Shokureki

A standalone document workspace extracted from Jobinder. It includes editors and A4 previews for:

- English CVs
- Japanese 履歴書
- Japanese 職務経歴書

Document versions save automatically in the browser. Use the PDF button to open a print-ready A4 document.

All document data, including every CV version, is stored only in the browser's local storage. It is not sent to a server or committed to this repository.

## Development

```sh
npm install
npm run dev
```

## Deployment

Pushes to `main` are built and deployed to GitHub Pages by the workflow in `.github/workflows/deploy-pages.yml`.
