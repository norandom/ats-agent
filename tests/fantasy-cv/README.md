# Fictional application regression fixture

John Doe and all career details are invented for a Men in Black application. No personal CV data is used. The fixture is test data, never a candidate default or a distributable skill instruction. It uses the existing 1.0 contract until the approved 2.0 design is implemented; it also supplies a future migration case.

Inputs are `facts.json` and `offer.json`. The small test compositor reads both at runtime and creates a WordCraft MCP plan. It demonstrates evidence-backed writing and document generation, not the complete future reasoning skill. The final skill must also run this scenario through its own entrypoint; this deterministic compositor is not that acceptance proof.

The expanded facts file now covers every current schema field and has examples in every collection. See capabilities.md for the complete capability scenario catalog, including explicit pending tests. Eight baseline checks pass; footer field and two-page rendering checks are additional. Award dates remain in data but are omitted from rendered education/certifications by default.

`compile-composition.cjs FACTS EDITORIAL en|de OUTPUT` is a candidate-independent local renderer for a host-authored, sourced bilingual editorial plan. It reads bindings from the selected facts file and rejects stale plans using facts_sha256. It never calls a model API. Narrative rewrites still require host semantic review; reference checks alone cannot establish truth. Run `node tests/fantasy-cv/compile-composition.test.cjs` for synthetic input-isolation, stale-plan, localization and rejection tests.

Run from the repository root with Node, uv/uvx and WordCraft 0.10.0 available:

```powershell
uvx --from check-jsonschema==0.38.2 check-jsonschema --schemafile skills/targeted-cv/schemas/cv-facts-v1.schema.json tests/fantasy-cv/facts.json
node tests/fantasy-cv/build-demo.cjs tests/fantasy-cv/facts.json tests/fantasy-cv/offer.json outputs/john-doe-demo
# Set WORDCRAFT_CLI to the executable location if it is not on PATH.
node tests/fantasy-cv/wordcraft-mcp.cjs outputs/john-doe-demo/mcp-plan.json
node tests/fantasy-cv/test.cjs outputs/john-doe-demo
```

Choose a fresh output folder if the existing DOCX is open or manually edited. The MCP harness starts a separate headless process, confines access to that output folder, stops on errors and does not replay failed writes. Generated artifacts and logs remain under ignored outputs. It does not attach to or test the live GUI bridge.

## Acceptance and refinement cases

- Baseline: one page, blue accents, no photo; exact extracted paragraph order, real text bullets, readable render, claim IDs resolved privately. Inspect the rendered PNG as well as running automated checks.
- Footer: automatic PAGE and NUMPAGES fields, right aligned, labelled Page in English or Seite in German. Verify a two-page extension renders Page 1 / 2 and Page 2 / 2; never hardcode the totals.
- Source isolation: substitute another invented name, contact and metric; output must change accordingly without retaining the first candidate's values.
- Required evidence coverage: 5 of 6 requirements evidenced. Preferred evidence coverage: 0 of 1. This counts fixture mappings, not hiring probability or a proprietary ATS score.
- Ask whether formal incident-command certification exists and whether extended off-world deployment is possible. Neither is inferred from field leadership. Questions and coverage stay outside the employer-facing CV.
- Future interactive skill test: skip certification and confirm deployment availability. Only availability becomes supported, required coverage becomes 6 of 6, certification remains unknown, and canonical profile changes require scoped authorization. This conversational test is pending; it has not been executed by the fixture compositor.
- Future live refinement test: manually edit one unrelated sentence in WordCraft, supply a new sourced achievement and verify the edit survives targeted revision. This remains blocked on the live-session design gate.
- The fantasy setting tests portable evidence handling and writing; it does not substantiate real ATS compatibility or professional selection validity. No external ATS was tested.

The package release tests must exclude this fixture from default candidate selection. Update the schema invocation after the planned schema relocation; retain the fixture as a legacy migration input rather than silently changing its declared version.
