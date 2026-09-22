---
name: token-efficiency
description: Reduce token waste in agent tasks and handoffs. Use for efficiency assessments or tasks explicitly assigned this skill; excludes prompt rewriting.
---

# Token Efficiency

Optimize accepted work per token, including failed attempts, helpers and review. Preserve acceptance checks, evidence, authority and user-selected model/effort settings.

## Inputs and mode

Identify the target workflow or assigned task and its intended outcome. If missing, ask one focused question and pause dependent work; if interaction is unavailable, return the missing input. Missing telemetry permits analysis, but savings remain `unmeasured`.

| Context | Mode and reading |
|---|---|
| Asked to assess token waste or workflow efficiency | Assessment procedure; measurement, then only the guide matching observed waste |
| Explicitly asked to use this skill while completing a task | Execution procedure; only guides needed for that task |
| Worker explicitly given this skill | Execution procedure under the parent's scope and output contract |

Ordinary coding and prose shortening do not trigger an efficiency assessment. An assessment authorizes recommendations, not installation or workflow changes.

## Boundaries

| Request | Owner |
|---|---|
| Diagnose or fix a product failure | `systematic-debugging` |

This names an owner, not a required dependency. Hand off an excluded request with its reason. An explicitly assigned task may use this skill alongside its owning workflow.

## Guides: load when needed

| Decision | Read |
|---|---|
| Measure or compare complete-task usage | [Measurement](reference/measurement.md) |
| Select command output without losing failures | [CLI output](reference/cli-output.md) |
| Select file/history context, communicate by phase, or write readable code | [Context and handoffs](reference/context-handoffs.md) |
| Construct delegation inputs, extract results or transfer this skill | [Subagents](reference/subagents.md) |
| Evaluate optional tools, caching or provider controls | [Tool selection](reference/tool-selection.md) |

## Execution procedure

1. Read the assignment, acceptance condition and applicable repository instructions. Resume from saved decisions, evidence and outstanding work. Apply the owning workflow; do not launch an efficiency audit or benchmark unless assigned.
2. Select context and command output for the next decision. Preserve actual status, distinct failures, coverage and recoverable raw evidence. Expand insufficient views. Use the relevant guide above; do not load every reference by default.
3. Complete and verify the authorized task. Do not initiate installations, additional workers or unrelated changes merely to optimize tokens. Missing evidence is a blocker or uncertainty, never an invented result. Stop at the assigned completion condition.
4. Return the execution report below unless the caller supplied a different output format. Planning explains meaningful choices and acceptance criteria; execution leads with the result, verification and unresolved action. Keep all material findings; link large artifacts. Report usage only when exposed, without claiming savings from a short answer.

## Execution report

Use all six labels in the final response, in this order. Replace every placeholder; use `none` only when the field has no applicable content. A field's meaning appearing elsewhere does not replace its labeled entry. Before sending, check that no label or material finding is missing.

```text
status: <completion or blocker>
result: <task outcome and material findings>
evidence: <verification and artifact paths>
coverage/omissions: <scope examined and what is missing>
uncertainty: <what the evidence cannot establish>
next action: <necessary follow-up, or none>
```

## Assessment procedure

1. Establish scope and quality criteria from the request and applicable instructions. Record runtime, model/version and existing reasoning settings. Derive commands from the caller's guide.
2. Analyze existing complete-task usage using the measurement guide. Without telemetry, report usage as `unmeasured` and propose collection; run new tasks or benchmarks only when authorized. Identify the largest observed waste; label unsupported causes as hypotheses. Do not read entire session archives for one workflow.
3. Load the guide matching that waste. Propose one intervention, its mechanism, possible information loss and acceptance checks. Prefer source selection and deterministic processing before model compression.
4. When comparison is authorized, freeze baseline inputs and criteria, then compare representative and held-out cases with an independent outcome check. Include recovery and integration. An assessment-only request ends with the concrete experiment plan.
5. Recommend retaining a candidate only when the measured tradeoff meets the agreed goal. Apply or retain workflow changes only when separately authorized; otherwise leave the workflow unchanged. Restore omitted evidence in an authorized experiment or reject a regressing candidate; never weaken checks or abandon required work to hit a token cap. Stop when the comparison answers the question.

On resumption, read [saved assessment state](reference/measurement.md#resume); reopen raw artifacts only to resolve uncertainty.

## Assessment report

Use one compact row per intervention. Include every material regression; link details.

| Intervention | Baseline → candidate tokens/accepted task | Quality and recovery | Evidence | Decision |
|---|---|---|---|---|

End with measured money/latency effects, unknowns and the next necessary action. Use `unmeasured` for absent data. Output compression alone does not establish task-level savings.
