# Implementation plan

Implement the approved document design as host-session skill instructions and bounded checks. Use pnpm for Node.js helpers/tests and the existing uvx validator. WordCraft MCP remains the sole document authoring and inspection interface. No new service, transport or runtime coordinator is part of this plan.

Tasks are sequential: shared references, test fixtures and the selected desktop session make concurrent edits or live probes unsafe. Runtime asset ownership follows the design's file structure plan. Tests are part of each deliverable; no mandatory acceptance work is optional. Read privacy steering before work and use wholly fictional inputs.

- [x] 1. Establish the document verification foundation
- [x] 1.1 Prepare fictional inputs and the installed verification environment
  - Reuse upstream profile, strategy and session validation adapters and the existing test-only MCP client. Confirm pnpm, Node.js, the pinned schema validator and selected desktop connection without reading candidate inputs.
  - Prepare unrelated fictional English/German application data, a requested CV/letter pair, missing letter metadata and a sufficiently long profile for pagination. Retain exact selected-original document identity and a private output destination.
  - Provide a deterministic test entry and read-only MCP smoke with version, executable/tool identities and privacy-safe evidence locations. Do not treat tool presence as demonstrated formatting support.
  - Completion is passing fixture/setup checks and actual read-only selected-document inspection, with no document mutation or alternative engine.
  - _Boundary: Acceptance harness_
  - _Requirements: 1.1, 1.2, 1.6, 6.5, 7.6_

- [x] 1.2 Verify the required formatting operations on fictional content
  - Probe page dimensions, margins, paragraph spacing/styles, measured address-region placement and header/footer behavior through discovered WordCraft commands and the existing session protocol.
  - Verify actual PAGE and NUMPAGES fields before and after a one-to-multiple-page change, refresh all parts, save/reopen and inspect rendered results. Distinguish point units, rendered scale and differing page-index conventions.
  - Establish how body text, field/part structure and every rendered page can be observed. Record unavailable properties accurately and restore the originally selected fictional document.
  - Completion is a reviewed actual formatting receipt showing the operations needed by both layout profiles, or specific failed/pending capabilities that block dependent work. Catalog results or historical headless scripts cannot satisfy this gate; route capability defects upstream without building a substitute engine.
  - _Boundary: Acceptance harness_
  - _Requirements: 4.3, 4.5, 4.6, 5.4, 5.5, 6.1, 6.5, 7.2, 7.3, 7.6_

- [ ] 2. Define the private document manifest and integrity checks
  - Implement the closed manifest with requested document identities, origin/current strategy hashes, exact language draft ranges, confirmed letter inputs, presentation versions, session references, anchors and revision-specific check states.
  - Reuse upstream binding and claim-reference semantics. Reject stale trusted context, duplicate document identities, invalid or overlapping ranges, partial proposition slices and unverified saved-artifact identities.
  - Preserve pending, authored, checked and delivered distinctions; a valid structure cannot establish semantic support, successful rendering or finished delivery.
  - Completion is schema-plus-integrity validation of complete fictional variants and rejection tests for cross-candidate, cross-language, stale or invented evidence, using the exact shipped helper.
  - _Boundary: Composition_
  - _Depends: 1.1, 1.2_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 6.3, 7.4_

- [ ] 3. Compose supported documents from the application strategy
- [ ] 3.1 Select and map employer-relevant document content
  - Implement the host composition instructions for current reviewed strategy text, retaining the contribution argument, clear chronology and contextual evidence rather than reproducing every fact field.
  - Separate role scope from selected achievements and review repetition across experience, projects and expertise. Every retained item must add distinct relevant evidence; long lists trigger editorial review rather than an automatic bullet-count rule.
  - Preserve authority, scale, uncertainty and temporal relevance; lead expertise with supported capabilities. Apply qualification-date/status rules and upstream editorial defaults without introducing unsupported tools, metrics or wording.
  - Map complete propositions into document sections with exact code-point spans and private claim associations. Inventory emitted factual content, including contacts and metadata-derived assertions, and review assembled meaning for qualifier loss or misleading juxtaposition.
  - Completion is independently reviewed fictional composition cases plus executable mapping checks, including repeated exact wording, differently worded propositions, partial-slice rejection and exclusion of internal review material from submitted text.
  - _Boundary: Composition_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 6.3, 7.1_

