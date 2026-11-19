// GTA VI trophy guide — entrypoint.
// Copies app/ and screenshots/ into the output directory, then writes
// dossier.json with the make.fun vendor helper (buildDossier).
// Mount-safe: /output is a volume in the grader sandbox, so we create it
// and clear only its contents — we never remove the directory itself.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repo = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });

// Clear only the contents of the output directory.
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

for (const dir of ['app', 'screenshots']) {
  const src = join(repo, dir);
  if (!existsSync(src)) throw new Error(`missing ${dir}/ in repo root`);
  cpSync(src, join(outDir, dir), { recursive: true });
}

// The trophy data is the heart of the entry: refuse to build without it.
if (!existsSync(join(repo, 'app', 'data', 'trophies.json'))) {
  throw new Error('missing app/data/trophies.json in repo root');
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`wrote ${outDir}/dossier.json (${dossier.length} bytes)`);
