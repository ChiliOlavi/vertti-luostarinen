#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// This script generates sitemap.xml for root-level .html files.
// Usage:
//   BASE_URL=https://your-domain.example node scripts/generate-sitemap.js
// If BASE_URL is not provided the script will emit relative paths and
// print a warning. It's recommended to provide BASE_URL when deploying.

const ROOT = process.cwd();
const outPath = path.join(ROOT, 'sitemap.xml');
const baseUrl = (process.env.BASE_URL || '').trim().replace(/\/$/, '');

function findHtmlFiles() {
  // Only include top-level .html files in the project root.
  // This avoids including build artifacts or runtime files in subfolders.
  // Exclude files that should not be published (e.g., blog drafts).
  const EXCLUDE = new Set(['blog.html', 'post.html']);
  return fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html') && !EXCLUDE.has(f))
    .map(f => path.posix.join('/', f === 'index.html' ? '' : f));
}

const files = findHtmlFiles();

if (!baseUrl) {
  console.warn('WARNING: BASE_URL not provided. Sitemap will contain relative paths.');
  console.warn('Set BASE_URL (e.g. BASE_URL=https://example.com) to generate absolute URLs.');
}

const now = new Date().toISOString();

const urlEntries = files.map(p => {
  const loc = baseUrl ? `${baseUrl}${p}` : p;
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>`;

fs.writeFileSync(outPath, xml, 'utf8');
console.log('sitemap.xml written to', outPath);
if (!baseUrl) console.log('Note: sitemap contains relative paths; provide BASE_URL to use absolute URLs.');