- [ ] 3.2 Preserve independent languages, pair consistency and refreshed support
  - Use one composite draft per language with separate CV/letter ranges. Keep supported output usable while another language or requested letter remains pending, without creating duplicate same-language strategy versions.
  - Route new/reworded factual claims through upstream semantic review and assembly; check CV/letter identity, chronology, qualifications and employer-specific contribution for contradictions.
  - Implement the explicit check-only strategy rebind: preserve the origin hash, validate the new current snapshot and binding, and permit no-reauthor refresh only when complete snapshots differ solely in document checks. Other changes require normal composition/support revalidation.
  - Completion is real-upstream integration coverage for both languages, one-language pending work, consistent pairs, missing inputs, changed facts/settings and accepted/rejected check-only refreshes; semantic judgments remain distinct from mechanical replay.
  - _Boundary: Composition_
  - _Requirements: 1.3, 1.4, 1.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.4_

- [ ] 4. Implement the two document presentation profiles
- [ ] 4.1 Apply the approved CV presentation and dynamic pagination
  - Implement the blue single-column CV profile with prominent identity/role, optional shaded summary, recognizable headings, standard bullets and editable body paragraphs. Keep employer, role and date associations unambiguous.
  - Apply the approved project pattern: title, readable localized month/year range and short evidence paragraph. Keep senior role-scope paragraphs separate from achievement bullets and verify that this hierarchy survives rendering and extraction.
  - Apply the design's typography, spacing and keep-with-next rules through the verified commands. Preserve readable size and content-dependent length; use no photos, rating grids or graphic bullets.
  - Add localized automatic current/total page fields on every page and apply the demonstrated refresh/persistence behavior. Retain actual applied layout settings for verification.
  - Completion is a reusable presentation reference exercised on fictional short and multi-page content, with observed correct page fields, readable layout and extraction order; failed observations remain pending.
  - _Boundary: Presentation_
  - _Depends: 1.2, 2, 3.1, 3.2_
  - _Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 4.2 Apply confirmed letter inputs and the sourced Germany layout
  - Implement letter preparation from confirmed sender, recipient, application date and selected enclosures, with an appropriate named or reviewed neutral salutation. Never infer addresses, signature images or accompanying documents.
  - Implement the personal Form B profile in either language using the verified placement mechanism. Encode the sourced zones/spacing and project typography/branding separately, with edition, authority and access limits attached to checklist rules.
  - Keep missing required inputs pending only for the affected letter. Let the letter structure take precedence over decorative examples; outside Germany, do not assert a DIN convention unless requested.
  - Completion is a reusable letter reference and checkable fictional English/German letter layouts with confirmed inputs, measured rule applicability and explicit missing-input/full-conformity limits; no source template or PDF is redistributed.
  - _Boundary: Letter_
  - _Depends: 1.2, 2, 3.2_
  - _Requirements: 3.1, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 5. Establish document checks and their consumer handoff
