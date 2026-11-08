const fs = require('node:fs/promises');
const path = require('node:path');
const webpack = require('next/dist/compiled/webpack/webpack').webpack;
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, '../backend/public/assets/site');
async function build() {
  const runtime = path.join(__dirname, 'runtime.ts');
  const aliases = { '@': root, 'next/link$': path.join(__dirname, 'Link.tsx'), 'next/image$': path.join(__dirname, 'Image.tsx'), 'next/navigation$': runtime };
  for (const lib of ['api-config', 'admin-path', 'admin-auth', 'admin-data', 'games', 'categories', 'in-progress-games', 'youtube', 'site-url']) {
    aliases['@/lib/' + lib + '$'] = runtime;
    aliases[path.join(root, 'lib', lib + '.ts')] = runtime;
  }
  await fs.mkdir(output, { recursive: true });
  const stats = await new Promise((resolve, reject) => webpack({ mode: 'production', context: root, target: ['web', 'es2020'], entry: path.join(__dirname, 'entry.tsx'),
    output: { path: output, filename: 'site.[contenthash:12].js', chunkFilename: '[name].[contenthash:12].js', publicPath: '/assets/site/', clean: true },
    resolve: { extensions: ['.tsx', '.ts', '.js'], alias: aliases },
    module: { rules: [{ test: /\.tsx?$/, exclude: /node_modules/, use: path.join(__dirname, 'loader.cjs') }, { test: /\.css$/, use: path.join(__dirname, 'empty-loader.cjs') }] },
    optimization: { minimize: false, minimizer: [], splitChunks: { chunks: 'all', maxSize: 450000 } }, performance: { hints: false }, devtool: false,
  }, (error, stats) => error ? reject(error) : stats.hasErrors() ? reject(new Error(stats.toString({ all: false, errors: true }))) : resolve(stats)));
  const terser = require('next/dist/compiled/terser');
  for (const asset of await fs.readdir(output)) {
    if (!asset.endsWith('.js')) continue;
    const result = await terser.minify(await fs.readFile(path.join(output, asset), 'utf8'), { compress: true, mangle: true, format: { comments: /@license|^!/ } });
    await fs.writeFile(path.join(output, asset), result.code);
  }
  const postcss = require('postcss');
  const tailwind = require('@tailwindcss/postcss');
  const cssFiles = ['app/globals.css', 'components/header.css', 'app/in-progress/progress.css', 'app/games/[slug]/game-detail.css', 'app/about/about.css', 'app/admin/admin.css'];
  let css = (await postcss([tailwind({ base: root, optimize: true })]).process(await fs.readFile(path.join(root, cssFiles[0]), 'utf8'), { from: path.join(root, cssFiles[0]) })).css;
  for (const file of cssFiles.slice(1)) css += '\n' + await fs.readFile(path.join(root, file), 'utf8');
  css = await fs.readFile(path.join(__dirname, 'fonts.css'), 'utf8') + '\n' + css;
  css += '\n:root{--font-geist-sans:Geist,Arial,sans-serif;--font-geist-mono:Geist Mono,monospace}';
  const hash = require('node:crypto').createHash('sha256').update(css).digest('hex').slice(0, 12);
  await fs.writeFile(path.join(output, 'site.' + hash + '.css'), css);
  const assets = stats.toJson({ all: false, entrypoints: true }).entrypoints.main.assets.map(a => '/assets/site/' + a.name);
  await fs.writeFile(path.resolve(root, '../backend/public/assets/site-manifest.json'), JSON.stringify({ scripts: assets, style: '/assets/site/site.' + hash + '.css' }));
  await fs.mkdir(path.resolve(root, '../backend/public/assets/fonts'), { recursive: true });
  for (const file of await fs.readdir(path.join(__dirname, 'fonts'))) if (file.endsWith('.woff2')) await fs.copyFile(path.join(__dirname, 'fonts', file), path.resolve(root, '../backend/public/assets/fonts', file));
  for (const file of await fs.readdir(path.join(root, 'public'))) {
    const src = path.join(root, 'public', file);
    if ((await fs.stat(src)).isFile()) await fs.copyFile(src, path.resolve(root, '../backend/public', file));
  }
  await fs.copyFile(path.join(root, 'app/favicon.ico'), path.resolve(root, '../backend/public/favicon.ico'));
  console.log(stats.toString({ all: false, assets: true }));
  console.log('Built PHP-hosted React assets; Node.js is only needed on the build computer.');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
