# Recruiting in 2026: skills-first in theory, signal-first in practice

The design should help recruiters recognize relevant capability with less interpretation. A CV needs to make responsibility, scope, results and career context legible while preserving the candidate's factual meaning. Maximizing a keyword count is an inadequate objective.

This is an English adaptation of supplied research, checked against identifiable primary sources on 26 October 2026. Personal examples have been replaced with hypothetical ones. The original citation handles could not serve as references; links below identify the sources actually consulted. Findings, interpretations and proposed experiments are distinguished throughout. This document informs design and does not amend approved specifications or candidate facts.

## Skills and credentials still coexist in selection

SHRM's *The Skills-First Movement* reports that 34% of organizations often or almost always use skills-first hiring. Relevant experience and demonstrated competencies ranked ahead of educational background. Skilled credentials were considered at least sometimes by 78% of HR professionals, compared with 72% in 2021. The survey was conducted in 2025; SHRM's publication citation specifies 2026. These are reported practices and preferences, not observed outcomes from a controlled hiring experiment. [SHRM research](https://www.shrm.org/in/topics-tools/research/skills-first-movement-redefining-how-organizations-hire-grow), [SHRM credential summary](https://www.shrm.org/mena/topics-tools/news/skill-first-hiring-is-redefining-the-hiring-landscape).

LinkedIn's March 2025 analysis estimates that selecting on skills could expand eligible talent pools by 6.1 times globally, 6.3 times in Germany and 15.9 times in the United States. Its skills-based pool includes people with at least half the target occupation's top skills; the comparison pool consists of people who previously held that occupation. These are modeled pool sizes, not hiring increases or proof that every member meets a vacancy's requirements. [LinkedIn Economic Graph report](https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/skills-based-hiring-march-2025.pdf).

The gap between policy and practice matters. The Burning Glass Institute and Harvard Business School's February 2024 report finds that sustained hiring changes often lag announcements about removing degree requirements. Removing a condition from a posting does not establish that an employer changed its screening process. [Skills-Based Hiring: The Long Road from Pronouncements to Practice](https://www.burningglassinstitute.org/research/skills-based-hiring-the-long-road-from-pronouncements-to-practice).

Gallup and Lumina provide a more recent view of stated preferences. Their 19 October 2026 publication reports an opt-in online survey of 2,500 US hiring decision-makers, conducted on 5-18 August. Eighty percent preferred degree holders even when a role did not require a degree. The figure was 91% in the information sector, 87% in financial activities and 85% in professional and business services. Forty-eight percent expected AI to make degrees more important over the following five years; 26% expected less importance. These are preferences and expectations, not evidence that degrees cause better performance. [Gallup and Lumina employer survey](https://news.gallup.com/poll/715601/employers-confidence-higher-education-undaunted.aspx).

The project interpretation is that substantive fit and credibility signals can operate together. Relevant qualifications should be easy to identify, while work episodes should explain capability. Neither a prestigious credential nor an impressive title proves that a candidate exercised a particular method, authority or skill.

## Design for human review as well as automation

Bitkom's September 2026 release reports a representative telephone survey of 602 German companies with at least three employees, conducted in calendar weeks 18-25. Twelve percent used AI somewhere in recruitment; 6% used it for initial application review, with 27% considering that use. Five percent used AI for competence or potential analysis. Company-level adoption is not the share of all applications processed by AI: larger employers may account for more applications. ATS use also does not necessarily imply AI ranking. [Bitkom survey and methodology](https://www.bitkom.org/Presse/Presseinformation/Fuehrt-kuenftig-KI-Bewerbungsgespraech).

Stepstone's public recruiting guide reports that 33% of applications are removed at first screening and 73% of recruiters review manually. Its listed rejection reasons include missing relevant skills (60%), insufficient experience (42%), inadequate language skills (36%), spelling errors (33%) and unexplained gaps (26%). These differ from the supplied draft's figures and categories. They describe reported screening behavior, not justified rules for this skill to reproduce. [Stepstone recruiting guide, 14 May 2025](https://www.stepstone.de/e-recruiting/hr-wissen/recruiting/bewerberqualitaet-steigern/).

Stepstone's related Application Quality study surveyed 704 recruiters and 3,495 candidates in March and April 2025. Its release reports concerns about exaggerated qualifications and less individualized AI-assisted applications. The stated representativeness applies to the candidate sample by age, gender and education; it should not automatically be attributed to the recruiter sample. [Stepstone study release](https://www.thestepstonegroup.com/english/newsroom/press-releases/study-two-out-of-three-applications-created-with-the-help-of-ai-recruiters-are-missing-individuality/).

A useful design model is the sequence below. It is a model of possible information loss, not a claim that every employer uses each stage:

```text
Document parsing -> stored fields -> filters -> recruiter scan -> interpretation
```

Test each relevant stage separately. Correct text extraction cannot establish correct interpretation, and a visually attractive document cannot establish reliable extraction.

### Keep market and language separate

The sources do not provide a matched US-German comparison that establishes universal national CV rules. They support a more limited set of design decisions:

| Dimension | Design implication | Limit |
| --- | --- | --- |
| Skills and qualifications | Make both relevant evidence and credentials recognizable | Survey rankings are not a universal scoring rubric |
| Automation | Check extraction and reading order alongside human readability | AI prevalence varies by sample, employer and task |
| Titles | Preserve the actual title; explain function where needed | Functional wording must not inflate rank |
| Responsibility | Explain scope, influence and decision authority | Company scale is not personal ownership |
| Language and tone | Adapt terminology and phrasing to the offer and market | English does not imply a US application |
| Length | Allocate space to relevant evidence at readable density | These sources do not establish a fixed two- or three-page rule |

## Make capability observable

The World Economic Forum's 2025 report identifies analytical thinking as a core skill for roughly seven in ten surveyed employers. Resilience, flexibility and agility, and leadership and social influence follow. AI and big data, networks and cybersecurity, and technological literacy lead expected skill growth. These broad workforce priorities are useful context; they do not establish a particular vacancy's criteria. [WEF skills outlook](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/).

An isolated list such as "leadership, analytical thinking, strategy" gives little basis for assessing what someone did. The proposed approach, called *evidence-based signaling* here, connects capability to an observable episode. This label is a project synthesis, not an official framework from the cited institutions.

For senior applications, investigate seven kinds of information:

| Signal | What a reader should be able to establish |
| --- | --- |
| Qualification | What was earned, in which field, and with what relevant status |
| Responsibility | What the person was accountable for |
| Scope | Which teams, operations, locations or constraints were involved |
| Decision authority | What the person defined, approved, challenged or advised on |
| Outcome | What changed, with an attributable result where supported |
| Context | Why the work mattered in that operating environment |
| Temporal relevance | When the capability was used and what is claimed now |

These categories guide questions and drafting. They are not mandatory fields in every sentence, and their presence does not prove competence. An exhaustive bullet containing all seven may be harder to read than two focused statements.

### Preserve time as part of meaning

Consider a wholly hypothetical candidate who last developed production software in 2011 and later moved into operations leadership. It would be false to convert elapsed time since that work into continuous programming experience or current expert proficiency.

An illustrative reasoning record could distinguish:

```yaml
technical_foundation:
  domain: software development
  last_professional_use: "2011"
  current_relevance: "technical foundation for operations decisions"
  current_hands_on_level: "not claimed"
```

This is explanatory pseudodata, not a proposed extension to the profile schema. Actual dates and current-use claims must come from the selected facts file. Where current practice matters to the offer, ask about it. Otherwise, historical experience can remain in its career context.

### Show the work behind a capability

A hypothetical operations example is more informative than a row of labels:

> Service operations: defined escalation criteria for regional support teams and advised operations managers on exceptions during peak demand.

If confirmed evidence includes a result, it can support a second statement:

> Reduced unresolved handovers from [verified baseline] to [verified result] over [verified period].

Placeholders are drafting prompts and must not reach submitted documents. An unquantified but well-supported responsibility is preferable to an invented result. The aim is to make role, action, scope and outcome easier to recover; compatibility with particular screeners still requires testing.

## Semantic screening can still distort evidence

Iso and colleagues' NAACL 2025 industry-track paper examines job-resume matching in an English-language, US context. It reports that some newer models reduced explicit gender and race biases, while implicit educational-background biases remained. The conclusion supports continued evaluation of tested models, not an assumption that semantic matching is neutral. [Evaluating Bias in LLMs for Job-Resume Matching](https://aclanthology.org/2025.naacl-industry.55/).

Wilson and Caliskan's AIES 2024 study simulated resume retrieval using embedding models across nine occupations. White-associated names were favored in 85.1% of the tested cases. That percentage describes comparisons in the study, not the proportion of all production ATS systems exhibiting the behavior. The work also found effects involving document length and name frequency. [Gender, Race, and Intersectional Bias in Resume Screening via Language Model Retrieval](https://ojs.aaai.org/index.php/AIES/article/view/31748).

Castleman and colleagues' February 2026 preprint constructs comparable resumes with a known ordering of qualifications. Many tested models did not consistently select the more qualified candidate and did not reliably abstain between equally qualified candidates. Its controlled setting addresses validity more directly than agreement with historical decisions alone, but does not establish validity for every real hiring situation. [Measuring Validity in LLM-based Resume Screening](https://arxiv.org/abs/2602.18550).

For this project, keep demographic attributes out of fit scoring and do not recommend manipulating identity to exploit a model's preferences. Review whether a transformation preserves supported authority, dates, qualifications and outcomes. A higher model score cannot excuse a changed meaning.

## Tailoring evidence is promising, but causality remains open

Huntr's 2025 annual report combines several platform datasets. Its methodology describes 1.78 million job entries, 243,973 resumes and separate posting and outcome cohorts; these should not all be called submitted applications. Sixty percent of resumes with location data were from the US. It reports progression to interview, offer or hire of 5.8% for tailored applications versus 3.73% for untailored applications, about 1.6 times. It also describes more focused content among successful resumes and differences in achievement detail and length by seniority. [Huntr annual report](https://api.huntr.co/research/2025-annual-job-search-trends-report).

This is vendor telemetry with user-recorded outcomes, not randomized evidence that tailoring causes the difference. Candidate effort, job selection, experience and reporting behavior may differ between groups. The findings justify testing focused evidence selection; they do not justify a guaranteed improvement, a fixed page count or a required number of achievements.

## Translate the evidence into testable design choices

The proposed objective is to preserve job-relevant evidence while minimizing semantic distortion, subject to readable prose and recoverable document content. This is a conceptual objective, not a validated mathematical score.

```text
Offer requirement
  -> identify the underlying capability
  -> locate supported candidate evidence
  -> assess relevance and recency
  -> explain responsibility, scope and supported outcomes
  -> use recognizable, accurate terminology
  -> check meaning and document extraction
```

The proposed phrase *CV signal preservation and evidence structuring* describes this approach. It does not rename the project or imply an implemented feature.

For senior roles, test the following starting priorities. They are hypotheses, not empirical weights, and an explicit vacancy requirement can change them.

| Starting priority | Evidence to consider |
| --- | --- |
| Very high | Current functional identity, responsibility, scope, supported outcomes and relevant experience |
| High | Leadership or influence, domain context and relevant formal qualifications |
| Medium | Current methods and technologies relevant to the target role |
| Low | Historical hands-on tools that no longer support the target contribution |
| Very low | Generic personal qualities without supporting examples |

Assess the approach with fictional profiles and known evidence. Compare semantically equivalent versions while holding facts and offer constant. Check which requirements a reviewer can recover, which claims they misinterpret and what information a parser loses. Evaluate readability separately from evidence coverage. Include meaningful missing qualifications and equally supported alternatives so a reviewer must be able to express uncertainty.

The approach fails if it raises matching scores by overstating responsibility, obscuring uncertainty or making the application less intelligible. It also needs revision if contextual wording loses relevant evidence that a simpler presentation preserves. No hypothesis here authorizes adding a capability to a real profile.

## Verification notes for the supplied draft

| Supplied claim | Treatment in this adaptation |
| --- | --- |
| SHRM described as a 2025 publication | Distinguished 2025 fieldwork from the source's 2026 publication citation |
| Gallup study dated 19 October 2026 | Located the publication and its opt-in survey methodology |
| Bitkom described as a summer survey | Recorded the source's calendar weeks 18-25 and September publication |
| Stepstone rejection figures of 70%, 58%, 33%, 26%, 23% | Not reproduced as established findings; the identified public guide has different values and categories |
| LinkedIn German AI/non-AI comparison of about 15 and 6.2 times | Left out of the substantive argument; aggregate country comparisons suffice and the subgroup chart needs separate verification |
| Huntr described as 1.7 million applications | Distinguished job entries, resumes and outcome cohorts |
| National page-count and tone prescriptions | Reframed as choices requiring market-specific evidence or user preference |
| Candidate-specific degrees and historical programming dates | Removed; this document cannot establish or update a person's qualifications |
| Numeric signal priorities and universal screener compatibility | Retained only as proposed priorities and test objectives |

For the separate foundations in job analysis, occupational assessment and terminology, consult the [HR source register](../.kiro/specs/targeted-cv-skill/research.md). Those sources and the present studies do not validate a universal ATS score, keyword quota or DIN certification claim.
