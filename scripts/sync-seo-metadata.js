#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.thinkersgk.com';
const CHECK_ONLY = process.argv.includes('--check');
const EXCLUDED_DIRS = new Set(['.git', '.wrangler', 'drafts', 'graphify-out', 'node_modules', 'raw']);

function listHtmlFiles(directory) {
    const files = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
        if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...listHtmlFiles(absolute));
        else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
    }
    return files;
}

function publicUrl(file) {
    const relative = path.relative(ROOT, file).split(path.sep).join('/');
    return relative === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${relative}`;
}

function alternateMarkup(enFile, jaFile) {
    const enUrl = publicUrl(enFile);
    const jaUrl = publicUrl(jaFile);
    return [
        `<link rel="alternate" hreflang="en" href="${enUrl}">`,
        `<link rel="alternate" hreflang="ja" href="${jaUrl}">`,
        `<link rel="alternate" hreflang="x-default" href="${enUrl}">`,
    ].join('\n');
}

function synchronize(file, language, enFile, jaFile) {
    const original = fs.readFileSync(file, 'utf8');
    let updated = original.replace(/<html\b([^>]*?)\blang=["'][^"']*["']([^>]*)>/i, `<html$1lang="${language}"$2>`);
    if (updated === original && !/<html\b[^>]*\blang=/i.test(original)) {
        updated = updated.replace(/<html\b([^>]*)>/i, `<html lang="${language}"$1>`);
    }

    const alternatePattern = /\s*<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["'](?:en|ja|x-default)["'])[^>]*>\s*/gi;
    updated = updated.replace(alternatePattern, '\n');
    const canonicalPattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
    const canonical = updated.match(canonicalPattern);
    if (!canonical) throw new Error(`${path.relative(ROOT, file)}: paired page is missing a canonical link`);
    updated = updated.replace(canonicalPattern, `${canonical[0]}\n${alternateMarkup(enFile, jaFile)}`);

    if (updated !== original && !CHECK_ONLY) fs.writeFileSync(file, updated, 'utf8');
    return updated !== original;
}

const files = listHtmlFiles(ROOT);
const fileSet = new Set(files);
const pairs = files
    .filter((file) => file.endsWith('.ja.html'))
    .map((jaFile) => ({ jaFile, enFile: jaFile.replace(/\.ja\.html$/, '.html') }))
    .filter(({ enFile }) => fileSet.has(enFile));

const changed = [];
for (const { enFile, jaFile } of pairs) {
    if (synchronize(enFile, 'en', enFile, jaFile)) changed.push(path.relative(ROOT, enFile));
    if (synchronize(jaFile, 'ja', enFile, jaFile)) changed.push(path.relative(ROOT, jaFile));
}

if (CHECK_ONLY && changed.length) {
    console.error(`SEO metadata drift detected in ${changed.length} paired page(s):`);
    changed.forEach((file) => console.error(`- ${file}`));
    process.exit(1);
}

console.log(`${CHECK_ONLY ? 'Checked' : 'Synchronized'} SEO metadata: ${pairs.length} EN/JA pairs, ${changed.length} ${CHECK_ONLY ? 'drifted' : 'updated'} pages.`);
