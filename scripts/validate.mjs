import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
let failures = 0;

function fail(message) {
  console.error(`FAIL ${message}`);
  failures += 1;
}

function ok(message) {
  console.log(`OK   ${message}`);
}

function parseFrontmatter(text, file) {
  if (!text.startsWith('---\n')) {
    fail(`${file}: missing YAML frontmatter`);
    return {};
  }
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) {
    fail(`${file}: unterminated YAML frontmatter`);
    return {};
  }
  const block = text.slice(4, end);
  const result = {};
  for (const line of block.split('\n')) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (match && !line.startsWith('  ')) result[match[1]] = match[2].replace(/^"|"$/g, '');
  }
  return result;
}

for (const required of ['README.md', 'README.zh-CN.md', 'LICENSE', 'THIRD_PARTY.md', 'bin/pas.mjs']) {
  if (!existsSync(join(root, required))) fail(`missing ${required}`);
  else ok(required);
}

const skillRoot = join(root, 'skills');
const skills = readdirSync(skillRoot).filter((name) => statSync(join(skillRoot, name)).isDirectory());
for (const skill of skills) {
  const file = join(skillRoot, skill, 'SKILL.md');
  if (!existsSync(file)) {
    fail(`${skill}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(file, 'utf8');
  const fm = parseFrontmatter(text, file);
  if (fm.name !== skill) fail(`${skill}: frontmatter name must match directory`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.name || '')) fail(`${skill}: invalid name`);
  if ((fm.name || '').length > 64) fail(`${skill}: name exceeds 64 chars`);
  if (!fm.description || fm.description.length > 1024) fail(`${skill}: invalid description`);
  if (fm.license !== 'MIT') fail(`${skill}: license should be MIT`);
  if (!fm.compatibility) fail(`${skill}: compatibility is required by project policy`);
  const lineCount = text.split('\n').length;
  if (lineCount > 130) fail(`${skill}: SKILL.md is too long (${lineCount} lines); move detail to references`);
  else ok(`${skill}/SKILL.md (${lineCount} lines)`);

  const refs = join(skillRoot, skill, 'references');
  if (!existsSync(refs)) fail(`${skill}: missing references directory`);
  else {
    for (const entry of readdirSync(refs)) {
      if (entry.endsWith('.json')) {
        try {
          JSON.parse(readFileSync(join(refs, entry), 'utf8'));
          ok(`${skill}/references/${entry}`);
        } catch (error) {
          fail(`${skill}/references/${entry}: ${error.message}`);
        }
      }
    }
  }
}

for (const entry of readdirSync(join(root, 'profiles'))) {
  if (!entry.endsWith('.json')) continue;
  const profile = JSON.parse(readFileSync(join(root, 'profiles', entry), 'utf8'));
  for (const skill of profile.skills) {
    if (!skills.includes(skill)) fail(`${entry}: unknown skill ${skill}`);
  }
  if (!['never', 'auto', 'always'].includes(profile.machineSummary)) fail(`${entry}: invalid machineSummary`);
  if (!['never', 'auto'].includes(profile.gstackDelegation)) fail(`${entry}: invalid gstackDelegation`);
  ok(`profiles/${entry}`);
}

if (pkg.version !== '1.0.0') fail(`unexpected package version ${pkg.version}`);

if (failures > 0) process.exit(1);
console.log('\nValidation passed.');
