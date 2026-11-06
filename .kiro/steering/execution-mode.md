# Execution mode: foreground by default

## Rule

Produce results in the **foreground** unless the user explicitly instructs otherwise.

- Run implementation, review, verification, tests, builds, and document work **synchronously in the main session** and return the outcome directly in the conversation.
- Use **background execution only when the user explicitly asks** (for example, "run this in the background" or "launch it async"). Never default to background mode on your own initiative.
- This applies to subagent dispatch as well: agents run **foreground (to completion)** by default; pass `background=true` only when the user instructed it.
- Long-running foreground commands still get a timeout; if a command genuinely must run detached (for example, a dev server the user asked to keep running), state that explicitly and say why.

## Why

Foreground execution keeps results directly observable, avoids orphaned background work, and matches the sequential task review and commit gates used by this project. Silent background work breaks those gates.

## Examples

- "Implement task 8.1" → implement in the foreground, then report the result.
- "Run the full acceptance suite" → run it in the foreground (with an adequate timeout) and report pass/fail.
- "Kick off the review in the background while I look at something" → only then may a reviewer subagent run with `background=true`.

## Scope

Applies to all spec, implementation, review, verification, test, and document-authoring work in this repository. Does not override privacy, commit-gating, or review requirements; it only controls *where* the work runs.
