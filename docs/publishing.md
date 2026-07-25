# Publishing this repository

## Before the first push

1. Choose a GitHub repository name, for example `portable-agent-stack`.
2. Configure links and package metadata:

```bash
node scripts/configure-repository.mjs --owner YOUR_GITHUB_USER --repo portable-agent-stack
```

3. Review the MIT copyright line.
4. Run:

```bash
npm run check
npm run pack:check
```

5. Initialize and push:

```bash
git init
git add .
git commit -m "feat: initial open-source release"
git branch -M main
git remote add origin git@github.com:YOUR_GITHUB_USER/portable-agent-stack.git
git push -u origin main
```

## Release

Create and push a semantic version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The release workflow validates the project, creates an npm package tarball, and attaches it to a GitHub release. Publishing to npm is intentionally not automatic; configure npm provenance and permissions before adding that step.

## GitHub repository settings

Recommended:

- enable private vulnerability reporting
- protect `main`
- require the CI workflow
- enable squash merge
- enable Dependabot alerts even though the runtime has no npm dependencies
