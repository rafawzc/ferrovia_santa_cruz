# Select context and handoffs

## Load by decision

Read required instructions once in the current context, then navigate by task and anchors. Use symbol navigation where available, scoped search otherwise. Open complete local units when a fragment omits a contract, caller or failure condition. Avoid blanket dumps and many tiny reads that repeatedly miss necessary context.

For skills, keep a discriminating description and an entrypoint carrying the decision procedure. Route to references with when-to-read conditions. Automatic imports or “read all references first” preserve loading cost. Place changes through the owning documentation/authoring workflow; do not move files during assessment.

Communicate result, material evidence, uncertainty and next required action. Put extensive deliverables in artifacts and link them. For exhaustive reviews, bound prose per finding rather than dropping findings. Use structured output when a consumer needs it; JSON is not inherently shorter. Preserve precise language instead of cryptic abbreviations; do not request private reasoning transcripts.

## Communication by phase

During planning, explain enough to decide: proposed outcome, scope, meaningful alternatives/tradeoffs, acceptance criteria and unresolved decisions. During execution, report outcomes, material changes, blockers and the next necessary action; omit command-by-command narration and repeated plans. Preserve any required progress cadence.

In both phases, lead with the essential point, use direct language and make the next action easy to identify. Expand when the human asks or when a decision requires detail. Do not withhold material risks, uncertainties, failures or required approvals while waiting for a question. There is no universal word cap: a concise update and a requested research artifact have different completeness requirements.

## Delegate useful independent work

Before changing delegation, worker inputs or returned results, read [subagents](subagents.md). It owns delegation accounting, brief construction and worker execution.

## Code and comments

Prefer clear names, cohesive functions and readable control flow. This project bans code comments entirely (only tool pragmas such as `eslint-disable`, `@ts-expect-error`, `# noqa`, `# type: ignore`); non-obvious reasons go in the folder `CLAUDE.md` or `docs/`. Optimize readability and task completion, not minimum source length; cryptic identifiers and minification can increase later investigation. This guidance applies when code changes are already authorized, not as permission to rewrite code or delete comments during an efficiency assessment.

## Preserve state

Record goal, accepted constraints/authority, decisions and reasons, artifact versions, checks/results, unresolved failures and next action. Preserve exact paths, IDs, numbers, negations and sources when they affect the task. Verify artifacts remain accessible after resumption.

Where the host supports context editing, compare removal of obsolete observations while retaining actions/state against summarization. Summaries cost tokens and can omit exceptions; masking can remove needed information. Retain recoverable originals and expand as needed. Preserve tool call/result pairing and the host protocol.

Start fresh for unrelated work when appropriate; resume ongoing work with its state rather than discarding it. A skill cannot prune an existing host context or control caching without host support.
