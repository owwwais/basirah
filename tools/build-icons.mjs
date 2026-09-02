#!/usr/bin/env node
/**
 * Builds the icon sprite from tools/icons.json — the single source of truth.
 *
 *   node tools/build-icons.mjs
 *
 * Writes assets/icons.svg (the library file the app consumes) and rewrites the
 * sprite inlined between the ICON SPRITE markers in index.html. The sprite is
 * inlined rather than referenced with <use href="assets/icons.svg#id"> because
 * external <use> has never been reliable in Safari.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const icons = JSON.parse(readFileSync(resolve(root, 'tools/icons.json'), 'utf8'));

const symbol = (name, paths) =>
  `<symbol id="i-${name}" viewBox="0 0 24 24">` +
  // An inline style, not a fill attribute: the .ic rule sets fill:none in CSS
  // and CSS always beats a presentation attribute.
  paths.map(p => `<path d="${p.d}"${p.fill ? ` style="fill:${p.fill}"` : ''}/>`).join('') +
  `</symbol>`;

const all = [
  ...Object.entries(icons.library).map(([n, p]) => symbol(n, p)),
  ...Object.entries(icons.utility).map(([n, p]) => symbol(n, p)),
];

// Stroke attributes live on the sprite root so every symbol inherits them and
// no single icon can drift from the spec.
const attrs =
  'fill="none" stroke="currentColor" stroke-width="1.75" ' +
  'stroke-linecap="butt" stroke-linejoin="miter"';

writeFileSync(
  resolve(root, 'assets/icons.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>\n` +
    all.map(s => '  ' + s).join('\n') +
    '\n</svg>\n'
);

const START = '<!-- ICON SPRITE:START -->';
const END = '<!-- ICON SPRITE:END -->';
const htmlPath = resolve(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const a = html.indexOf(START);
const b = html.indexOf(END);
if (a === -1 || b === -1) throw new Error('icon sprite markers not found in index.html');

const inline =
  `${START}\n` +
  `    <svg xmlns="http://www.w3.org/2000/svg" ${attrs} aria-hidden="true" ` +
  `style="position:absolute;width:0;height:0;overflow:hidden">\n` +
  all.map(s => '      ' + s).join('\n') +
  `\n    </svg>\n    `;

writeFileSync(htmlPath, html.slice(0, a) + inline + html.slice(b));
console.log(`built ${all.length} icons (${Object.keys(icons.library).length} library + ${Object.keys(icons.utility).length} utility)`);
