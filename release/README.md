# Build a release candidate

Minimal packaging path: validate the definitions, capture a source snapshot, stage a prepared source tree, build the three distribution archives. Everything runs on Node.js 22 and pnpm; archive building additionally needs `zip` tooling. No CI pipeline, publication, retirement or installed-acceptance machinery — those were descoped on 2026-11-06 and remain in Git history.

```powershell
pnpm.exe release:check   # validate inventory, rights hashes and candidate contracts
pnpm.exe release:test    # deterministic maintenance controls
```

## Capture and stage a source snapshot

```powershell
node release/prepare.cjs capture --root . --source-revision (git rev-parse HEAD).Trim() --source-epoch (git show -s --format=%ct HEAD).Trim() --snapshot outputs\snapshot.json
node release/prepare.cjs stage --root . --snapshot outputs\snapshot.json --destination outputs\prepared
```

Preparation binds the exact committed revision, epoch and every generic input file by hash. It rejects substantive uncommitted changes and never overwrites a destination.

## Build the archives

`release/package.cjs` `buildArtifacts` builds the three formats declared in `release/manifest.json` (portable zip, skill alias, plugin zip) from a verified prepared source, using `release/candidate-definition.cjs` metadata. Each archive contains only the allowlisted skill subtree, guide, license and notices; private inputs, tests and release code are excluded. The result is an unapproved artifact record — privacy review and archive inspection remain separate manual steps.

## Limits

Definition checks and archive bytes establish neither installed-workflow acceptance nor host privacy review. Run the repository privacy checker on the host with explicitly selected private facts, and inspect each archive before distribution. Publication, tagging and catalog changes require a separate deliberate action.
