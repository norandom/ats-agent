# Research and Evidence Register

Reviewed 2026-10-25. These are inputs to later requirements/design, not a claim that a complete professional assessment procedure has been implemented. Summaries below separate source statements from proposed project applications. Source currency and scope should be rechecked when rules change.

## Professional Selection Methodology

### HR-01 — OPM: Job Analysis
- URL: https://www.opm.gov/policy-data-oversight/assessment-and-selection/job-analysis/
- Authority/access: US federal HR guidance; public text reviewed.
- Supports: relating job tasks to the competencies required to perform them.
- Proposed application: understand the offer before selecting evidence; link each important requirement to relevant experience.
- Limit: a pasted advertisement is not a full employer job analysis. Inferred business needs must remain interpretations.

### HR-02 — OPM: Designing an Assessment Strategy
- URL: https://www.opm.gov/policy-data-oversight/assessment-and-selection/assessment-strategy/
- Authority/access: US federal HR guidance; public page reviewed.
- Supports: selection methods should be chosen in relation to competencies and the hiring context.
- Proposed application: distinguish documentary evidence from claims requiring interviews or work samples.
- Limit: does not validate a CV scoring algorithm or prescribe CV typography.

### HR-03 — DIN 33430:2016-07
- URL: https://www.dinmedia.de/en/standard/din-33430/254909784
- Authority/access: official publisher catalogue and scope reviewed; full paid standard not consulted. Catalogue labels this edition current at review.
- Supports: quality principles concern planning, procedures, interpretation and the qualifications of people performing assessment. Suitability depends on the context of use; this is not an isolated product-quality standard.
- Proposed application: traceable reasoning, explicit requirements and restrained conclusions.
- Limit: no claim of DIN compliance or certification; no fonts, colour rules or CV-ranking formula inferred from the public scope.

### HR-04 — CIPD: Selection Methods
- URL: https://www.cipd.org/en/knowledge/factsheets/selection-factsheet
- Authority/access: professional HR body; public content retrieved, dated 22 September 2026.
- Supports: structured, job-relevant selection criteria; work samples and consistent assessment; technology use varies.
- Proposed application: foreground concrete examples of relevant work and make them easy to explore in interviews.
- Limit: applicant presentation does not substitute for validated employer assessment.

### HR-05 — SIOP/APA: Principles for the Validation and Use of Personnel Selection Procedures, fifth edition
- URL: https://www.apa.org/ed/accreditation/personnel-selection-procedures.pdf
- Authority/access: primary professional publication located; indexed excerpts on work analysis and validity reviewed, not the complete document.
- Supports: inference and generalization require appropriate evidence; work analysis matters.
- Proposed application: no invented predictive scores or claims that a rewritten CV proves suitability.
- Follow-up: read relevant sections in full before deriving detailed requirements or asserting clause-level support.

## Occupational Terminology

### ONT-01 — European Commission ESCO
- URLs: https://esco.ec.europa.eu/en/classification/skill-main ; https://esco.ec.europa.eu/system/files/2021-07/Handbook.pdf
- Authority/access: official taxonomy page and indexed handbook passage reviewed.
- Supports: concepts have preferred and alternative terms across languages, with descriptions and hierarchy.
- Proposed application: disambiguate job terminology; connect accurate synonyms and acronyms to the same evidenced concept. Record concept identifiers only when actually looked up.
- Limit: an ESCO relationship is not proof the candidate has a skill, or that the employer's ATS uses ESCO. ESCO's hidden indexing terms do not justify hidden CV text.

### ONT-02 — O*NET Content Model
- URL: https://www.onetcenter.org/content.html
- Authority/access: official occupational information resource; public model reviewed.
- Supports: distinctions among tasks, skills, knowledge, experience, credentials and work context.
- Proposed application: structure the terminology map without conflating tool use, competence, seniority and outcomes.
- Limit: US occupational context; no automatic German equivalence or candidate personality inference.

## Document Structure and Parsing

### DOC-01 — Bundesagentur fuer Arbeit: Lebenslauf
- URL: https://www.arbeitsagentur.de/bildung/bewerbung/lebenslauf
- Authority/access: official applicant guidance, with a youth/early-career audience; public text reviewed.
- Supports: concise, reverse-chronological presentation, relevant qualifications, dates and concrete tasks.
- Proposed application: clear chronology and recognizable sections, adapted to career stage.
- Limit: not an ATS technical standard. Do not automatically import all personal-data suggestions or a universal page cap into this project.

