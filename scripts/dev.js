import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function run(name, cwd, cmd, args) {
  const p = spawn(cmd, args, {
    cwd,
    stdio: 'pipe',
    shell: true,
  });
  p.stdout.on('data', (d) => {
    for (const line of d.toString().split('\n').filter(Boolean)) {
      console.log(`[${name}] ${line}`);
    }
  });
  p.stderr.on('data', (d) => {
    for (const line of d.toString().split('\n').filter(Boolean)) {
      console.error(`[${name}] ${line}`);
    }
  });
  p.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });
  return p;
}

console.log('Starting downspace dev servers...\n');

const server = run('server', path.join(root, 'server'), 'npx', ['tsx', 'watch', 'src/index.ts']);
const client = run('client', path.join(root, 'client'), 'npx', ['vite']);

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  client.kill();
  process.exit(0);
});