- [ ] 5.1 Verify observed text, structure and all-page layout
  - Implement the verification protocol for exact read-back and separate semantic review, reading-order associations, field/part inspection, every rendered page and the applicable sourced letter checklist.
  - Measure resulting layout rather than trust command arguments; retain render scale, page coverage, producer, method and evidence. Body-only extraction cannot establish footer fields, and screenshots cannot establish reading order.
  - Bind checks to observed snapshots and saved/reopened artifact bytes. Invalidate affected results after edits and distinguish passed, failed and not assessed without hiding missing pages or unobservable properties.
  - Completion is executable rejection coverage for stale or mismatched artifacts, missing page coverage, unavailable inspection and false field/geometry claims, plus check records obtained from the actual fictional formatting evidence.
  - _Boundary: Verification_
  - _Depends: 2, 4.1, 4.2_
  - _Requirements: 4.2, 4.3, 4.6, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 5.2 Return current artifact evidence without redefining scores
  - Map independently observed saved-artifact checks into the existing strategy document-check contract, retaining actual bytes/hash, observation time, method, evidence location and reason.
  - Keep editorial judgments, executed checks and unresolved issues distinct. Unsaved or unavailable artifacts cannot acquire invented hashes or passing results.
  - Exercise the consumer observation path using current actual evidence, not a copy of incoming manifest flags; return editable section mappings to refinement without treating logical anchors as native selection authority.
  - Completion is integration validation against the unchanged upstream schema and review consumer, including refusal of stale/forged evidence and preservation of not-assessed results without new score formulas.
  - _Boundary: Verification_
  - _Requirements: 6.3, 6.6, 7.4, 7.5_

- [ ] 6. Integrate composition, presentation and verification into the live session
  - Connect the host entry protocol to current strategy selection, requested document members, confirmed letter metadata, presentation profiles and existing WordCraft operations. Do not add a Node.js workflow engine.
  - Author in the selected visible desktop session, identify/select document and language switches, preserve unsaved/manual work and use fresh targeted edits. Reconcile changed content mappings before claiming supported delivery.
  - Use the existing session's pending intent, conflict and uncertain-operation recovery. Keep failures scoped to affected documents and report saved editable DOCX locations with honest check states after reopen/read-back.
  - Completion is an integrated fictional request trace that demonstrates requested-only generation, missing-letter/unsupported-language continuation, preserved intervening edits and current evidence handoff without canonical profile writes. Update user workflow guidance only to match this delivered behavior.
  - _Boundary: Composition, Presentation, Letter, Verification_
  - _Depends: 3.2, 4.1, 4.2, 5.1, 5.2_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.2, 3.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.4, 7.5_

- [ ] 7. Validate complete applications and portable assets
- [ ] 7.1 Execute bilingual document acceptance in WordCraft
  - Create wholly fictional English/German CVs and Germany-targeted letters through the completed host protocol, with supported strategy text and confirmed application metadata.
  - Read back, save/reopen and inspect every rendered page. Verify dynamic fields before/after a multi-page edit, reading-order associations, measured letter checklist rules, editable text, document switching and preservation of an intervening manual change.
  - Exercise missing inputs and unavailable checks; distinguish simulations from actual authoring evidence. Inspect generated metadata for unintended host identity, preserve private receipts and restore the selected original fictional document.
  - Completion is independently reviewed current-runtime evidence for every mandatory scenario with no required pending case. The result does not imply universal ATS compatibility or full normative DIN audit.
  - _Boundary: Acceptance harness_
  - _Depends: 6_
  - _Requirements: 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 7.2 Validate relocation, privacy and feature completeness
  - Copy the explicit five runtime assets and required upstream/test allowlists outside the checkout, then run the complete checks through pnpm without sibling repositories, real candidate input or model credentials.
  - Verify all 42 criteria, current copied hashes, exact test membership, actual receipt provenance, semantic/visual review scope and unchanged upstream contracts. Reject skipped mandatory scenarios and stale evidence.
  - Run repository/index privacy scanning and manual review, including candidate-free specs and reusable assets. Keep release packaging and legacy retirement out of this feature.
  - Completion is a fresh feature-level report with full-suite and actual runtime evidence, coverage/design/integration review and an honest GO or outstanding-case result.
  - _Boundary: Acceptance harness_
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.4, 7.5, 7.6_

## Implementation Notes

- Task 1.2: ordinary body paragraphs support measured recipient placement through document.layout caret line-top/height after reopen. Default text-box inset/wrapping and body extraction failed; do not use that recipe. Footer field cached strings may be empty while true PAGE/NUMPAGES objects persist and render correctly. Evidence remains private.
