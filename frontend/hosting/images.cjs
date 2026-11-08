const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../../backend/storage/app/public/games');
async function walk(dir, relative = '') {
 let count = 0;
 for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
  if (entry.name.startsWith('.')) continue;
  const name = relative ? relative + '/' + entry.name : entry.name;
  const source = path.join(dir, entry.name);
  if (entry.isDirectory()) { count += await walk(source, name); continue; }
  if (!/\.(png|jpg|jpeg|webp|avif)$/i.test(entry.name)) continue;
  const key = crypto.createHash('sha256').update(name).digest('hex');
  for (const width of [480, 640, 960, 1280]) {
   await sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(root, '.variants', key + '-' + width + '.webp'));
  }
  count++;
 }
 return count;
}
(async () => { await fs.mkdir(path.join(root, '.variants'), { recursive: true }); console.log('Prepared responsive thumbnails for ' + await walk(root) + ' images.'); })().catch(e => { console.error(e); process.exitCode = 1; });
