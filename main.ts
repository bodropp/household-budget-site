// RumahAnggaran — the program that hands the site in (Node 22, standard
// library only). It assembles /output from this repository: the static site
// in app/, the screenshots in screenshots/, and the dossier the judge reads,
// built with the vendored make.fun library so the scorer can reproduce it
// byte for byte. It runs twice in the grader and both runs must write the
// same bytes, so there is no timestamp, no randomness and no network here —
// just copies and one deterministic build.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Refuse to hand in a half-built tree: the site and its screenshots must
// exist before anything is copied, so a typo fails loudly instead of
// shipping an empty entry.
function mustExist(path, what) {
  if (!existsSync(path)) throw new Error(`missing ${what}: ${path}`);
  return path;
}

const appDir = mustExist(join(repoRoot, 'app'), 'app/');
const shotsDir = mustExist(join(repoRoot, 'screenshots'), 'screenshots/');
mustExist(join(appDir, 'index.html'), 'app/index.html');

const shotFiles = readdirSync(shotsDir)
  .filter((f) => statSync(join(shotsDir, f)).isFile() && !f.startsWith('.'));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shotFiles.length}`);
}

mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB, more than 993 files and directories in
// app/ or 16 MiB of app files. app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`handed in ${shotFiles.length} screenshots: ${shotFiles.join(', ')}`);
console.log(`dossier.json: ${dossier.length} bytes`);
