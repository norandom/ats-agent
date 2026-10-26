# Implementation plan

The deliverable is a portable skill protocol using existing WordCraft MCP, not another document application. References are executable host instructions; tests must exercise the shipped protocol and distinguish host judgments from deterministic validation. File ownership follows the approved design's File Structure Plan.

Use pnpm for Node tooling. The host session drives the workflow; JavaScript stays limited to small helpers and tests. Do not turn the record contract or protocol operations into a separate application or service.

Tasks run sequentially because operation tasks share one reference and tests share a selected desktop session. No parallel markers or optional acceptance tests apply. Each executable task is a bounded work unit; normal runtime work must not become a WordCraft fork, custom bridge, UI automation or another document service.

- [x] 1. Establish the verification environment
  - Prepare fictional document fixtures, a bounded test-only MCP client and an explicit selected endpoint/output directory. Discover actual tools without opening unrelated documents.
  - Reuse the available Node.js and pinned schema-validation tooling; verify runtime versions and keep executable locations out of portable assets. Separate simulated observations from actual MCP receipts.
  - Provide test invocation and cleanup behavior that leaves user documents and persistent configuration intact. Reject headless mode as evidence for live acceptance.
  - Completion is a runnable smoke probe that reads the selected synthetic desktop state through existing MCP and records its environment, plus a passing fixture/privacy boundary check.
  - _Boundary: Acceptance harness_
  - _Requirements: 1.5, 7.4, 7.5, 7.7_

- [x] 2. Establish private session records and operation evidence
  - Implement the closed versioned record schema for capabilities, bindings, snapshots, pending intents, receipts and checks.
  - Define unique identifiers, resolvable references, state fingerprints, document relationships, outcome variants and explicit evidence freshness. Exclude authentication material.
  - Cover valid records, malformed or extra fields, broken references, mismatched states and unavailable checks. Do not confuse structural validity with semantic accuracy.
  - Completion is schema validation of fictional records with passing rejection tests and clear separation between confirmed, pending, uncertain and failed outcomes.
  - _Boundary: Record contract_
  - _Depends: 1_
  - _Requirements: 1.2, 1.3, 2.5, 5.1, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3. Implement capability discovery and desktop connection guidance
  - Map actual discovered MCP tools and schemas to each required operation; bind demonstration receipts to environment, mode, tested format and version.
  - Distinguish demonstrated, failed or unsupported, unavailable and unverified operations. Missing support blocks only dependent work.
  - Use documented desktop control-port launch and CLI MCP connection, with local executable discovery and no persistent configuration edits. Handle initial visibility through available launch/MCP capabilities or a one-time user action; respect later focus changes.
  - Completion is a validated capability report that does not promote catalog presence or headless evidence into demonstrated desktop support, with missing-tool and changed-version tests passing.
  - _Boundary: Capability protocol_
  - _Depends: 2_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.7, 7.4_

- [ ] 4. Implement controlled document operations
- [x] 4.1 Bind, inspect and persist the intended document
  - Implement explicit selection and new-document binding, recording logical identity separately from observed native identifiers and paths.
  - Read content and structure through MCP; retain open/save receipts and connection continuity when native identity is unavailable. Withhold mutations when identity is ambiguous.
  - Save in place and explicitly export DOCX to a selected destination through WordCraft MCP; handle existing-file collisions and preserve unsaved work on switches. Record the exported artifact relationship to the selected document, report unconfirmed exports, and distinguish saved/exported from round-trip verified.
  - Completion is passing scripted identity, wrong-document, save failure and unsaved-switch tests, with a basic fictional live save/reopen receipt matching the selected document.
  - _Boundary: Operation protocol_
  - _Depends: 2, 3_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.1, 6.3, 6.4_

