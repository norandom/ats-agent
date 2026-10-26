# Research and design decisions

## Summary

- Feature: targeted-application-strategy.
- Discovery scope: new skill capability with full discovery and integration analysis against the validated profile feature.
- Findings: profile evidence needs trusted canonical/generation binding; evidence support and employer appeal need distinct review; optional editorial methods can improve wording without becoming required runtime installations.
- No candidate files were consulted for design. No implementation or document editing is claimed.

## Research Log

### Profile integration

Read-only delegated discovery inspected `candidate-profile.md`, `profile-contract.md`, `profile-validation.md`, `profile-updates.md` and the synthetic test patterns. The main agent synthesized these findings into the design.

EvidenceView is `{selection,profile,validation,unresolved_record_ids}`. Selection contains resolved path, profile SHA-256 and schema version, but no generation or proposal identity. Intake snapshot separately supplies generation and pending proposal. Every selection attempt resets active candidate state. The view constructor does not authenticate a report or prove its validation matches the profile. Therefore strategy rebinds canonical bytes and actual validation, excludes pending proposals from canonical support and retains generation separately.

Upstream schema/semantic states are passed, failed or not_assessed. Readiness is ready, incomplete or not_assessed. RequiredInput pointers are profile-relative; record evidence pointers are record-relative. Ready data does not establish present-day currency, and sourced evidence is not independent verification. Authorized preparation is not confirmed persistence.

### Professional grounding and terminology

[OPM job analysis](https://www.opm.gov/policy-data-oversight/assessment-and-selection/job-analysis/) was revisited on 26 October 2026. Its task/competency connection supports starting with work requirements and keeping the link to evidence explicit. It does not validate the project's scoring scale or a candidate's ability.

[ESCO skills classification](https://esco.ec.europa.eu/en/classification/skills) was revisited on the same date. The public explanatory text describes preferred/non-preferred terms, multilingual labels and concept metadata. The page displayed a temporary classification-interface error, so no live concept search or API integration is claimed. Design makes taxonomy consultation optional and records actual access/version limits; it never treats a term match as demonstrated competence.

The [English recruiting synthesis](../../../docs/recruiting-signals-2026.md) already checks primary SHRM, LinkedIn, Gallup/Lumina, Bitkom, Stepstone, WEF and screening-research sources, and qualifies vendor telemetry. It supports testing evidence preservation, temporal meaning and human readability. Its senior-signal hierarchy remains an unvalidated hypothesis and is not converted into numerical weights. Stepstone discrepancies and SHRM publication/fieldwork dates remain explicit.

### Legacy review and existing demonstrations

The [review-agent proposal](review-agent-spec.md) identifies useful staged extraction/review ideas and unsafe legacy assumptions. Strategy retains localized findings and separate review dimensions. It does not call legacy Python, reproduce arbitrary penalties or turn paragraph counts into page counts. Document checks remain external observations with artifact binding.

Existing profile tests execute JavaScript from reference blocks and distinguish real upstream schema validation from test adapters. The strategy follows that pattern for mechanics, with host-run semantic cases for prose. Deterministic expected labels alone cannot establish editorial quality.

### Editorial skills and installation choice

COBESY composition, its systemic assumptions check and writing linter guide structure. Humanizer's embedded draft/audit/revision loop guides prose. These skills were already read in this session; no cultural diagnosis or adoption network is inferred from a job advertisement. Behavioral rollout is not needed for CV composition.

The user explicitly requested links to [norandom/Skills](https://github.com/norandom/Skills) and [blader/humanizer](https://github.com/blader/humanizer), inspected on 26 October 2026. COBESY resides in the collection's `cobesy` directory. The design offers assisted installation, manual guidance or embedded fallback when missing. It does not install anything in this design phase, require the whole collection or bundle third-party code. Host installation/discovery remains outside strategy. Actual installed versions can differ from repository versions and must be recorded when executed.

User-facing documentation separates reusable facts from application workflow and links technical status rather than repeating it. Operation-specific limitations belong at the affected operation, not in recurring general warnings.

## Architecture Pattern Evaluation

| Option | Strength | Cost or limitation | Decision |
| --- | --- | --- | --- |
| Extend legacy scorer | Existing CLI and reports | Model-service coupling, unsupported heuristics, wrong runtime boundary | Reject |
| New matching service or vector index | Automated retrieval at scale | Credentials, storage and complexity without a stated need | Reject |
| Host skill protocol with structured handoff | Existing execution model, source-aware judgment, portable deterministic checks | Requires explicit semantic review and honest test limits | Select |

## Design Decisions

### One context binding across the application

Generalization: source freshness, candidate isolation, bilingual consistency and comparison all depend on knowing which inputs were reviewed. Use one binding with generation and hashes rather than unrelated caches. Preserve upstream contracts and wrap them. A hash proves byte identity, not source truth or authorization; host selection/validation remains necessary.

The independent design review identified a continuity ambiguity after updates. A profile's structural ID or reused path cannot prove candidate identity. Restoring question dispositions or comparing across a refresh requires a host-observed chain from the old binding through confirmed upstream persistence to the matching new selection. Arbitrary reselection clears prior state. The repair also makes semantic support and claim-support diagnostics explicit per language realization, so a correct original cannot conceal an inflated translation.

### Separate diagnostics instead of an overall rank

Use equal-weight demonstrated coverage by explicit priority group, semantic claim support and two ordinal editorial dimensions. No composite score. This makes unknown evidence visible and prevents good prose from offsetting an unsupported qualification. A percentage is only meaningful with its actual population and state counts. Changed populations are reported as non-comparable.

### Retain semantic judgment, adopt existing deterministic machinery

Adopt upstream profile validation, JSON Schema Draft 2020-12 and the established Node/reference-block harness. Build only strategy-specific binding, references, question selection and arithmetic checks. Reuse OPM/ESCO as bounded conceptual guidance, not a screening algorithm. No new external API or dependency version is required for strategy reasoning.

### Four responsibilities with one private result

Context, evidence planning, composition and review cover the required seams without a service layer or competing facts schema. Source lookup is a host activity, not a taxonomy service. Installation is a host handoff, not a dependency manager. Document observations enter as optional records. Canonical factual changes always return upstream.

## Risks & Mitigations

- Host judgment can overstate authority or lose temporal meaning: require proposition-level semantic review and fictional negative cases.
- A proposal can borrow a canonical hash: verify exact canonical bytes and exclude pending proposal state.
- Scores can improve through population changes: record population IDs/hash and forbid unexplained deltas.
- Question regeneration can repeat a declined request: key by semantic distinction and retain dispositions with explicit reopen reasons.
- Optional skills can drift: record actual execution/version, preserve user constraints and test the fallback.
- Text-only success can be mistaken for full application readiness: handoff state authorizes document drafting only; document checks retain their separate scope.

## References

- [Approved requirements](requirements.md).
- [Profile contract](../../../skills/targeted-cv/references/profile-contract.md).
- [Profile intake](../../../skills/targeted-cv/references/candidate-profile.md).
- [Profile validation](../../../skills/targeted-cv/references/profile-validation.md).
- [Editorial defaults](editorial-defaults.md).
- [Research synthesis](../../../docs/recruiting-signals-2026.md).
