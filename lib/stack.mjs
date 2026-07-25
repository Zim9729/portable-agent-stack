import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
const AGENTS_START = '<!-- portable-agent-stack:start -->';
const AGENTS_END = '<!-- portable-agent-stack:end -->';
const GITIGNORE_START = '# portable-agent-stack:start';
const GITIGNORE_END = '# portable-agent-stack:end';
const SUPPORTED_TRELLIS_AGENTS = new Set([
  'claude', 'cursor', 'opencode', 'codex', 'kiro', 'kilo', 'gemini',
  'antigravity', 'devin', 'qoder', 'codebuddy', 'copilot', 'droid',
  'pi', 'omp', 'reasonix', 'zcode'
]);

export const version = PACKAGE.version;
export const repoRoot = REPO_ROOT;

function log(message = '') {
  process.stdout.write(`${message}\n`);
}

function warn(message) {
  process.stderr.write(`warning: ${message}\n`);
}

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function sha256File(file) {
  return sha256Buffer(readFileSync(file));
}

function ensureDir(dir, dryRun = false) {
  if (!dryRun) mkdirSync(dir, { recursive: true });
}

function listFiles(dir) {
  const output = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) output.push(...listFiles(full));
    else output.push(full);
  }
  return output;
}

function commandExists(command) {
  const checker = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(checker, [command], { stdio: 'ignore' }).status === 0;
}

function run(command, args, { cwd, dryRun = false, allowFailure = false } = {}) {
  log(`$ ${command} ${args.join(' ')}`);
  if (dryRun) return 0;
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: false });
  if (result.error) {
    if (allowFailure) {
      warn(`${command} failed: ${result.error.message}`);
      return 1;
    }
    throw result.error;
  }
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
  return result.status ?? 1;
}

export function resolveGitRoot(target) {
  const cwd = resolve(target || process.cwd());
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    throw new Error(`Target is not inside a Git repository: ${cwd}`);
  }
}

