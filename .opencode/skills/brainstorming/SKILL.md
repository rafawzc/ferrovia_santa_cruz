---
name: brainstorming
description: "You MUST use this before any creative work — designing features, modeling architecture, scoping bugfixes. Creates a living plan file at docs/tasks/{user}-{slug}-{date}.md, grills every decision until zero ambiguity, then locks the spec."
---

# Brainstorming: Living Spec Builder

## Overview

You produce ONE artifact: a living markdown spec at `docs/tasks/{user}-{slug}-{YYYY-MM-DD}.md`. The file grows live as we talk — every locked decision, every codebase finding, every dependency graph — landing in the file the moment it's resolved. Brainstorming ends when **Open Decisions = 0** and the user says "go". No code, no tasks, no execution. Just thinking, structured, until the spec feels solid enough to hand off.

The file is the **floor, not the ceiling**: the skeleton is the minimum guaranteed shape; the user can grow it freely afterward (UX Spec, Implementation Log, Audit Findings, etc.).

```
init file  →  explore codebase  →  grill loop (until Open = 0)  →  synthesize analysis  →  lock
```

## Hard Rules

- NEVER write implementation code, scaffold files, run migrations, or mutate the running system.
- NEVER invoke other skills. The ONLY terminal action is flipping `Status: BRAINSTORMING → LOCKED` in the file.
- NEVER invoke TaskManager. Tasks are an execution-time concern, not planning.
- ALWAYS use `AskUserQuestion` — never drop questions inline in prose.
- ALWAYS write each Locked Decision into the file IMMEDIATELY after the user answers; the file is state, not a final dump.
- ALWAYS pre-recommend an answer in every question's `description` field so the user validates or redirects.
- Drift into execution mode = you lost the whole point.
- **NO QUESTION CAP** — there is no upper bound on rounds, batches, or total questions per session. Keep grilling until `Open Decisions = 0`. If that takes 3 rounds, fine; if it takes 30, fine. Ambiguity is the enemy, not question count. The `1-4` you see below is a per-call batching constraint of the `AskUserQuestion` tool, NOT a session budget.

## Phase 0 — Init

1. Resolve the user handle once per session: `gh api user --jq .login` lowercased; if `gh` isn't configured, fall back to `git config user.name` (kebab-cased) or just `dev`.
2. Ask the user via `AskUserQuestion` for a short slug describing the topic. Kebab-case; a phrase is fine (`admin-login`, `dashboard-trens`, `tabela-horarios-responsiva`).
3. Compute path: `$(git rev-parse --show-toplevel)/docs/tasks/{user}-{slug}-{YYYY-MM-DD}.md`.
4. `mkdir -p` the `docs/tasks/` folder if missing.
5. Write the skeleton below.

### File skeleton

```markdown
# {Slug Title} (Living Plan)

> Status: **BRAINSTORMING** — resolving every decision before any code.
> Owner: {user} · Created: {YYYY-MM-DD}
> This file is the **plan of record** and is meant to be iterated on. The sections below are the FLOOR, not the ceiling — add anything the topic demands (UX Spec, Implementation Log, Audit Findings, …).

---

## 1. Goal (one paragraph)

_Written during Phase 2-3._

---

## 2. Locked Decisions

| #  | Decision | Detail |
|----|----------|--------|

---

## 3. Open Decisions

- [ ] _none yet_

---

## 4. Codebase Findings

_Facts pulled from the code — logical modules/paths, existing patterns, prior art. No opinions._

---

## 5. Structured Analysis

### 5.1 Problem Model
### 5.2 System Impact
### 5.3 Strategies
### 5.4 Risks
### 5.5 Validation
### 5.6 Out of Scope
### 5.7 Recommended Plan
### 5.8 Next Action
```

## Phase 1 — Explore (silent, no questions yet)

Before the first question, read what the codebase already answers:

