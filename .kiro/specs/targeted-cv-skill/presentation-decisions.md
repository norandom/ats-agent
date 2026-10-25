# User-confirmed presentation decisions

Updated 2026-10-25. These preferences supersede conflicting provisional statements in the initial brief.

- Target output engine: **WordCraft MCP**. No silent substitute engine for final DOCX creation.
- Target languages: **German and English**. Language and target country are independent settings.
- Visual references: **examples/11.png, 12.png and 13.png**. All examples and their detailed analysis are private/Git-ignored.
- Accent colour: **blue**. Exact shades remain a design choice to preview.
- **No photos**, including placeholders or photo-derived decorations.
- The original CV references informed the prominent name, role headline and shaded profile band. The subsequently approved fictional demo establishes a single-column baseline; a sidebar is no longer required. Validate actual reading order rather than assuming screenshots prove compatibility.
- For applications in **Germany**, cover letters in **either German or English** follow **DIN 5008**. This is a user-required project convention. DIN 33430 concerns assessment methodology, not letter layout.
- Cover-letter generation is now explicitly in scope. Reference 13 guides branding; DIN structure takes precedence over its example letter layout. Cover letters require employer-specific contribution arguments consistent with the CV.
- A DIN letter requires verified sender/recipient details, date, subject, appropriate greeting, concise body, closing and applicable enclosure details. Do not invent missing addresses or signatures.
- A private structured candidate fact file now exists at `private/cv-facts.json`, validated against the legacy 1.0 schema now retained at `skills/targeted-cv/schemas/cv-facts-v1.schema.json`. Read `data-and-refinement-decisions.md` for the portable input contract and live refinement workflow. Never embed candidate data in the skill.
- Detailed visual review: `private/reference-analysis.md`.
- Additional practitioner PDF reviewed: “5 Second Test_Resume Rules”; findings are in `private/five-second-test-review.md`. Keep source material private.

## Source for the DIN distinction
Official publisher: https://www.dinmedia.de/de/norm/din-5008/318422674 — DIN 5008:2020-03, writing and layout rules; catalogue reviewed 2026-10-25, full paid standard not consulted.

Publisher overview: https://www.dinmedia.de/de/themenseiten/din-5008 — discusses DIN business-letter presentation, including application letters.

Detailed dimensions and spacing must be verified during design using accessible authoritative guidance or a supplied copy of the standard. Do not label an unvalidated output fully compliant.

## Approved demo direction — 2026-10-25

The user reviewed the fictional John Doe document in WordCraft and confirmed: 'ok, that is the right direction and format'. Adopt its single-column layout, blue headings, prominent name and target-role line, shaded summary, reverse chronology and concise contextual evidence bullets as the baseline. One page suits this short fictional profile; page count remains content-dependent. No photos. The synthetic inputs and reproducible scenario are in tests/fantasy-cv; generated output is ignored under outputs/john-doe-demo. This confirms presentation direction, not universal ATS compatibility, full skill completion or approval of pending implementation tasks.


Footer refinement: show current page / total pages on each CV page using automatic PAGE and NUMPAGES fields, labelled Page in English and Seite in German. Include this on single-page documents too for consistency; verify multi-page rendering and count updates.
