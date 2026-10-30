# Prepare your application with Targeted CV

Keep your career facts in a private file, select an offer and work with your agent on the actual CV and cover letter in WordCraft. Start the installed skill through [SKILL.md](SKILL.md). This guide is the package README; its links stay inside the installed skill.

## Install and check your host

Select your host's local skill directory explicitly. Installation is a host filesystem operation, not an installer service. Keep a separate private working directory outside the skill folder for facts, offers, application state, documents and backups.

For a first installation, require an absent destination. Stage the verified package beside that destination, check every staged path and byte against the exact package inventory, then ask the host to place only the verified managed `targeted-cv` folder at the selected destination. Reject links, redirected paths, unexpected files and collisions. If verification fails, retain existing files and stop. Ask your host to load the installed entrypoint with its references, schemas and templates together.

Your host needs session reasoning, explicit file selection, file hashing and stable path identity. It must run the trusted JavaScript owner algorithms embedded in the installed references, with filesystem adapters that provide exclusive writing, security-preserving staging, backup and replacement, exact update authorization and saved-file readback. A host that merely reads Markdown or calls MCP cannot perform the full persistence workflow. Check these capabilities before using personal inputs; retain pending work if an adapter is unavailable.

Install uv/uvx so the host can run the required pinned schema validator. From the installed skill directory, use one of these applicant-session commands with your explicitly selected facts file:

PowerShell on Windows:

```powershell
uvx --from check-jsonschema==0.38.2 check-jsonschema --schemafile ./schemas/cv-facts.schema.json 'C:/my-private-work/facts.json'
```

Bash on Linux:

```bash
uvx --from check-jsonschema==0.38.2 check-jsonschema --schemafile ./schemas/cv-facts.schema.json '/home/me/my-private-work/facts.json'
```

Replace the illustrative input path. Structural validation does not prove truthful claims or completeness; follow [profile validation](references/profile-validation.md) too. External Node.js and pnpm are needed only if your selected host uses them to provide the required capabilities. Dagger, archive tools and checkout tests belong to release maintainers. They are not applicant-session prerequisites. The workflow requires no project model API key, separate model endpoint, maintained Python application or background Node service.

### Connect the visible WordCraft desktop

Install WordCraft desktop and `wordcraft-cli`. Desktop version 0.10.0 was exercised locally; this is an observation, not a latest-version or all-host compatibility claim. On Windows, start an interactive instance from PowerShell, adjusting the executable path if needed:

```powershell
& 'C:/Program Files/WordCraft/WordCraft.exe' --control 7981
```

Dismiss any restore prompt and keep the selected instance open. In your host's stdio MCP configuration, set command `wordcraft-cli` and arguments `mcp`, `--connect`, `127.0.0.1:7981`. Use the same port as the app. The host launches the server. Plain `wordcraft-cli mcp` is headless; file-access root flags cannot be combined with `--connect` in the tested CLI.

Before providing personal data, open an empty or fictional document. Ask the host to discover its actual WordCraft MCP tools, read the selected document's identity and text, then create and save a short fictional test in the visible window. Use [capability checks](references/wordcraft-capabilities.md) and [document-session guidance](references/document-session.md). No guessed tool names, computer-use automation or additional document service are needed. Missing capabilities leave the affected work pending with a recovery step.