### DOC-02 — Greenhouse: Unsuccessful Resume Parse
- URL: https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse
- Authority/access: primary vendor documentation, updated 2 March 2026; public text reviewed.
- Supports: complex layouts, columns, graphics, unclear sections and contact details in headers/text boxes can impede extraction.
- Proposed application: conservative text-first layout and document read-back checks.
- Limit: vendor-specific parsing guidance; not evidence for universal ranking weights, keyword counts or every ATS's behavior. Never alter genuine employer names to satisfy a parser heuristic.

## Secondary and User-Supplied Context

### CTX-01 — Haufe: Recruiting / Eignungsdiagnostik / DIN 33430
- URL: https://www.haufe.de/id/beitrag/recruiting-eignungsdiagnostik-14-din-33430-HI16472308.html
- Access: public excerpt reviewed; remainder paywalled. Author shown: Dr. Rainer Feldbruegge.
- Supports at excerpt level: requirements-based assessment, quality criteria and documentation.
- Use: professional explanatory context; subordinate to the standard and primary methodological sources. No invented access to the full article.

### CTX-02 — Wikipedia: DIN 33430
- URL: https://de.wikipedia.org/wiki/DIN_33430
- Access: public article reviewed following user request.
- Use: orientation and bibliography discovery. Its description of process quality is consistent with the official publisher's scope.
- Limit: tertiary source; do not use it alone for normative requirements or certification claims.

### CTX-03 — Organisationspsychologie fuer die Praxis
- Access: user-supplied summary; exact author, edition and pages not yet established. Summary supplied twice; treated as one input.
- User highlights: documentary quality, career history, biographical questions, interview follow-up and interpretation of work references.
- Proposed application: comparable chronology and interview-defensible evidence.
- Not adopted as rules: guessing termination causes from gaps, assessing personality from leisure activities, or inferring negative references from page length, spacing or missing formulas. Context and source verification would be required; Zeugnis interpretation is outside this project.

### CTX-04 — Dirk Spencer: Resume Psychology
- Access: user-supplied summary; edition/pages and original passages not yet verified.
- Practitioner ideas to evaluate: contextual skill evidence, one main idea per bullet, simple bullets, left alignment, useful hard-skill summaries.
- Unverified claims excluded from requirements: a minimum of 21 keywords, ranking advantages from left-side placement, mandatory repetition, universal semantic-search adoption and automatic corruption from every graphic bullet.
- Proposed application: natural, evidence-backed terminology coverage; no fixed keyword density or quota. Prefer familiar headings over unverified title-stuffed headings.

### CTX-05 — User video and design-bias concern
- URL: https://www.youtube.com/watch?v=gF7wg2Aoybc&t=679s
- Access: retrieval failed; video content and title not verified.
- User's explicit concern: forcing facts downstream can produce documents that do not appeal to employers.
- Project response: employer needs -> positioning -> evidence selection -> persuasive composition -> dual review for appeal and factual support. The private fact base constrains assertions, not narrative structure.
- Do not attribute this interpretation to the video until viewed or supported by a transcript.

## Tooling Evidence
- https://docs.astral.sh/uv/guides/tools/ — official guidance reviewed: uvx aliases uv tool run and executes tools in isolated environments. Use verified tool packages/entry points and pinned versions where appropriate.
- WordCraft: reported running by user; no tools matching WordCraft exposed in current session. No package name, launch command or API has been assumed. Integration is a required design investigation.

## Design Synthesis (project judgment)
Optimize three distinct qualities: relevance to employer needs, credibility of the contribution story, and recoverability of the document's content. No cited source establishes a universal numerical optimum across them.

The candidate fact file is a reusable evidence resource. The application is a selective argument for contribution. A private claim map connects them without leaking its administrative apparatus into the final CV.

Later validation should include synthetic cases for truthful synonyms, unsupported skill requests, uncertain dates, German/English translation, conflicting sources, prompt-like text inside job offers, weak positioning despite accurate facts, and DOCX extraction/layout problems. Human review of employer appeal must accompany factual review; mechanical coverage alone is insufficient.
