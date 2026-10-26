# Resolve the desktop bridge prerequisite

> Superseded on 26 October 2026. The user chose the existing WordCraft MCP flow. Custom bridge work is dropped; a source checkout was obtained but no patch was applied or built. This document is historical, not an active prerequisite.


## Decision requested

Authorize an isolated compatibility investigation and source patch for WordCraft's MCP bridge. Keep the installed application and host configuration unchanged. This expands the work from the portable skill into an external dependency; it does not approve the session design or implementation tasks.

The intended user flow stays the same: open WordCraft, author the CV and requested letter visibly, and refine the selected document while preserving manual edits.

## Evidence

On 26 October 2026, the installed CLI identified itself as `wordcraft-cli 0.10.0`. The reproducible probe in `tests/wordcraft-document-session/bridge-replay-probe.cjs` connected that binary to a synthetic loopback endpoint. The endpoint recorded the first create request and closed the connection without returning a reply. It then accepted the bridge's next connection.

| Observation | Result |
| --- | --- |
| MCP requests issued by the probe | One `new_document` call |
| Requests delivered to the endpoint | Two identical `engine.execute` requests for `file.new` |
| Request IDs | Identical |
| Error reported to the caller | None |
| Real desktop or candidate content involved | None |

This proves replay by the installed bridge under the simulated lost-reply condition. It does not prove duplicate documents in the live desktop, nor does it establish desktop concurrency behavior.

Official source inspection found the same unresolved lost-reply behavior in [release 0.11.0](https://github.com/storytold/wordcraft/blob/e31f2f06a5f8004ceaa88f68c00b47908e321aa4/crates/mcp/src/backend.rs) and [current main](https://github.com/storytold/wordcraft/blob/6a2b520fa49aa0d0595cea36589aaf16ca371cd3/crates/mcp/src/backend.rs). Main excludes malformed reply data from replay, but still retries EOF and other I/O failures. An ordinary update is therefore not a demonstrated remedy.

## Proposed scope

1. Use an isolated, pinned official source checkout outside the distributable skill. Record its provenance and license; do not bundle WordCraft into this repository's skill archive.
2. Make a narrow change to the bridge's transport behavior: once transmission is attempted, an I/O failure returns an uncertain outcome without resending the operation. Establishing a connection before transmission can be retried separately. Do not infer retry safety from catalog mutation hints.
3. Test successful calls, failure before send, partial send, lost reply, reconnect and an unresolved outcome. Show that one client request reaches the synthetic endpoint at most once after a possibly completed send. Keep ambiguity visible to the caller.
4. Exercise the changed bridge against a separate desktop session with fictional content. Establish actual document selection, visible authoring, read-back, save and reopen. Inspect the effect after a lost reply; never infer that a timeout means no edit occurred.
5. Test manual edits separately. Upstream open-document IDs improve targeting but do not prove atomic edit preconditions. Demonstrate the exclusive-edit interaction and conflict handling, or return this remaining prerequisite for a decision.
6. Finalize the session design only when the selected dependency and interaction have sufficient evidence. Generate implementation tasks after design approval.

No changes to the installed executable, persistent MCP configuration, or the user's existing desktop sessions are included. Publishing an upstream issue or patch also requires a separate explicit instruction; a local draft may be prepared.

## Alternatives

| Option | Consequence |
| --- | --- |
| Isolated bridge fix | Preserves the requested MCP workflow; introduces a dependency-maintenance decision and requires build and live validation |
| Wait for an upstream correction | Keeps the skill independent of a local fork; foreground session delivery remains pending |
| Relax uncertain-write requirements | Accepts possible duplicate effects; requires an explicit requirements change and is not recommended |

A headless document followed by opening the file does not satisfy the requested live workflow. A wrapper outside the existing CLI cannot prevent a replay that occurs inside it.

## Reproduce the installed behavior

Set `WORDCRAFT_CLI` to the installed executable in the test process, then run:

```text
node tests/wordcraft-document-session/bridge-replay-probe.cjs
```

The probe supplies a synthetic authentication string only to its own child and loopback endpoint. It does not read the application's key file. A passing assertion confirms the documented replay behavior, not product acceptance. If a later version behaves differently, inspect the result before changing the expectation.

## Design gate

The requirements remain approved. No final `design.md`, design approval, task approval or live acceptance is claimed. The applicable Kiro design workflow requires external dependency verification before freezing dependent designs and says: "The design must be implementable as a sequence of bounded tasks without hidden prerequisites."

This proposal makes the external prerequisite and its scope explicit. It does not treat the proposed patch as delivered or tested.
