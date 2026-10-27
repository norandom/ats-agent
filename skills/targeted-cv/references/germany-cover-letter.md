# Germany cover letters

Use profile `de-letter-b-1` for a requested Germany-targeted letter in either English or German. Market and language are independent. Follow [application composition](application-documents.md) and the [session protocol](document-session.md); this reference is a host recipe, not a document generator.

## Confirm content before authoring

Read the selected current facts and reviewed strategy. Confirm sender name, contact and postal address; recipient organization and address; target role; application date; reviewed greeting, body and closing; and the actual accompanying items. Record provenance in the private manifest. List missing required inputs in `missing_required`, keep that letter pending, and ask through the host. The independently ready CV or other language can proceed. Do not fill missing addresses from memory, machine identity or another candidate.

A named addressee and signature image are optional. Review a neutral greeting such as "Dear Hiring Team," or "Sehr geehrte Damen und Herren," when no person is named. Use the confirmed typed signer name; add a signature image only when explicitly supplied and selected. A blank signature area does not assert a signature exists. List only selected accompanying documents as enclosures, and confirm their availability before delivery.

Develop one employer-specific argument: the advertised need, a supported example and its useful contribution. Do not repeat CV chronology, infer motivation, upgrade advisory work to ownership or invent employer facts. Follow the strategy's COBESY composition and Humanizer defaults. Return any new factual wording to upstream semantic review. Localize dates, greeting, subject, prose and closing; keep proper names, postal addresses and credential meaning intact. Check the complete CV/letter pair for contradictions. Keep claim IDs, evidence labels, scores and drafting notes private.

## Source register and checklist

[DIN Media](https://www.dinmedia.de/de/norm/din-5008/318422674) identifies edition 2020-03; its [corrigendum catalogue](https://www.dinmedia.de/de/norm/din-5008-berichtigung-1/324255916) identifies 2020-07. Neither full paid text was inspected. The catalogue establishes identity, not verification of every rule. The project uses accessible publisher guidance:

- K: [Klett 2020 guide, PDF pages 12-16](https://www.klett.de/inhalt/media_fast_path/32/DO01_3-12-007172_Onlinematerialien_DIN5008.pdf), educational guidance referring to DIN 5008:2020.
- W: [Westermann instructional extract](https://c.wgr.de/d/25aef4740c0c03f859bd05b3db0a3c333bcf16cdf9baef604a1e104b803a5b35.pdf/978-3-8045-4780-3_28.pdf), corroborating publisher guidance; edition not established from the extract.

| rule_id | Expected result | Source; authority |
| --- | --- | --- |
| page | A4; left 25 mm, right 20 mm; header region ends at 45 mm | K; publisher_guidance |
| field | Address field x20 / y45 mm, width 85 / height 45 mm; text starts at x25 mm | W; publisher_guidance |
| zones | Supplemental height17.7 mm; recipient height27.3 mm; boundary y62.7 mm; contiguous recipient lines | K; publisher_guidance |
| return | One-line return address, 8 pt, within supplemental zone | K; publisher_guidance |
| spacing | Two blank lines after subject; one after greeting, between body paragraphs and before closing; enclosures after signer | K; publisher_guidance |
| typography | Arial 11, single spacing, bottom 20 mm, blue sender only, no photo; three line-heights of signature space | This profile, version 1; project_choice |
| placement | Sender begins at 10 mm; date line top 95 mm; subject 105 mm when content fits | This profile, version 1; project_choice |

For every row retain `rule_id`, resolved `source_url`, `edition`, `authority`, expected geometry/structure, measured result, status and evidence reference. Use `passed`, `failed` or `not_assessed`. Missing observations never pass. Report "passed the sourced project checklist" only when all applicable rows pass. Do not claim full DIN conformity, certification or a legal requirement. Do not copy or redistribute publisher PDFs/templates.

## Author and measure in WordCraft

Discover the selected desktop's command schemas first. Raise WordCraft through the existing visibility protocol and identify the active document/language when switching. Resolve unsaved edits before opening or creating. Persist each pending intent, establish binding and inspect fresh state before mutations. Never replace an existing application merely to apply this recipe.

Use ordinary body paragraphs in this order: sender/contact lines, return line, recipient lines, date, subject, greeting, contribution paragraphs, closing, typed signer, enclosures. This gives one observable reading order. The header is a visual region, not necessarily a separate Word header story. Do not use the previously rejected default textbox approach: its inset/wrapping and omitted body extraction require separate proof.

Convert millimetres to points with `mm * 72 / 25.4`. Discover and use `layout.size`, `layout.margins`, `format.font`, `format.size`, `para.spacing`, `para.lineSpacing` and selection commands through `execute`. For this body-only recipe the document top margin is 10 mm; reserve the rest of the 45 mm header region by measured paragraph spacing. The 45 mm boundary is not a 45 mm top margin. Set all paragraphs to single spacing and zero before/after initially.

Select the complete text range before changing inline size, bold or color. A collapsed caret may change only future typing, even when the command returns success. Inspect the resulting run properties. Set the return line to 8 pt and the subject bold. Keep the sender accent restrained. Long addresses must fit the field; do not silently abbreviate confirmed postal content or overflow its right boundary.

Measure each region using `document.layout` caret line-top and height after an observed `select.range`. Record the selected story/path. These are line boxes, not glyph baselines. Set paragraph space-before from the observed difference to the intended next region, then measure again. Start the return line within y45 to y62.7 mm; contain recipient lines within y62.7 to y90 mm. The 62.7 mm value is a zone boundary, not a prescribed text baseline. Confirm x25 mm and rightmost address extent at or before x105 mm. Use end-of-paragraph caret observations plus rendered inspection to catch wrapping; do not infer width from character counts.

Place date and subject below the address region. Use measured line height to implement the required blank-line equivalents with paragraph spacing. Measure gaps from the previous paragraph's last line bottom, including wrapped paragraphs. If content already exceeds a target or spans pages unexpectedly, retain the draft and adjust the layout through the session protocol. Do not shrink body text to hide overflow. For longer letters, inspect every page and explicitly review continuation layout before claiming the checklist passed.

## Verify the saved revision

Perform save/reopen through MCP to a confirmed unique private DOCX destination. Compare exact body text with the reviewed composition, inspect each paragraph/run and section, and verify reading order. Inspect every rendered page for clipped addresses, overlap, broken characters, clear hierarchy, spacing and page balance. Render page indexes are one-based; record the actual scale (pixels per point). A command request is not a measurement.

Bind observations, checklist results and visual review to the saved file hash, snapshot hash and render hashes. Confirm the artifact bytes and live state remain unchanged after inspection. An edit invalidates affected checks. Attach check evidence to the manifest using the existing contracts; do not invent a second score or promise ATS compatibility. A failed mandatory rule keeps that letter a draft with its location available. Missing geometry or unavailable rendering stays `not_assessed` with the exact missing capability. Return the editable path and honest per-check result.
