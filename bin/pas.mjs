#!/usr/bin/env node
import { doctor, initStack, installTools, listProfiles, registerMcp, updateStack, version } from '../lib/stack.mjs';

function help() {
  console.log(`Portable Agent Stack ${version}

Usage:
  pas init [options]
  pas update [options]
  pas doctor [options]
  pas tools install [options]
  pas mcp register [options]
  pas profiles
  pas version

Init options:
  --target <path>                 Target Git repository (default: current repo)
  --profile <name>                minimal | standard | web | full (default: standard)
  --agents <list>                 Comma-separated Agent names (default: codex,devin)
  --gstack <never|auto>           Override profile delegation policy
  --machine-summary <mode>        never | auto | always
  --force                         Overwrite conflicting managed files
  --dry-run                       Print changes without writing

Update options:
  --target <path>
  --profile <name>                Change profile while updating
  --prune                         Remove obsolete unmodified managed files
  --force                         Overwrite locally modified managed files
  --dry-run

Doctor options:
  --target <path>
  --strict                        Treat missing optional tools/index as failures

Tools install options:
  --target <path>
  --agents <list>
  --user <name>
  --with-matt                     Launch the interactive Matt Pocock skill installer
  --matt-skills <list>            Non-interactive Matt skills: "default" or comma-separated names
  --skip <list>                   trellis,codegraph,headroom,matt
  --yes                           Required acknowledgment for global installations
  --mcp-register                  Register Headroom MCP for specified agents without installing tools
  --dry-run
`);

  console.log(`MCP register options:
  --agents <list>                 Comma-separated Agent names (default: codex,devin)
  --dry-run
`);
}

function parse(tokens) {
  const options = {};
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (['force', 'dryRun', 'prune', 'strict', 'yes', 'withMatt', 'mcpRegister'].includes(key)) options[key] = true;
    else {
      const value = tokens[i + 1];
      if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
      options[key] = value;
      i += 1;
    }
  }
  if (options.gstack) options.gstackDelegation = options.gstack;
  return options;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
    help();
    return 0;
  }

  const command = args[0];
  if (command === 'version' || command === '--version' || command === '-v') {
    console.log(version);
    return 0;
  }
  if (command === 'profiles') {
    for (const profile of listProfiles()) {
      console.log(`${profile.name.padEnd(9)} ${profile.description}`);
    }
    return 0;
  }
  if (command === 'init') {
    initStack(parse(args.slice(1)));
    return 0;
  }
  if (command === 'update') {
    updateStack(parse(args.slice(1)));
    return 0;
  }
  if (command === 'doctor') {
    return doctor(parse(args.slice(1)));
  }
  if (command === 'tools' && args[1] === 'install') {
    return installTools(parse(args.slice(2)));
  }
  if (command === 'mcp' && args[1] === 'register') {
    return registerMcp(parse(args.slice(2)));
  }

  throw new Error(`Unknown command: ${args.join(' ')}`);
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((error) => {
    console.error(`error: ${error.message}`);
    process.exit(1);
  });
