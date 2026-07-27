import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const cli = join(root, 'bin/pas.mjs');

function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'pas-test-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  return dir;
}

function run(args, cwd) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
  return result;
}

test('minimal init is safe and idempotent', () => {
  const dir = repo();
  run(['init', '--profile', 'minimal', '--agents', 'codex,devin'], dir);
  assert.ok(existsSync(join(dir, '.agent-stack/manifest.json')));
  assert.ok(existsSync(join(dir, 'AGENTS.md')));
  assert.ok(!existsSync(join(dir, '.agents/skills/security-audit/SKILL.md')));

  run(['init', '--profile', 'minimal', '--agents', 'codex,devin'], dir);
  const agents = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  assert.equal((agents.match(/portable-agent-stack:start/g) || []).length, 1);
});

test('web profile installs all supplemental skills', () => {
  const dir = repo();
  run(['init', '--profile', 'web'], dir);
  for (const skill of ['browser-acceptance', 'security-audit', 'release-doc-sync']) {
    assert.ok(existsSync(join(dir, `.agents/skills/${skill}/SKILL.md`)));
  }
  const config = readFileSync(join(dir, '.agent-stack/config.yml'), 'utf8');
  assert.match(config, /profile: web/);
  assert.match(config, /delegation: never/);
});

test('update preserves local skill edits and writes a candidate', () => {
  const dir = repo();
  run(['init', '--profile', 'standard'], dir);
  const skill = join(dir, '.agents/skills/security-audit/SKILL.md');
  writeFileSync(skill, `${readFileSync(skill, 'utf8')}\nLocal customization.\n`);
  run(['update'], dir);
  assert.ok(existsSync(`${skill}.pas-new`));
  assert.match(readFileSync(skill, 'utf8'), /Local customization/);
});

test('doctor succeeds for a complete minimal installation', () => {
  const dir = repo();
  run(['init', '--profile', 'minimal'], dir);
  const result = spawnSync(process.execPath, [cli, 'doctor'], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('tools install requires explicit acknowledgement', () => {
  const dir = repo();
  run(['init', '--profile', 'minimal'], dir);
  const result = spawnSync(process.execPath, [cli, 'tools', 'install'], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stdout, /rerun with --yes/);
});

test('init preserves existing AGENTS.md and gitignore content', () => {
  const dir = repo();
  writeFileSync(join(dir, 'AGENTS.md'), '# Existing project rules\n\nKeep this text.\n');
  writeFileSync(join(dir, '.gitignore'), 'node_modules/\n');
  run(['init', '--profile', 'minimal'], dir);
  const agents = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  const ignore = readFileSync(join(dir, '.gitignore'), 'utf8');
  assert.match(agents, /Existing project rules/);
  assert.match(agents, /portable-agent-stack:start/);
  assert.match(ignore, /node_modules\//);
  assert.match(ignore, /\.codegraph\//);
});

test('profile change with prune removes only unmodified managed skills', () => {
  const dir = repo();
  run(['init', '--profile', 'web'], dir);
  assert.ok(existsSync(join(dir, '.agents/skills/browser-acceptance/SKILL.md')));
  run(['update', '--profile', 'standard', '--prune'], dir);
  assert.ok(!existsSync(join(dir, '.agents/skills/browser-acceptance/SKILL.md')));
  assert.ok(existsSync(join(dir, '.agents/skills/security-audit/SKILL.md')));
});

test('standard profile config has auto_compress enabled', () => {
  const dir = repo();
  run(['init', '--profile', 'standard'], dir);
  const config = readFileSync(join(dir, '.agent-stack/config.yml'), 'utf8');
  assert.match(config, /auto_compress:/);
  assert.match(config, /enabled: true/);
  assert.match(config, /threshold_lines: 150/);
  assert.match(config, /threshold_chars: 6000/);
});

test('minimal profile config has auto_compress disabled', () => {
  const dir = repo();
  run(['init', '--profile', 'minimal'], dir);
  const config = readFileSync(join(dir, '.agent-stack/config.yml'), 'utf8');
  assert.match(config, /auto_compress:/);
  assert.match(config, /enabled: false/);
});

test('AGENTS.md contains auto-compress instructions for standard profile', () => {
  const dir = repo();
  run(['init', '--profile', 'standard'], dir);
  const agents = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  assert.match(agents, /Auto-compress \(Headroom MCP\)/);
  assert.match(agents, /headroom_compress/);
});

test('CLI override for headroom threshold works', () => {
  const dir = repo();
  run(['init', '--profile', 'standard', '--headroom-auto-compress', 'false', '--headroom-threshold-lines', '300', '--headroom-threshold-chars', '12000'], dir);
  const config = readFileSync(join(dir, '.agent-stack/config.yml'), 'utf8');
  assert.match(config, /enabled: false/);
  assert.match(config, /threshold_lines: 300/);
  assert.match(config, /threshold_chars: 12000/);
});
