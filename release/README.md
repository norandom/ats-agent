# Validate a release candidate

Maintainers can prepare two source-bound builds, verify each archive and compare their content and bytes. Use Node.js 22, pnpm 10.18.3, Dagger 0.21.8, uv 0.9.8, Python 3.12 and a container engine. Host preparation needs `uvx` and the pinned validator as well as Node.js. Warm it with `uvx --from check-jsonschema==0.38.2 check-jsonschema --version` before preparation. The container pins Node.js 22.23.4 and uv 0.9.8. `validation.json` records actual tool versions outside the archives.

Select a committed revision with the intended maintenance changes. Preparation captures its full revision, commit epoch and exact generic inventory in `SOURCE-SNAPSHOT.json`. It rejects substantive uncommitted changes. All destinations below must be absent. Choose a new output prefix for a repeat run.

## Prepare two contexts

Run from the repository root. Bash on Linux or Debian WSL:

```bash
export SOURCE_REVISION="$(git rev-parse HEAD)"
export SOURCE_EPOCH="$(git show -s --format=%ct HEAD)"
node <<'NODE'
const fs=require('node:fs'),path=require('node:path');
const {prepareRun}=require('./release/pipeline.cjs');
const sides={};
for(const name of ['left','right']) {
  const result=prepareRun({root:process.cwd(),sourceRevision:process.env.SOURCE_REVISION,sourceEpoch:Number(process.env.SOURCE_EPOCH)},`outputs/${name}`);
  if(result.status!=='passed')throw Error('Preparation failed');
  sides[name]={prepared:{root:result.prepared,sourceRevision:result.sourceRevision,sourceEpoch:result.sourceEpoch},dist:path.resolve(`outputs/${name}-dist`)};
}
fs.writeFileSync('outputs/comparison-inputs.json',JSON.stringify(sides,null,2),{flag:'wx'});
NODE
```

In PowerShell, set the same variables and pipe the JavaScript block above to `pnpm.exe exec node` using a single-quoted here-string:

```powershell
$env:SOURCE_REVISION = (git rev-parse HEAD).Trim()
$env:SOURCE_EPOCH = (git show -s --format=%ct HEAD).Trim()
@'
const fs=require('node:fs'),path=require('node:path');
const {prepareRun}=require('./release/pipeline.cjs');
const sides={};
for(const name of ['left','right']) {
  const result=prepareRun({root:process.cwd(),sourceRevision:process.env.SOURCE_REVISION,sourceEpoch:Number(process.env.SOURCE_EPOCH)},`outputs/${name}`);
  if(result.status!=='passed')throw Error('Preparation failed');
  sides[name]={prepared:{root:result.prepared,sourceRevision:result.sourceRevision,sourceEpoch:result.sourceEpoch},dist:path.resolve(`outputs/${name}-dist`)};
}
fs.writeFileSync('outputs/comparison-inputs.json',JSON.stringify(sides,null,2),{flag:'wx'});
'@ | pnpm.exe exec node
```

The copied module has five generic configuration files and a `candidate-source` child. Select that module directory before Dagger discovers configuration. Never supply the checkout, private inputs or author configuration as the source argument.

## Execute two fresh builds

Bash on Linux or Debian WSL:

```bash
set -euo pipefail
for attempt in left right; do
  (
    cd "outputs/$attempt"
    dagger call dist --source=candidate-source --source-revision="$SOURCE_REVISION" --source-epoch="$SOURCE_EPOCH" --run-id="$(date +%s%N)-$attempt" export --path="../$attempt-dist"
  )
done
pnpm exec node outputs/left/candidate-source/release/pipeline.cjs compare outputs/comparison-inputs.json
```

PowerShell with Dagger installed in Debian WSL:

```powershell
$linuxRoot = (wsl.exe -d Debian --exec wslpath -a $PWD.Path).Trim()
$daggerPath = (wsl.exe -d Debian --exec /bin/bash -c 'command -v dagger || test ! -x "$HOME/.local/bin/dagger" || echo "$HOME/.local/bin/dagger"').Trim()
foreach ($attempt in @('left','right')) {
  $runId = [guid]::NewGuid().ToString()
  wsl.exe -d Debian --cd "$linuxRoot/outputs/$attempt" --exec $daggerPath call dist --source=candidate-source --source-revision=$env:SOURCE_REVISION --source-epoch=$env:SOURCE_EPOCH --run-id=$runId export --path=../$attempt-dist
  if ($LASTEXITCODE -ne 0) { throw 'Dagger build failed' }
}
pnpm.exe exec node outputs/left/candidate-source/release/pipeline.cjs compare outputs/comparison-inputs.json
```

Each attempt has a distinct run ID before validation and production, so Dagger executes them again while reusing tool installation caches. The ID stays outside archive metadata and canonical input identity. Build staging and archive construction use the container filesystem. Windows or DrvFS staging can expose different permission bits despite `chmod`; export only completed archives.

## Interpret the checks

Dagger checks the explicit revision and epoch against the descriptor before further work. It runs every current M5 deterministic test and the three M3 document contract, language and context suites on a separate writable `/work` copy. Synthetic Git there supports tests only. Production uses the selected `/source/release` code and leaves `/source` unchanged.

The output has three archives, `artifacts.json`, `SHA256SUMS` and `validation.json`. Comparison independently verifies all formats against each selected prepared source. It reports content and archive-byte equality separately, records both toolchains and rejects changed inputs, missing formats, corruption and unexplained differences. Equal content never transfers installed acceptance between different archive bytes. Canonical input identity includes only path, size and SHA-256; checkout transport observations stay outside it.

For local deterministic checks use `pnpm release:test`. For direct Linux production use `pnpm release:pipeline produce selected-options.json`, with an explicit `prepared` object containing `root`, `sourceRevision`, numeric `sourceEpoch`, and an absent absolute `dist` directory. Set a unique `RELEASE_BUILD_ATTEMPT` for each invocation. Comparison requires nonempty distinct recorded attempt IDs and cannot establish their authenticity from self-reported records alone; retain the actual execution logs.

CI repeats both preparations and Dagger executions. Green CI covers generic deterministic checks, archive integrity and reproducibility. Host privacy review, installed-host operation and live WordCraft desktop acceptance remain `not_assessed`; it grants no release GO. Run the repository privacy checker on the host with explicitly selected private facts and inspect each archive using `release/verify.cjs` with optional host-only privacy inputs. Keep private evidence outside build contexts.

Candidate validation performs no publication. Tag creation, publication and catalog changes require a separate deliberate release action and current readiness evidence. Historical `release/notes.md` describes the earlier alpha and remains unchanged.
