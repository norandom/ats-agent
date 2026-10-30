# Task group 3 validation

## Result

VERIFIED for tasks 3.1 through 3.4 as a complete selected group. Two fresh preparations and actual Dagger builds from the same committed source produced identical content and archive bytes in all three formats. Independent archive verification, host identifier scanning and fresh extraction passed. This is an artifact-pipeline result; installed WordCraft acceptance and full M5 readiness remain unfinished.

Selected source: `f17d812c6b55c8005096b569b95f3852d9b58692`, epoch `1793352422`, local candidate `2.0.0-alpha.2`. The completion-report commit follows this source revision and does not change the selected generic build inputs. Each subtask passed independent review. This additional cross-task integration assessment was performed inline against the approved ArtifactPipeline design and actual outputs.

## Executed verification

Two distinct `prepareRun` calls captured the same committed revision into absent module directories. Each contained only five module bootstrap files and the explicitly inventoried 240-file candidate source. Neither private facts nor author configuration entered Dagger. The controller copied each module into its own Linux temporary directory, selected that directory and invoked:

```bash
dagger call dist --source=candidate-source --source-revision="$SOURCE_REVISION" --source-epoch="$SOURCE_EPOCH" --run-id="$RUN_ID" export --path="$DIST"
```

Both actual executions exited 0. Each ran all current M5 deterministic tests and the three affected M3 contract, language and context suites: **65 passed, zero failed, zero skipped**. Production and export passed in both attempts. Distinct recorded attempt IDs were `group3-main-left-1793352471603769416` and `group3-main-right-1793352857041398827`; execution logs confirm both ran rather than merely comparing copied reports.

The selected prepared `release/pipeline.cjs` compared both prepared sources and output directories. It independently verified all six archives, exact output sets and checksum files, checked source/input identity and reported both `content: true` and `archive_bytes: true`. Comparison exited 0. The portable ZIP and `.skill` alias are also byte-identical within each build.

| Format | Bytes | SHA-256 in both builds |
| --- | ---: | --- |
| Portable ZIP | 193353 | `33e865e564f124765f99948225fc1938b46ec056501f7fb2592d615effa5b001` |
| `.skill` alias | 193353 | `33e865e564f124765f99948225fc1938b46ec056501f7fb2592d615effa5b001` |
| Plugin ZIP | 196505 | `cfd5da960c4099facd09fa25fcbecfee9f564fec08c5dad6ad4f6e06aa9b6838` |

Canonical build-input digest: `1ef4fa9882500c85ec36c836ff3a0f54d0b2c0949ef9f9fea51d45ab743f3c3b`. Both reports observed Node 22.23.4, pnpm 10.18.3, uv 0.9.8, check-jsonschema 0.38.2, Python 3.12.12 and Info-ZIP 3.0. Dagger client and engine were 0.21.8. Attempt IDs and tool observations remain outside canonical archive identity.

On the host, the selected prepared verifier inspected each first-build archive using runtime-only private identifiers, then extracted into three absent explicit destinations. All three passed, including privacy scans and exact inventories of 36, 36 and 42 entries. Equal second-build bytes were independently established by comparison. Manual inspection covered the selected generic allowlist, generated release/host metadata and support labels. These checks do not establish that a keyword scan can recognize every possible personal-data paraphrase.

Private execution evidence remains under ignored `outputs/m5-task34/`: the Dagger runtime and main-build logs, both prepared contexts, both dist directories, `reproducibility.json` and `host-verification.json`. The precommit fictional Git fixture run remains separately identified and is not substituted for either main-source build.

## Cross-task integration

| Task | Verified handoff | Requirement contribution |
| --- | --- | --- |
| 3.1 | Exact selected Git bytes and provenance enter a verified generic snapshot; raw payload bytes are preserved | 1.1, 1.3, 2.1, 2.2, 2.5, 2.7 |
| 3.2 | Builder consumes that immutable snapshot and creates all declared layouts, identities and checksums | 1.1, 1.2, 1.3, 2.1, 2.5, 6.6 |
| 3.3 | Separate verifier checks actual ZIP headers, contents, source-derived metadata and safe extraction without importing the builder | 1.5, 2.2 through 2.5, 2.7 |
| 3.4 | Dagger and local commands pass explicit provenance, execute current gates and compare content and bytes separately | 2.6, 3.1, 5.4, 6.4, 6.6 |

No blocking mismatch was found between snapshot, construction, verification and comparison. All 31 tested core resource hashes remain unchanged. The full payload contains 35 mapped sources; plugin-specific metadata and root notices explain its larger installed inventory. Runtime application reasoning remains in the existing skill owners. Release helpers do not call model endpoints, discover candidate inputs or author documents.

Windows staging originally exposed 0777 permissions despite chmod and was correctly rejected by the verifier. Final Dagger runs construct archives on the Linux container filesystem and export only finished files. That negative observation is retained separately. Checkout CRLF observations are excluded from canonical input identity; selected blob bytes determine the build.

## Completion gate and remaining work

Task/group verification: VERIFIED from current independent reviews, both actual committed-source Dagger runs, nonzero passing regressions, exact source/byte comparison and host archive checks. Repository privacy and staged-content checks accompany the completion commit. The 44-criterion map remains a plan for the entire milestone; this report does not claim all criteria have final installed evidence.

GitHub Actions has matching candidate-validation wiring but was not executed remotely in this work. CI correctly leaves privacy, installed-host and desktop acceptance unassessed. No remote publication, tag, registry or sibling catalog was changed. Legacy files remain intact.

Next is group 4: safe standalone installation, installed-owner observations and evidence verification. Actual installed bilingual document/refinement acceptance, readiness aggregation and conditional legacy retirement follow under the approved task plan.