- [ ] 4.2 Apply scoped edits and preserve intervening work
  - Compare fresh MCP text/structure with the edit baseline. Resolve exact targets and verify selection; reject missing or duplicate matches.
  - Retain nonconflicting intervening changes and request a decision on overlapping changes. Check requested edits and inspected out-of-scope text and formatting afterward.
  - Keep inaccessible preservation checks not assessed and withhold dependent edits. Do not replace the whole document or automatically undo newer user work.
  - Completion is passing missing/ambiguous-target, conflict, nonconflict, changed-document and formatting-preservation scenarios with explicit before/after evidence.
  - _Boundary: Operation protocol_
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 6.2, 7.2_

- [ ] 4.3 Reconcile uncertain operations and restored access
  - Classify known pre-dispatch failures separately from uncertain dispatched writes. Preserve intent and record operation-level limitations.
  - Re-establish identity and inspect actual effects before any skill-initiated retry. Confirm recovered effects without another mutation; retain unresolved work.
  - Require fresh target and authorization checks before another attempt when absence is conclusively established. Keep transport guarantees distinct from host decisions.
  - Completion is passing scripted effect-present, effect-absent, unresolved, access-loss and reconnect-mismatch cases, with a trace showing inspection precedes any permitted retry.
  - _Boundary: Operation protocol_
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.3, 7.4_

- [ ] 5. Integrate session requests, private persistence and downstream handoff
  - Route one request at a time through capability checks and document operations using the closed record contract.
  - Persist pending intent and baseline before dispatching every mutation; do not dispatch if persistence fails. Append outcomes and resume from fresh MCP state rather than replaying stored actions.
  - Connect document/language switching and operation receipts to callers without importing candidate defaults, changing canonical facts or implementing downstream styling and questions.
  - Align the brief user workflow with delivered behavior. This is an integration task across entry, records and operations, not a separate documentation milestone.
  - Completion is an end-to-end synthetic request trace with confirmed/private pending states, a failed-persistence no-write case, and a resumed request that rebinds before editing.
  - _Boundary: Session protocol, Record contract, Operation protocol_
  - _Depends: 2, 3, 4.1, 4.2, 4.3_
  - _Requirements: 1.4, 2.7, 3.5, 4.4, 5.1, 5.4, 5.5, 5.6, 6.1, 6.2, 6.4_

- [ ] 6. Verify the complete live protocol and portable assets
- [ ] 6.1 Execute fictional CV and letter acceptance through MCP
  - Run the shipped session instructions against the selected desktop MCP connection: create, read, targeted edit, save, reopen and explicit DOCX export to a distinct selected destination for both document types. Verify exported content and its identity relationship to the source document through MCP.
  - Verify document switching and visibility with MCP evidence or explicit user observation, without another service. Check unrelated formatting/content and simulate intervening edits through a separate MCP test actor.
  - Inject a lost host response after a successful synthetic MCP operation and establish recovery without another effect. Exercise unresolved recovery and unavailable tools; label simulation scope honestly.
  - Completion is a scenario report containing actual environment-bound receipts and all required cases marked executed, failed or pending. Any missing mandatory case prevents acceptance; lifecycle text fixtures do not establish DIN or finished visual styling.
  - _Boundary: Acceptance harness_
  - _Depends: 5_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 5.6, 6.1, 6.3, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 6.2 Validate relocation, privacy and feature completeness
  - Load the explicit runtime asset set outside the checkout and run contract/protocol checks without sibling repositories, candidate inputs, model credentials or an alternative document engine.
  - Bind the final acceptance report to current runtime hashes and real MCP receipts; verify coverage of all 39 criteria and prevent simulated or stale observations from satisfying live checks.
  - Run relevant regression and privacy checks, review shareable assets manually, and record concrete remaining limitations. Keep release packaging and legacy retirement outside this feature.
  - Completion is fresh feature-level verification with executable smoke evidence, requirements/design alignment and an honest GO or outstanding-case report.
  - _Boundary: Acceptance harness_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

## Implementation Notes

- Task 2 review: when integrating pending/uncertain outcomes, add full schema-plus-integrity examples with matching receipt/intent operation types; current variant tests establish shape only.
