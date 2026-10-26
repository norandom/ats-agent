# Present the selected CV in WordCraft

Use this recipe after [application composition](application-documents.md) has supplied reviewed wording and private section mappings. Apply it through the [document session](document-session.md), using fresh selections and pending mutation intents. It defines the project's `cv-blue-1` presentation; these choices are not ATS rules.

## Keep evidence easy to read

Use ordinary body paragraphs in one column. Put the name and functional headline first, followed by contact details, profile, experience and the other selected sections. Keep employer, actual title and role dates together in reverse chronology. A functional headline must remain distinguishable from an employment title. Use a short scope paragraph followed by selected achievement bullets. For projects, use a title with a readable month/year range and a short evidence paragraph.

Use paragraph styles, left-aligned prose and standard text bullets. Avoid tables, text boxes, graphic bullets, ratings grids, photos and photo placeholders. Expertise, experience and projects should each add distinct evidence. Three to five role bullets are an editorial starting point, not a cap or scoring rule. Review longer lists for relevance; do not combine unrelated claims merely to reduce their count.

## Apply the baseline

| Element | `cv-blue-1` setting |
| --- | --- |
| Page | A4 portrait; 18 mm margins on all sides |
| Body | Arial 11 pt, `202020`, left aligned |
| Paragraphs | 1.1 line spacing; 0 pt before, 4 pt after |
| Name | 22 pt, blue `1F4E79` |
| Functional headline | 12 pt |
| Section headings | 12 pt bold, blue `1F4E79`; 9 pt before, 4 pt after |
| Profile summary | Pale paragraph shading `EAF1F8` |
| Entry and project labels | Bold; keep with following content |
| Footer position | 10 mm from bottom, a project choice; verify actual separation |

Keep headings, entry labels and date paragraphs with the following paragraph. Keep lines together where this avoids splitting a short scope or evidence paragraph; do not chain every paragraph into one unbreakable block. Let relevant content take the pages it needs. Do not reduce body size to hide overflow or impose a page cap. Adjust spacing or intentional breaks only after inspecting the render. Record changed settings, a new presentation profile version and the actual settings hash in the private manifest, then repeat affected checks. Never add filler to balance pages.

## Localize the document

| Purpose | English | German |
| --- | --- | --- |
| Summary | Profile | Profil |
| Work | Experience | Berufserfahrung |
| Projects | Selected projects | Ausgewählte Projekte |
| Capabilities | Expertise | Fachkenntnisse |
| Qualifications | Education / Certifications | Ausbildung / Zertifikate |
| Languages | Languages | Sprachen |
| Current date range | March 2022 - present | März 2022 - heute |
| Page label | Page | Seite |

Use the selected language for narrative and month names too. Preserve proper names and credential meaning; return changed factual wording to upstream support review. Omit completed qualification award dates by default, retain relevant expiry/renewal information and identify ongoing study. The application language does not determine its market.

## Use discovered desktop commands

Discover the current tool and command schemas before applying this mapping. Availability alone is not proof of correct behavior. All values below are command inputs to verify afterward, not measurements of the result. Convert millimetres to points with `mm * 72 / 25.4`.

1. Inspect current document identity, dirty state and text through the session before switching or editing. Preserve unsaved/manual work; ambiguous selections stay pending. Reuse the session's visibility decision and respect a later focus change.
2. For a new CV, author the reviewed paragraphs through WordCraft. Apply `para.style` with `Normal`, `layout.size` with `name: A4`, `layout.margins`, `format.font`, `format.size`, `format.color`, `para.spacing`, `para.lineSpacing` and `para.alignLeft` using the baseline. When replacing a test draft or revising existing content, inherited formatting needs fresh inspection; do not reset unrelated user formatting.
3. Resolve each heading or label uniquely against current observed text. Apply an appropriate paragraph style such as `Heading 2`, then set its explicit font, size, color, bold and paragraph spacing. Apply `para.keepNext` to headings, entry labels and dates. Use `para.keepLines` for short paragraphs as needed. Apply `para.shading` to the summary and `para.bullets` with `kind: bullet` to selected achievement paragraphs. Inspect the resulting paragraph properties and extraction order. A technical anchor alone is not selection authority.
4. Create the footer through `insert.createFooter` with the discovered page convention (observed zero-based). Type `Page ` or `Seite `, insert `insert.field` with `instr: PAGE`, type ` / `, and insert `instr: NUMPAGES`. Close the footer with `insert.closeHeader`. Use true fields in the shared footer, not typed counts or a separate static footer per page. Set `hf.position` and verify that the footer propagates across all pages and sections.
5. Run `references.updateFields` with the discovered all-parts option (observed `all: true`). Save and reopen through the session. Inspect the footer story with `insert.editFooter`, select its contents, read `fields.selected` and the observed `document.paragraph` for that story, then close it. Require persisted `PAGE` and `NUMPAGES` field objects. Empty cached strings can coexist with correct rendering; they do not prove either success or failure by themselves.
6. Read body text and document structure through MCP, comparing exact emitted text and sequence with the reviewed composition. Inspect employer/title/date associations, project labels and qualification entries. Render every page through `render_page` (observed one-based), retain page coverage and inspect each image. Confirm spacing, shading, legibility, bullets, page breaks, absence of clipping and stranded headings, and the actual localized footer values. Record render scale when measuring geometry.
7. After a content edit changes page count, refresh fields, save, reopen and repeat field, text and all-page render checks. Verify the displayed total and current page on every page, including a one-page CV. Bind private evidence to the observed snapshot, saved DOCX hash, settings hash and profile version; confirm bytes and snapshot continuity after inspection. An edit invalidates affected checks.

If footer persistence, rendering or another required observation is unavailable, keep that check pending or not assessed with its reason. Do not substitute another document engine or static counts. An attractive render does not establish extraction order, semantic support or universal ATS compatibility. Return the saved editable draft and its honest check state through the application-document handoff.