- The root `.claude/CLAUDE.md` and any folder-level `CLAUDE.md` in the impacted area (`backend/`, `frontend/`)
- `git log --oneline -50` on touched paths; any notes nearby
- Existing patterns, primitives, utilities you can reuse — name them
- Domain vocabulary — use the project's words (ferrovia, trens, estações, horários, admin, cliente), never invent parallel terms

Write findings directly into `## 4. Codebase Findings`. **Never ask the user what the code can answer.**

## Phase 2 — Grill Loop

Loop until `## 3. Open Decisions` is empty. **The loop is unbounded** — you do NOT cap rounds, batches, or total questions. The goal is to open the user's mind to angles they haven't seen yet, surface hidden assumptions, and resolve every ambiguity. If round 17 still surfaces a new open decision, run round 18. Stop only when there is literally nothing left to resolve.

1. Identify the next ambiguity. If 2-4 are independent → batch in one `AskUserQuestion` call (the tool itself caps at 4 questions per call — this is a tool constraint, not a session budget). If answers cascade → ask one at a time and walk the tree.
2. Every question's `description` carries your pre-recommended answer.
3. When the user answers, **immediately** edit the file:
   - Append the decision to `## 2. Locked Decisions` as a new row `L<n>`.
   - If the answer spawned new ambiguities, add them as bullets in `## 3. Open Decisions`.
   - If the answer resolved an open decision, remove that bullet and add the result to Locked.
4. If a decision **changes behavior** (data flow, routing, state machine, API contract, UI flow, schema shape) — STOP and propose a mermaid diagram in the relevant analysis section. The two patterns that bind hardest:
   - **antes / depois** — side-by-side or stacked, showing exactly what flipped.
   - **interaction sketch** — sequence/flowchart of the new end-to-end path.

   Diagrams are **thinking tools, not decoration**. Use them precisely where they form the mental model the reader needs — never as filler. In chat, draw simple ASCII for speed; in the file, **always mermaid**, simple and meticulous.

5. Repeat until Open = 0.

## Phase 3 — Synthesize Analysis

Once Open Decisions is empty, fill `## 5. Structured Analysis`:

- **5.1 Problem Model** — what's actually asked (user's perspective), inferred constraints, hidden assumptions surfaced.
- **5.2 System Impact** — logical modules / layers touched (frontend, backend, db schema), existing code to reuse, deep modules to extract (simple interface, rich behavior).
- **5.3 Strategies** — 2-3 approaches. For each: pros, cons, dependency graph as mermaid. Lead with your recommendation and explain why it beats the others.
- **5.4 Risks** — what breaks, where, the mitigation, related memories `[[name]]`.
- **5.5 Validation** — how we know it worked (external behavior, not implementation). Point at prior-art tests in the codebase to mirror.
- **5.6 Out of Scope** — what we are NOT doing this round and why. Be explicit about deferred adjacent work.
- **5.7 Recommended Plan** — ordered dependency graph as mermaid. NOT a flat checklist — order and dependencies matter.
- **5.8 Next Action** — single concrete first step.

Use `[[memory-name]]` links liberally to anchor the plan to durable cross-session knowledge — it lets future sessions navigate without rediscovery.

## Phase 4 — Lock

1. Sanity-check `## 3. Open Decisions` is empty. If not, return to Phase 2.
2. Ask once via `AskUserQuestion`: lock now, or keep iterating?
3. On lock:
   - Flip the header: `Status: **BRAINSTORMING**` → `Status: **LOCKED**`; append `· Locked: {YYYY-MM-DD}`.
   - Report to chat in one line: `Locked at <relative path>. Next action: <5.8 line>`.
   - Then surface the **Execution Handoff** hints below — that's the bridge from spec to actual work.

The file is now the source of truth. Future sessions read it directly — they don't re-invoke this skill on the same topic.

## Execution Handoff (after lock)

Brainstorming ends; execution begins. The agent that picks the file up next session — usually you, in a fresh context — should be nudged toward the right tooling. Surface these at lock time.

### 1. Light nudge — use the right execution skill for the work

