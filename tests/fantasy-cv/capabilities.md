# Complete sample and capability scenarios

The copyable facts.json contains every field in the current 1.0 schema and examples in every collection: identity/contact/address/links, source records, summary, employment/claims, education, development, skills, projects with employer links, volunteering, languages with CEFR and review questions. Null remains an example of an unknown value, not permission to invent it. All details are fictional. Replace values and source references with your own; do not treat sample qualifications as defaults.

Application settings belong in offer.json, not candidate facts. Copy the profile into an ignored private directory for actual use. Do not commit real replacements under tests. The future 2.0 contract adds richer conflict/history state; this sample remains a supported legacy migration fixture until that schema is implemented.

| Capability | Scenario and expected behavior | Evidence status |
| --- | --- | --- |
| Full profile | Validate schema, IDs, source references and nonempty collections | Automated fixture check |
| Candidate selection | Swap invented name/contact/metric and regenerate; old values disappear | Automated compositor test |
| Employer positioning | Select leadership/first-contact evidence for the supplied offer | Demonstrated in fictional CV; full reasoning skill pending |
| Contextual skills | Explain capabilities in work statements and readable skill bullets | Demonstrated |
| Education privacy | Keep dates in facts; omit award dates in document; preserve relevant expiry | Compositor implemented |
| Missing qualifications | Ask certification and deployment questions; neither appears as a credential | Automated baseline check |
| Scores | Required 5/6 and preferred 0/1 evidence coverage, not a hiring score | Automated baseline check |
| Answer refinement | Confirm availability, skip certification; required becomes 6/6, preferred remains unknown | Interactive skill pending |
| Conflict | Supply a different mission count; retain both sources and ask before replacing | 2.0 profile implementation pending |
| Profile vs document | Approve wording only; canonical JSON stays unchanged | Full update workflow pending |
| WordCraft DOCX | Create, save, reopen and compare extracted paragraph order | Executed MCP test |
| Layout | Blue, no photo, visual inspection and dynamic page totals | Executed baseline and two-page probe |
| German output | Translate meaning and headings, preserve genuine titles and qualifications, use Seite X / Y | Complete German application demo pending |
| Cover letter | Supply fictional sender/recipient, date and offer; Germany follows verified DIN 5008 layout in either language | Letter implementation and DIN verification pending |
| Review agent | Critique evidence and employer appeal; no model API in scripts | Specification proposal available |
| Live editing | Preserve an unrelated manual edit while changing a sourced achievement | Blocked on verified live-session behavior |
| Distribution | Fresh install with a second user, private-data exclusions and no sibling-checkout dependency | Release milestone pending |

This is a complete capability test catalog, not a claim that all planned features are implemented. Use the same fixture through the final skill entrypoint for release acceptance. The local compositor demonstrates data-driven rendering only.
