'use strict';

const fs = require('fs');
const path = require('path');
const pkg = path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'core');
const source = path.join(pkg, 'assets', 'regular');
const target = path.join(__dirname, '..', 'public', 'icons', 'phosphor');
const license = path.join(pkg, 'LICENSE');

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });

const icons = fs.readdirSync(source).filter((file) => file.endsWith('.svg'));
for (const icon of icons) {
  fs.copyFileSync(path.join(source, icon), path.join(target, icon));
}
fs.copyFileSync(license, path.join(target, 'LICENSE.txt'));

console.log(`Copied ${icons.length} Phosphor icons to public/icons/phosphor`);