Mention whichever fits the `5.8 Next Action`; don't push hard, don't pick if multiple fit, let the user steer:

- **`/tdd`** — when the next step ships code (feature, bugfix). RED → GREEN → REFACTOR.
- **`/systematic-debugging`** — when the next step is investigating a bug, test failure, or unexpected behavior.

Tone: light, dynamic, a friendly reminder. NEVER force a choice.

### 2. Strong nudge — externalize the Plan into TaskManager, AFTER lock

Brainstorming deliberately avoids TaskManager (it pollutes thinking). Once `LOCKED`, the executing session **should** convert `5.7 Recommended Plan` into a TaskCreate graph so the agent doesn't lose its place across compactions. The spec file is cross-session memory; TaskManager is intra-session execution state. They complement each other — use both.

### 3. Strong nudge — parallelize the parallel, serialize the rest

The dependency graph in `5.7 Recommended Plan` IS the parallelization plan. Pair it with TaskManager's `blockedBy`:

- Tasks **without** dependencies → normally **parallelizable**. Fire them as concurrent Agent calls or background work in a single message.
- Tasks **with** dependencies (`blockedBy: [...]`) → run sequentially after their blockers complete.

Steps at the same depth in the dependency graph can run together; steps with a `→` arrow into them must wait. Encode this directly when seeding TaskManager — the graph becomes self-driving.

## Key Principles

- **Codebase first** — never ask what the code can answer; explore in Phase 1.
- **Pre-recommend every answer** — the user validates or redirects, doesn't generate from scratch.
- **Batch 1-4 / cascade 1 at a time** — group independent decisions; serialize branchy trees. Per-call constraint only — the session itself has NO cap on total rounds or questions. Grill until zero ambiguity.
- **Multiple choice preferred** — easier than open-ended when options are enumerable.
- **No assumptions** — every decision surfaces as a question until zero ambiguity remains.
- **YAGNI ruthlessly** — strip scope; formalize the cuts into `5.6 Out of Scope`.
- **Dependency graphs over checklists** — Strategies and Plan use mermaid graphs.
- **Diagrams form neural connections** — emphasize hardest at behavior-change moments; antes/depois is gold.
- **File paths and code snippets ARE allowed** in the doc — they ground decisions; vagueness ages worse than a stale path.
- **Memory links** `[[name]]` weave the plan into the broader knowledge graph.
- **Skeleton is the floor** — invite the user to grow new sections (UX Spec, Implementation Log, Architectural Remediation, …) whenever the topic demands.
- **The file is state, not output** — write it incrementally; the user watches it materialize.

## AskUserQuestion quick reference

```
// Batch 1-4 independent decisions, each with pre-recommended answer in description
AskUserQuestion({
  questions: [
    {
      question: "Onde vive a autenticação do admin?",
      header: "Auth",
      multiSelect: false,
      options: [
        { label: "JWT no backend", description: "Recomendado — stateless, casa com a API REST FastAPI." },
        { label: "Sessão/cookie",  description: "Mais simples, mas exige store de sessão no backend." }
      ]
    },
    {
      question: "Quais telas entram nesta rodada?",
      header: "Escopo",
      multiSelect: false,
      options: [
        { label: "Só dashboard admin", description: "Recomendado — menor blast radius, valida o fluxo de dados primeiro." },
        { label: "Admin + cliente",    description: "Mais largo, dobra a superfície de UI responsiva." }
      ]
    }
  ]
})

// Cascading decision — one at a time
AskUserQuestion({
  questions: [{
    question: "A tabela de horários no mobile vira o quê?",
    header: "Mobile",
    multiSelect: false,
    options: [
      { label: "Cards empilhados", description: "Recomendado — <thead> escondido, cada linha vira card com labels inline." },
      { label: "Scroll horizontal", description: "Mantém formato de tabela, mas exige scroll lateral no celular." }
    ]
  }]
})
```

Use `multiSelect: false` for picking one of N. Use `multiSelect: true` only when answers truly compose (rare in brainstorming — most decisions are one-of-N).
