# Requirements Document

## Introduction

A session on 2026-11-06 was repeatedly asked to produce a document live in WordCraft through the existing MCP bridge. Instead of running the implementation, the agent wrote a new bridge driver, ran inline code fragments, reverse-engineered test drivers, and reported a raw response count ("72 MCP responses") as success while the user observed that the open document stayed empty. The project handover records this failure pattern and a list of steering gaps that allowed it.

This specification defines the corrective steering requirements so that future sessions run the existing implementation instead of writing substitute code, route document requests to the live bridge, verify live results before claiming success, and keep test assets out of user-facing answers. The corrective actions are requirements only: implementation of the steering changes happens after requirements approval, following the project's phased approval workflow.

The handover that motivated this specification is an untracked local file, so this document restates the failure pattern and the gap dispositions and does not depend on the handover remaining present.

## Boundary context

- In scope: a new steering rule file `implementation-first.md`, additions to the live-authoring section of `tech.md`, an index update to the root `AGENTS.md`, and the spec scaffolding itself.
- Gap dispositions from the handover: gap 1 (no "run the implementation, do not write code" rule) is addressed by Requirements 1 and 5; gap 2 (live generation routing for agents) by Requirement 2; gap 3 (no verification duty) by Requirement 3; gap 4 (test code is not the product) by Requirement 4; gap 5 (unfinished live run) is excluded below.
- Adjacent expectations: the privacy boundary and its mandatory repository check continue unchanged; `execution-mode.md` keeps governing only where work runs (foreground versus background); the existing statements in `product.md` (live authoring is the default experience; background generation does not satisfy it), `tech.md` line 47 (headless demo is regression only), and `structure.md` line 16 (test drivers are not the runtime workflow) remain in force and are cross-referenced rather than restated.
- Out of scope: operational remediation of the unfinished live run (diagnosing `outputs/john-doe-live-2026-11-06/live-responses.jsonl` and rerunning the live replay with the user watching). Such work is recorded as excluded and must be scheduled separately by the user. The cause of the empty visible document remains a hypothesis (the handover suggests CRLF line endings from PowerShell piping or step errors; neither is verified in this specification work).
- Out of scope: the design and tasks phases, which are generated after requirements approval; any code changes; deletion or modification of untracked session artifacts (such as `outputs/live-gen.cjs` or `tests/wordcraft-document-session/bridge-replay-probe.cjs`).
- Unknowns carried forward: the root cause of the empty visible document (evidence: response-log diagnosis in the separately scheduled operational work); whether bridge port and fixture details in `tech.md` remain accurate at implementation time; whether `outputs/live-gen.cjs` still exists locally at implementation time.

## Requirements

### Requirement 1: Run the implementation, do not write code

**Objective:** As the development agent, I want an explicit implementation-first steering rule, so that a request to exercise functionality is fulfilled by running the existing documented flow instead of by writing code.

#### Acceptance criteria

1. The Kiro steering shall include a rule file `implementation-first.md` that states that a user request to exercise or produce functionality shall be fulfilled by running the existing documented implementation (the retained live drivers, the WordCraft CLI bridge, and the documented skill flows) rather than by creating substitute code.
2. The rule shall prohibit new scripts, inline code fragments (such as `node -e` or ad-hoc PowerShell pipelines), and reverse-engineering of test drivers in response to such requests, with the single exception that code may be written when the user explicitly requests code; the rule shall not enumerate purposes (such as "debugging" or "tooling") that waive this prohibition.
3. The rule shall require that, when the agent believes a required flow is missing or broken, it says so plainly and asks the user for guidance instead of silently substituting code.
4. The corrective work shall leave `.kiro/steering/execution-mode.md` unchanged; that file continues to govern only where work runs, per its existing scope clause, and this specification shall not amend it.

### Requirement 2: Route document requests to the live bridge

**Objective:** As the development agent, I want an explicit routing imperative in the technology steering's live-authoring section, so that a user request for a document produces a visible live result instead of a background artifact.

#### Acceptance criteria

1. The `tech.md` "Live WordCraft authoring" section shall state that a user request to produce a document shall be routed to the live bridge through the retained live driver, so that creation, edits, and saves happen in the visible desktop session.
2. The section shall state that headless generation shall not be used as a substitute for live authoring unless the user explicitly requests it, cross-referencing the existing headless-demo regression-only statement in that section instead of restating it.

### Requirement 3: Verify live results before reporting success

**Objective:** As the development agent, I want a mandatory post-run verification duty, so that success claims rest on observed document content and saved artifacts rather than response counts.

#### Acceptance criteria

1. The `tech.md` "Live WordCraft authoring" section shall require that, after any live run, the agent confirms the visible document's content through read-back (for example `get_text`) or the driver's receipt before reporting success.
2. It shall require confirmation that the saved artifact exists and contains the expected content before the run is reported as saved.
3. It shall state that response counts alone shall not be reported as success, and that an unverified run shall be reported as partial or failed execution, not as success.
4. It shall require that, when the user's observation contradicts the agent's evidence (for example, the user sees an empty document), the agent reports the contradiction honestly, treats the user's observation as authoritative, and diagnoses the discrepancy from the actual logs; the rule shall introduce no quantitative contradiction threshold.

### Requirement 4: Keep test code out of user-facing answers

**Objective:** As the development agent, I want the regression-versus-product boundary stated in steering, so that test assets are never used as the answer to a functionality request.

#### Acceptance criteria

1. The `implementation-first.md` rule shall state that test suites and drivers are regression assets and shall not be run, read, or reverse-engineered as a means of answering a user-facing document or functionality request.
2. The rule shall scope this prohibition so that it does not restrict the mandatory privacy check (`node tests/privacy/check-repository.cjs`) or test execution during approved implementation-phase work.
3. The rule shall label the fantasy dataset under `tests/fantasy-cv/` as demo content and identify the retained live driver as the feature implementation.

### Requirement 5: Make the corrective steering discoverable

**Objective:** As the development agent, I want the root `AGENTS.md` steering index to reference every governing steering file, so that each session loads the corrective rules.

#### Acceptance criteria

1. The `AGENTS.md` steering-defaults list shall include `implementation-first.md` and `execution-mode.md` alongside `product.md`, `tech.md`, and `structure.md`.
2. The `AGENTS.md` update shall reference these files without restating their rule content.
