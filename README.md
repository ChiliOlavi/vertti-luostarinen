# A Personal Website built with Vite and Hydra

## Sitemap

Generate a sitemap for production domain:

```powershell
$env:BASE_URL='https://vertti.eu'; node scripts/generate-sitemap.js
```

Or use npm script (when npm is available in PATH):

```powershell
npm run generate-sitemap:prod
```

## Deploy To GitHub Pages

1. Build and prepare the publish folder:

```powershell
npm run build:pages
```

This generates the site and ensures `dist` includes:
- `sitemap.xml`
- `robots.txt`
- `CNAME` (set to `vertti.eu`)

2. Publish `dist` to the `gh-pages` branch:

```powershell
npm run deploy
```

If `npm` is not available in your current terminal PATH, run:

```powershell
node node_modules/vite/bin/vite.js build; node scripts/prepare-pages.js; node node_modules/gh-pages/bin/gh-pages.js -d dist
```

3. In GitHub repository settings:
- Open Settings -> Pages
- Source: Deploy from a branch
- Branch: `gh-pages` and folder `/ (root)`
- Custom domain: `vertti.eu`
- Enable Enforce HTTPS after certificate is issued

4. DNS for `vertti.eu`:
- Add A records for apex domain to:
	- `185.199.108.153`
	- `185.199.109.153`
	- `185.199.110.153`
	- `185.199.111.153`
- Optional `www` host as CNAME to `ChiliOlavi.github.io`