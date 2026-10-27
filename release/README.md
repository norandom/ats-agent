# Build an alpha release

Run from the repository root with Node.js, pnpm, Dagger 0.21.8 and a container engine. Windows development can use Debian WSL and Bash for Dagger. This pipeline has no model API credentials and does not operate WordCraft.

```bash
pnpm exec node release/prepare.cjs outputs/release-context
dagger call dist --source=outputs/release-context export --path=outputs/release-dist
```

Use fresh output directories for each build. Preparation copies an explicit list of reusable assets and synthetic tests before Dagger receives its source argument. The bundle contains only the 25 files in `manifest.json` plus generated release metadata. The packer checks every archive entry and its contents, then emits ZIP, `.skill` and SHA-256 checksums.

`VERSION` must be an alpha version. The tag workflow repeats the Dagger build and publishes a GitHub prerelease. Before tagging, run the local repository privacy check with the selected private profile, inspect all newly shared files and review outgoing history. Private inputs are never supplied to container CI. Actual WordCraft acceptance remains a separate desktop gate; see the M3 validation report. This alpha release does not complete M5.
