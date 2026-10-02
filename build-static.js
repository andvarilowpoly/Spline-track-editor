import { cp, mkdir, copyFile, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await copyFile('index.html', 'dist/index.html');
await copyFile('styles.css', 'dist/styles.css');
await copyFile('manual.html', 'dist/manual.html');
await cp('js', 'dist/js', { recursive: true });
await cp('vendor', 'dist/vendor', { recursive: true });
