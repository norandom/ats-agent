# Application-document research and decisions

## Summary

- Feature: wordcraft-application-documents. Discovery scope: complex integration, full discovery.
- The user approved 42 requirements on 2026-10-26. The design reuses validated strategy and session contracts; it adds document presentation and evidence mapping, not a new application.
- Exact wordings can be shared through a composite strategy draft per language. WordCraft formatting schemas are discoverable, but current desktop effects still need synthetic acceptance.
- Accessible publisher guidance supports a bounded DIN 5008:2020 letter checklist. The full standard and corrigendum text were not read; full normative conformity must not be inferred.

## Research log

### Existing contracts

Read `application-strategy.md`, `strategy-contract.md`, `strategy-editorial.md`, `strategy-review.md`, their schema, and the session references/schema. Independent discovery confirmed one draft version per language, Unicode code-point spans and one wording per language realization. Repeated identical wording uses multiple spans; different wording requires separately reviewed propositions. New document prose must pass upstream review.

Session snapshots identify live state; strategy document observations require saved artifact bytes/hash. These identities cannot substitute for each other. The document manifest connects the two without changing either upstream contract. Only independently observed current evidence may implement `observeDocumentArtifacts()`.

### WordCraft capability discovery

Read-only MCP `list_commands` on the selected installed desktop confirmed `layout.size`, `layout.margins`, `hf.position`, `insert.createFooter`, `insert.field` and `references.updateFields`. Measurements use points. Footer page selection is zero-based; `render_page` is one-based and its scale is pixels per point. Field update supports all parts. These are catalog facts, not proof of current rendering or persistence effects.

The explicitly selected fictional session receipt shows section dimensions, margins, part/selection information, blocks and page count. `get_text` returns body text, so footer fields require part inspection and rendered checks. Historical fictional composition/pagination scripts illustrate formatting sequences but start headless MCP; they are not adopted as the live runtime. Their separate ZIP footer checker is not a replacement for MCP verification.

Official source URLs were attempted during discovery but the web reader returned cache misses. No newer release behavior was inferred. Current installed catalog observations and the existing reviewed session evidence govern this design. [WordCraft repository](https://github.com/storytold/wordcraft) provides source context; runtime discovery remains mandatory.

### Letter sources and access limits

| Source | Use and limit |
| --- | --- |
| [DIN Media standard catalogue](https://www.dinmedia.de/de/norm/din-5008/318422674) | Identifies DIN 5008:2020-03; full paid text not inspected |
| [DIN Media corrigendum](https://www.dinmedia.de/de/norm/din-5008-berichtigung-1/324255916) | Identifies correction 2020-07; correction contents not inspected |
| [DIN Media overview](https://www.dinmedia.de/de/themenseiten/din-5008) | Describes business-letter/application use; project adoption is a user convention, not a statutory claim |
| [Klett 2020 guide](https://www.klett.de/inhalt/media_fast_path/32/DO01_3-12-007172_Onlinematerialien_DIN5008.pdf) | Publisher-authored educational guidance, PDF pages 12-16; supports personal-letter sequence, spacing and address zones; not full normative text |
| [Westermann instructional extract](https://c.wgr.de/d/25aef4740c0c03f859bd05b3db0a3c333bcf16cdf9baef604a1e104b803a5b35.pdf/978-3-8045-4780-3_28.pdf) | Corroborates Form B address box at 20/45 mm, 85 by 45 mm, with text starting 25 mm from left |

The official template download requires registration and marketing consent; neither was submitted. Source PDFs/templates will not be redistributed. Older public postal diagrams use different address zones; they are not combined with the chosen 2020 guidance. Relative teaching-example line numbers do not establish absolute text baselines. The implementation must measure actual rendered geometry.

### Applied skills and project decisions

Kiro full discovery, design synthesis and review gates govern this specification. COBESY composition and Humanizer defaults, recorded in `docs/writing-guide.md`, keep the design organized by decisions and observable outcomes. The approved presentation record supplies blue/no-photo styling, single-column CVs and page fields; these are user preferences, not claims derived from HR standards. Privacy steering prohibits real candidate data in this specification and its evidence.

## Architecture pattern evaluation

| Option | Benefit | Cost | Decision |
| --- | --- | --- | --- |
| Host protocol with bounded references | Fits session flow and existing MCP | Host must perform semantic and visual review | Selected |
| Node application coordinating generation | More scripted orchestration | Duplicates session ownership and conflicts with user direction | Rejected |
| Reuse legacy compositor as runtime | Existing command examples | Headless assumptions and separate state model | Test inspiration only |
| Alternate DOCX renderer/parser | Could bypass capability gaps | Violates WordCraft-only authoring/inspection boundary | Rejected |

## Design decisions

### One composition path with per-document mappings

CV and letter share the same reviewed language draft, but retain separate document ranges, identities and checks. This generalizes only the mapping needed by current requirements. It avoids duplicate language versions and an invented second claim model. Independent languages and missing letter inputs remain independently actionable.

Design review required whole-proposition containment and host review of the assembled document, because slicing and juxtaposition can change meaning despite valid source references. It also identified a hash feedback loop when document checks are attached to the strategy. The manifest retains its origin hash and explicitly rebinds its current hash after validation only when the complete snapshots differ solely in top-level `document_checks`; other changes follow ordinary revalidation.

### Adopt session behavior and native fields

Reuse existing discovery, binding, pending intents and recovery. Native PAGE/NUMPAGES fields and all-parts refresh are selected instead of typed page values. A focused fictional probe must establish persistence, multi-page updates and inspection before document acceptance. No bridge or external service is planned.

### Keep layout rules and evidence separate

Five runtime assets are sufficient: composition entry, CV presentation, Germany letter rules, verification, and one closed manifest schema. Host review owns meaning and visual assessment; helpers inspect spans, identities and checks. Design tokens are explicit project choices, while letter rules carry source/edition/access limits. The output can pass that sourced checklist without claiming the entire paid standard was audited.

## Risks and mitigations

- Formatting commands may not persist or expose required fields: verify early through actual MCP save/reopen/render; leave affected checks pending if unavailable.
- A composite draft can lose provenance during slicing: exact Unicode spans, complete proposition inventory and fresh upstream review precede authoring.
- A manual edit can be preserved but unsupported: retain it, invalidate the content mapping and return changed wording to support review.
- A saved hash can describe a different revision from the render: bind observations to snapshot and artifact, then confirm continuity before handoff.
- Letter sources do not establish full standard coverage: publish source-backed checklist results with access limits; no silent conformity upgrade.
- Layout work can expand into a replacement application: runtime remains host instructions and pure checks, with pnpm test tooling only.