The local candidate is `2.0.0-alpha.2`, covering profile, strategy, documents, document sessions and refinement. The previously published `2.0.0-alpha.1` is scoped to its earlier profile, strategy, document-session and live document capabilities. Checkout refinement validation does not prove this candidate's installed workflow. Candidate target declarations currently mark layout, host loading and workflow acceptance as not assessed. Linux build checks do not establish Linux desktop authoring support; the Windows local desktop observation does not validate every Windows host, WSL or another platform. Consult the exact artifact's release evidence before relying on a support claim. Development detail and published versions are available in the [project repository](https://github.com/norandom/ats-agent) and [releases](https://github.com/norandom/ats-agent/releases).

## Prepare reusable facts

Select your private facts path explicitly. Provide a CV or career notes for intake, or copy the [blank scaffold](templates/cv-facts.blank.json) into your private working directory. It is intentionally incomplete. Keep unknown values unknown and retain sources; ask about missing details rather than filling them with plausible claims. The [current 2.0 schema](schemas/cv-facts.schema.json) and [candidate-profile guidance](references/candidate-profile.md) define the input. Existing older files require review and an authorized migration.

For practice, you may explicitly select and copy [the complete fictional example](examples/sample-facts.json). It is never the default applicant. Do not mix its history with your own facts or infer candidate details from the machine, prior sessions or a job offer.

| Keep privately | Purpose |
| --- | --- |
| Reusable facts and original sources | Career history, evidence, uncertainty and confirmed corrections |
| Application-only evidence | Supported facts authorized for this application without becoming reusable |
| Application settings | Offer or role, language, country, requested documents and destinations |
| Documents, decisions and checkpoints | Drafts, reviews, pending work and recovery records |

Keep private backups beside your private work, outside the replaceable installation. Your host and WordCraft receive the content needed for their work; choose services you trust with it. Sharing the skill must not share your profile.

## Select an offer and answer useful questions

Ask: "Use targeted-cv with my explicitly selected private facts file and the offer below. Prepare an English CV and a cover letter for Germany. Check the WordCraft connection and ask about missing evidence first."

Choose German or English independently of country, the documents you want and a separate private destination for each. Without an offer, name a target role for a general application; job-specific coverage cannot be assessed. The [strategy workflow](references/application-strategy.md) separates employer requirements from interpretation and proposes a contribution argument supported by your experience.

Answer focused questions in your own words, skip them or confirm a qualification gap. A concrete qualitative result is useful; do not invent metrics. For each new career fact or identified group, choose application-only use or application use plus a reusable-profile update. Review exact facts and destinations before persistence. Wording approval alone does not authorize a profile update. Unresolved choices stay pending while supported content can proceed. Corrections retain provenance and conflicting earlier accounts under [profile update rules](references/profile-updates.md).

### Choose optional writing help

[COBESY](https://github.com/norandom/Skills/tree/main/cobesy), from the [Skills collection](https://github.com/norandom/Skills), helps structure the contribution argument. [Humanizer](https://github.com/blader/humanizer) helps remove generic phrasing without strengthening factual claims. These are source and setup links; the external skills are not bundled here.

If either is unavailable, choose agent-assisted installation, manual installation from the linked source, or the [embedded editorial guidance](references/strategy-editorial.md). Installation requires your explicit choice. Silence is not permission; keep existing installations and continue with the fallback if you decline. Installing an entire marketplace is unnecessary.

## Create and refine live documents

The agent brings WordCraft forward and authors the CV and requested letter live through its MCP connection. It identifies and displays each selected document when switching language or document, and respects your later focus changes. Review the [document guidance](references/application-documents.md) for blue accents, no photo, automatic current-page/total-page footers and the Germany-market letter checklist. German and English wording must preserve the same evidence.

Request changes to the opening, selected examples or layout. The [refinement workflow](references/application-refinement.md) reads the current document, preserves unrelated manual edits and saves the pending change and baseline privately before mutation. Factual changes return to your scope and persistence decision; application wording does not silently rewrite reusable facts.

After an interruption, reconnect and inspect the actual document identity and result before any further action. Do not replay stored operations. You can stop; the agent retains pending state and performs no later questions or mutations until you resume. A missing inspection or persistence capability leaves the change pending rather than pretending it succeeded.

Review actual text readback, save/reopen results and every rendered page before sending. Check reading order, pagination and applicable letter geometry. Diagnostics describe evidence coverage, support, appeal and readability, not hiring probabilities or a universal ATS score. Unavailable checks are not assessed; edits make affected earlier checks stale. Unresolved mandatory checks leave the document a draft.

## Update the skill safely

Select the new verified package and exact prior managed installation inventory. Reject an update if the old folder contains unmanaged additions, modified files or candidate-like user files. Move private work out only with your explicit decision; never silently merge or delete it to make an update pass.

Stage the new installation in a fresh sibling directory and verify its complete inventory and bytes. Retain a recovery copy of the last confirmed managed installation before replacing only that folder. On failure preserve user work, the recovery copy and the last confirmed installation. Keep facts, outputs, backups and application checkpoints outside this operation. These instructions describe the required host operation; executable installation controls and archive acceptance are separate release validation work, not checks established by this guide.
