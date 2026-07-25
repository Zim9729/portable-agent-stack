import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const owner = value('--owner');
const repo = value('--repo') || 'portable-agent-stack';
if (!owner) {
  console.error('Usage: node scripts/configure-repository.mjs --owner <github-user-or-org> [--repo portable-agent-stack]');
  process.exit(1);
}

for (const file of ['README.md', 'README.zh-CN.md']) {
  const path = resolve(root, file);
  const current = readFileSync(path, 'utf8');
  writeFileSync(path, current.replaceAll('YOUR_GITHUB_USER/portable-agent-stack', `${owner}/${repo}`));
}

const packagePath = resolve(root, 'package.json');
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
pkg.repository = { type: 'git', url: `git+https://github.com/${owner}/${repo}.git` };
pkg.homepage = `https://github.com/${owner}/${repo}#readme`;
pkg.bugs = { url: `https://github.com/${owner}/${repo}/issues` };
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Configured repository metadata for ${owner}/${repo}.`);
