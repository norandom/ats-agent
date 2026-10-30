# Validate a release candidate

Maintainers can prepare two source-bound builds, verify each archive and compare their content and bytes. Use Node.js 22, pnpm 10.18.3, Dagger 0.21.8, uv 0.9.8, Python 3.12 and a container engine. Host preparation needs `uvx` and the pinned validator as well as Node.js. Warm it with `uvx --from check-jsonschema==0.38.2 check-jsonschema --version` before preparation. The container pins Node.js 22.23.4 and uv 0.9.8. `validation.json` records actual tool versions outside the archives.

Select a committed revision with the intended maintenance changes. Preparation captures its full revision, commit epoch and exact generic inventory in `SOURCE-SNAPSHOT.json`. It rejects substantive uncommitted changes. All destinations below must be absent. Choose a new output prefix for a repeat run.

The Dagger `dist` entrypoint runs the complete deterministic inventory before packaging. Export its validation report separately with `dagger call validate --source=candidate-source --source-revision="$SOURCE_REVISION" --source-epoch="$SOURCE_EPOCH" --run-id=YOUR_SAME_ATTEMPT_ID export --path=../validation` in Bash. Use `$env:SOURCE_REVISION` and `$env:SOURCE_EPOCH` in PowerShell. Reusing the same attempt ID for the matching `dist` and `validate` calls retrieves the same execution; choose a fresh ID for another run. Reports remain outside the six-file distribution set. Generic success leaves actual host acceptance and all 44 actual criteria unassessed.

For current host candidate A/B selections, owner validators, criterion review and the read-only retirement gate, follow [retirement maintenance](retirement.md). Its fixed A/B policy preserves acceptance before removal and fresh validation after removal. No command here publishes or retires anything.

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

## Exercise safe host installation

For collection and independent read-only evidence checking, follow [installed observations](installed-observation.md) and [installed evidence verification](installed-evidence.md). Their mechanical checks leave workflow acceptance and release readiness unassessed.

The package [adopter guide](adopter-guide.md) remains the user-facing authority. Release maintenance can exercise its filesystem operation through `installManaged` in `release/install.cjs`. This callable helper runs once in the selected host; it provides no installer service, application workflow or readiness authority. Keep facts, outputs, application state and private backups outside the installation parent used for staging and recovery.

Select `{archive, expected}` independently. `expected` contains the exact outer `artifact` record and selected `prepared` source identity used by `verifyArtifact`; it must not contain an extraction destination. Load maintenance code from that selected prepared source. No source checkout is needed to follow the installed skill after installation. The maintenance helper stays outside every distribution format.

Call `installManaged(selection, {destination, stage})` for an initial installation. Both paths must be explicit absolute paths, absent, distinct siblings under an existing parent. Only the managed `targeted-cv` skill folder is promoted, including when the selected archive is the plugin format. Plugin metadata is retained in staging; this operation does not register a plugin or validate host loading.

For an update call `installManaged(selection, {destination, stage, prior, recovery})`. `prior` is another independently selected `{archive, expected}` for the last managed installation. The helper verifies both actual archives, rejects changed or additional installed files and directories, verifies the fresh sibling stage, and copies the exact prior installation to the absent sibling `recovery`. It retains the displaced managed tree under `stage/prior-managed` as well. Recovery and staged files remain available on failure; interrupted promotion attempts to restore the previous directory only if the destination remains absent. Unexpected files are never removed to make restoration pass.

The operator must guarantee exclusive filesystem access throughout. A cooperative sibling `.install-lock` directory prevents simultaneous helper calls but cannot exclude arbitrary host writers or guarantee security against filesystem races. Redirected ancestors, links and hardlinked managed files are rejected. The helper never silently merges installations or deletes a stage, recovery copy, existing user file or unexpected lock contents. Inspect retained paths locally before an explicit retry.

Use `pnpm.exe release:test` from PowerShell on Windows or `pnpm release:test` from Bash on Linux for the maintenance controls. They build generic fictional Git fixtures, inspect actual archives, and check installed guidance in a fresh process after both fixture source locations become unavailable. These checks cover routing, filesystem controls and declared prerequisites only. Host reasoning, optional-skill decisions and live WordCraft operations still require separately collected installed acceptance; the helper always reports them as `not_assessed` and never grants release readiness.

Read-only candidate decisions: [exact-artifact readiness](readiness.md). Missing actual installed acceptance remains unassessed; no readiness result authorizes publication or retirement.