export function loadProfile(name) {
  const file = join(REPO_ROOT, 'profiles', `${name}.json`);
  if (!existsSync(file)) {
    const choices = readdirSync(join(REPO_ROOT, 'profiles'))
      .filter((entry) => entry.endsWith('.json'))
      .map((entry) => entry.replace(/\.json$/, ''))
      .sort();
    throw new Error(`Unknown profile '${name}'. Available: ${choices.join(', ')}`);
  }
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function listProfiles() {
  return readdirSync(join(REPO_ROOT, 'profiles'))
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => loadProfile(entry.replace(/\.json$/, '')))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderConfig(profile, overrides = {}) {
  const template = readFileSync(join(REPO_ROOT, 'assets/core/agent-stack/config.yml.template'), 'utf8');
  return template
    .replaceAll('{{PROFILE}}', profile.name)
    .replaceAll('{{MACHINE_SUMMARY}}', overrides.machineSummary || profile.machineSummary)
    .replaceAll('{{GSTACK_DELEGATION}}', overrides.gstackDelegation || profile.gstackDelegation);
}

function desiredManagedFiles(profile, overrides = {}) {
  const items = new Map();
  const add = (source, destination, content = null) => {
    items.set(destination, content === null ? readFileSync(source) : Buffer.from(content));
  };

  const config = renderConfig(profile, overrides);
  add('', '.agent-stack/config.yml', config);
  add('', '.agent-stack/config.example.yml', config);
  add(join(REPO_ROOT, 'assets/core/docs/agents/STACK.md'), 'docs/agents/STACK.md');

  for (const skill of profile.skills) {
    const sourceDir = join(REPO_ROOT, 'skills', skill);
    for (const source of listFiles(sourceDir)) {
      const suffix = relative(sourceDir, source);
      add(source, join('.agents/skills', skill, suffix));
    }
  }
  return items;
}

function upsertMarkedBlock(file, block, start, end, dryRun = false) {
  let current = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const startIndex = current.indexOf(start);
  const endIndex = current.indexOf(end);
  let next;

  if (startIndex >= 0 && endIndex >= startIndex) {
    const after = endIndex + end.length;
    next = `${current.slice(0, startIndex)}${block.trim()}${current.slice(after)}`;
  } else {
    const separator = current.length > 0 && !current.endsWith('\n') ? '\n\n' : current.length > 0 ? '\n' : '';
    next = `${current}${separator}${block.trim()}\n`;
  }

  if (next !== current) {
    log(`${dryRun ? 'would update' : 'updated'} ${file}`);
    if (!dryRun) {
      ensureDir(dirname(file));
      writeFileSync(file, next.endsWith('\n') ? next : `${next}\n`);
    }
  }
}

function copyIfAbsent(source, destination, dryRun = false) {
  if (existsSync(destination)) return false;
  log(`${dryRun ? 'would create' : 'created'} ${destination}`);
  if (!dryRun) {
    ensureDir(dirname(destination));
    copyFileSync(source, destination);
  }
  return true;
}

function writeManagedInitial(targetRoot, desired, force, dryRun) {
  const checksums = {};
  for (const [relativePath, content] of desired) {
    const destination = join(targetRoot, relativePath);
    if (existsSync(destination)) {
      const current = readFileSync(destination);
      if (sha256Buffer(current) === sha256Buffer(content)) {
        checksums[relativePath] = sha256Buffer(content);
        continue;
      }
      if (!force) {
        const sideFile = `${destination}.pas-new`;
        log(`${dryRun ? 'would write' : 'wrote'} conflict candidate ${sideFile}`);
        if (!dryRun) {
          ensureDir(dirname(sideFile));
          writeFileSync(sideFile, content);
        }
        warn(`kept existing ${relativePath}; review ${relativePath}.pas-new`);
        continue;
      }
    }
    log(`${dryRun ? 'would install' : 'installed'} ${relativePath}`);
    if (!dryRun) {
      ensureDir(dirname(destination));
      writeFileSync(destination, content);
    }
    checksums[relativePath] = sha256Buffer(content);
  }
  return checksums;
}

function writeManifest(targetRoot, manifest, dryRun = false) {
  const file = join(targetRoot, '.agent-stack/manifest.json');
  log(`${dryRun ? 'would write' : 'wrote'} .agent-stack/manifest.json`);
  if (!dryRun) {
    ensureDir(dirname(file));
    writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

function parseAgents(value) {
  const agents = String(value || 'codex,devin')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(agents)];
}

export function initStack(options = {}) {
  const targetRoot = resolveGitRoot(options.target);
  const profile = loadProfile(options.profile || 'standard');
  const agents = parseAgents(options.agents);
  const dryRun = Boolean(options.dryRun);
  const desired = desiredManagedFiles(profile, options);

  log(`Initializing Portable Agent Stack ${version}`);
  log(`Target:  ${targetRoot}`);
  log(`Profile: ${profile.name}`);
  log(`Agents:  ${agents.join(', ') || 'none specified'}`);

  const checksums = writeManagedInitial(targetRoot, desired, Boolean(options.force), dryRun);

  upsertMarkedBlock(
    join(targetRoot, 'AGENTS.md'),
    readFileSync(join(REPO_ROOT, 'assets/core/snippets/AGENTS.block.md'), 'utf8'),
    AGENTS_START,
    AGENTS_END,
    dryRun
  );
  upsertMarkedBlock(
    join(targetRoot, '.gitignore'),
    readFileSync(join(REPO_ROOT, 'assets/core/gitignore.block'), 'utf8'),
    GITIGNORE_START,
    GITIGNORE_END,
    dryRun
  );

  copyIfAbsent(join(REPO_ROOT, 'assets/core/CONTEXT.md'), join(targetRoot, 'CONTEXT.md'), dryRun);
  copyIfAbsent(join(REPO_ROOT, 'assets/core/docs/adr/README.md'), join(targetRoot, 'docs/adr/README.md'), dryRun);

  const manifest = {
    schemaVersion: 1,
    stackVersion: version,
    profile: profile.name,
    agents,
    skills: profile.skills,
    installedAt: new Date().toISOString(),
    managedFiles: checksums
  };
  writeManifest(targetRoot, manifest, dryRun);

  log('\nRepository files are ready. Global tools were not installed.');
  log('Next: run `pas tools install --yes` only if you want the optional upstream tools configured.');
  return manifest;
}

function loadManifest(targetRoot) {
  const file = join(targetRoot, '.agent-stack/manifest.json');
  if (!existsSync(file)) throw new Error('No .agent-stack/manifest.json found. Run `pas init` first.');
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function updateStack(options = {}) {
  const targetRoot = resolveGitRoot(options.target);
  const manifest = loadManifest(targetRoot);
  const profile = loadProfile(options.profile || manifest.profile);
  const desired = desiredManagedFiles(profile, options);
  const dryRun = Boolean(options.dryRun);
  const force = Boolean(options.force);
  const nextChecksums = { ...manifest.managedFiles };
  const conflicts = [];

  for (const [relativePath, content] of desired) {
    const destination = join(targetRoot, relativePath);
    const desiredHash = sha256Buffer(content);
    const previousHash = manifest.managedFiles?.[relativePath];

    if (!existsSync(destination)) {
      log(`${dryRun ? 'would add' : 'added'} ${relativePath}`);
      if (!dryRun) {
        ensureDir(dirname(destination));
        writeFileSync(destination, content);
      }
      nextChecksums[relativePath] = desiredHash;
      continue;
    }

    const currentHash = sha256File(destination);
    if (currentHash === desiredHash) {
      nextChecksums[relativePath] = desiredHash;
      continue;
    }

    if (force || (previousHash && currentHash === previousHash)) {
      log(`${dryRun ? 'would update' : 'updated'} ${relativePath}`);
      if (!dryRun) writeFileSync(destination, content);
      nextChecksums[relativePath] = desiredHash;
    } else {
      const sideFile = `${destination}.pas-new`;
      log(`${dryRun ? 'would write' : 'wrote'} ${relativePath}.pas-new`);
      if (!dryRun) writeFileSync(sideFile, content);
      conflicts.push(relativePath);
    }
  }

  if (options.prune) {
    const desiredPaths = new Set(desired.keys());
    for (const [relativePath, previousHash] of Object.entries(manifest.managedFiles || {})) {
      if (desiredPaths.has(relativePath)) continue;
      const destination = join(targetRoot, relativePath);
      if (!existsSync(destination)) {
        delete nextChecksums[relativePath];
        continue;
      }
      if (force || sha256File(destination) === previousHash) {
        log(`${dryRun ? 'would remove' : 'removed'} ${relativePath}`);
        if (!dryRun) rmSync(destination, { force: true });
        delete nextChecksums[relativePath];
      } else {
        warn(`not pruning modified file ${relativePath}`);
      }
    }
  }

  upsertMarkedBlock(
    join(targetRoot, 'AGENTS.md'),
    readFileSync(join(REPO_ROOT, 'assets/core/snippets/AGENTS.block.md'), 'utf8'),
    AGENTS_START,
    AGENTS_END,
    dryRun
  );
  upsertMarkedBlock(
    join(targetRoot, '.gitignore'),
    readFileSync(join(REPO_ROOT, 'assets/core/gitignore.block'), 'utf8'),
    GITIGNORE_START,
    GITIGNORE_END,
    dryRun
  );

  writeManifest(targetRoot, {
    ...manifest,
    stackVersion: version,
    profile: profile.name,
    skills: profile.skills,
    updatedAt: new Date().toISOString(),
    managedFiles: nextChecksums
  }, dryRun);

  if (conflicts.length > 0) {
    warn(`${conflicts.length} locally modified file(s) were preserved; review the matching .pas-new files.`);
  }
}

export function doctor(options = {}) {
  const targetRoot = resolveGitRoot(options.target);
  let failures = 0;
  let manifest;
  try {
    manifest = loadManifest(targetRoot);
  } catch (error) {
    log(`[fail] ${error.message}`);
    return 1;
  }

  const profile = loadProfile(manifest.profile);
  const required = [
    '.agent-stack/config.yml',
    '.agent-stack/manifest.json',
    'AGENTS.md',
    'CONTEXT.md',
    'docs/adr/README.md',
    'docs/agents/STACK.md',
    ...profile.skills.map((skill) => `.agents/skills/${skill}/SKILL.md`)
  ];

  log(`Portable Agent Stack doctor — profile ${profile.name}\n`);
  for (const relativePath of required) {
    if (existsSync(join(targetRoot, relativePath))) log(`[ok]   ${relativePath}`);
    else {
      log(`[fail] ${relativePath}`);
      failures += 1;
    }
  }

  const agentsText = existsSync(join(targetRoot, 'AGENTS.md')) ? readFileSync(join(targetRoot, 'AGENTS.md'), 'utf8') : '';
  if (!agentsText.includes(AGENTS_START) || !agentsText.includes(AGENTS_END)) {
    log('[fail] AGENTS.md managed block');
    failures += 1;
  } else log('[ok]   AGENTS.md managed block');

  log('\nOptional commands');
  for (const command of ['trellis', 'codegraph', 'headroom']) {
    const present = commandExists(command);
    log(`[${present ? 'ok' : 'info'}] ${command}${present ? '' : ' not installed'}`);
    if (options.strict && !present) failures += 1;
  }

  if (existsSync(join(targetRoot, '.codegraph'))) log('[ok]   .codegraph index');
  else {
    log('[info] .codegraph index not present');
    if (options.strict) failures += 1;
  }

  return failures === 0 ? 0 : 1;
}

export function installTools(options = {}) {
  const targetRoot = resolveGitRoot(options.target);
  if (!options.yes) {
    log('This command performs global installations and runs upstream project initializers.');
    log('Review THIRD_PARTY.md and rerun with --yes to continue.');
    return 2;
  }

  const skip = new Set(String(options.skip || '').split(',').map((item) => item.trim()).filter(Boolean));
  const agents = parseAgents(options.agents);
  const user = options.user || (() => {
    try {
      return execFileSync('git', ['config', 'user.name'], { cwd: targetRoot, encoding: 'utf8' }).trim() || 'developer';
    } catch {
      return 'developer';
    }
  })();

  if (!skip.has('trellis')) {
    if (!commandExists('npm')) throw new Error('npm is required to install Trellis.');
    run('npm', ['install', '-g', '@mindfoldhq/trellis@latest'], { cwd: targetRoot, dryRun: options.dryRun });
    const flags = agents.filter((agent) => SUPPORTED_TRELLIS_AGENTS.has(agent)).map((agent) => `--${agent}`);
    run('trellis', ['init', '-u', user, ...flags], { cwd: targetRoot, dryRun: options.dryRun });
    for (const agent of agents) {
      if (!SUPPORTED_TRELLIS_AGENTS.has(agent)) warn(`Trellis platform flag is not known for '${agent}'; the shared .agents/skills layer can still be used.`);
    }
  }

  if (!skip.has('codegraph')) {
    if (!commandExists('npm')) throw new Error('npm is required to install CodeGraph.');
    if (!commandExists('codegraph')) {
      run('npm', ['install', '-g', '@colbymchenry/codegraph'], { cwd: targetRoot, dryRun: options.dryRun });
    }
    run('codegraph', ['install', '--yes'], { cwd: targetRoot, dryRun: options.dryRun, allowFailure: true });
    run('codegraph', ['init'], { cwd: targetRoot, dryRun: options.dryRun });
  }

  if (!skip.has('headroom')) {
    if (!commandExists('uv')) {
      warn("uv is not installed. Install uv, then run: uv tool install --python 3.13 'headroom-ai[all]'");
    } else if (commandExists('headroom')) {
      run('uv', ['tool', 'upgrade', 'headroom-ai'], { cwd: targetRoot, dryRun: options.dryRun, allowFailure: true });
    } else {
      run('uv', ['tool', 'install', '--python', '3.13', 'headroom-ai[all]'], { cwd: targetRoot, dryRun: options.dryRun });
    }
  }

  if (options.withMatt && !skip.has('matt')) {
    if (!commandExists('npx')) throw new Error('npx is required to install Matt Pocock skills.');
    run('npx', ['skills@latest', 'add', 'mattpocock/skills'], { cwd: targetRoot, dryRun: options.dryRun });
  }

  log('\nUpstream tool setup finished. Review generated files and run `pas doctor`.');
  if (agents.includes('devin')) {
    log('Devin note: configure CodeGraph and Headroom MCP using docs/integrations.md if they were not detected automatically.');
  }
  return 0;
}
