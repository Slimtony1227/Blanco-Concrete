// One command builds the website, applies missing database changes, and starts it.
import { spawnSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const config = ['--config', 'wrangler.local.jsonc'];
const wrangler = 'node_modules/wrangler/bin/wrangler.js';

// Keep a development access key on this computer, outside Git and the frontend.
let localVars = '';
try { localVars = readFileSync('.dev.vars', 'utf8'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
if (!/^LOCAL_ADMIN_TOKEN=.+$/m.test(localVars)) {
  appendFileSync('.dev.vars', `\nLOCAL_ADMIN_TOKEN=${randomBytes(32).toString('hex')}\n`, { mode: 0o600 });
}

function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('node_modules/vite/bin/vite.js', ['build']);
run('scripts/build-metadata.mjs', []);
run(wrangler, ['d1', 'migrations', 'apply', 'blanco-reviews-local', ...config, '--local']);
console.log('\nLocal moderation: /admin/reviews');
console.log('Open .dev.vars in your editor and copy LOCAL_ADMIN_TOKEN to sign in.\n');
const server = spawn(process.execPath, [wrangler, 'dev', ...config, '--local', '--ip', '127.0.0.1', '--port', '8787'], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
server.on('error', error => { console.error(error); process.exitCode = 1; });
server.on('exit', code => { process.exitCode = code ?? 0; });
