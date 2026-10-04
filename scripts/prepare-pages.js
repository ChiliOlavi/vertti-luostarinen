#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const DOMAIN = (process.env.SITE_DOMAIN || 'vertti.eu').trim();
const BASE_URL = `https://${DOMAIN}`;

function ensureDist() {
  if (!fs.existsSync(DIST)) {
    throw new Error('dist folder not found. Run the Vite build first.');
  }
}

function runSitemapGeneration() {
  execSync('node scripts/generate-sitemap.js', {
    cwd: ROOT,
    env: { ...process.env, BASE_URL },
    stdio: 'inherit'
  });
}

function copyFileToDist(fileName) {
  const src = path.join(ROOT, fileName);
  const dest = path.join(DIST, fileName);
  if (!fs.existsSync(src)) {
    throw new Error(`${fileName} not found at project root.`);
  }
  fs.copyFileSync(src, dest);
}

function writeCname() {
  fs.writeFileSync(path.join(DIST, 'CNAME'), `${DOMAIN}\n`, 'utf8');
}

function main() {
  ensureDist();
  runSitemapGeneration();
  copyFileToDist('sitemap.xml');
  copyFileToDist('robots.txt');
  writeCname();
  console.log('Prepared dist for GitHub Pages: sitemap.xml, robots.txt, CNAME');
}

main();
