# Measure accepted work

## Accounting

Choose a fixed cohort of tasks and define success independently of the optimization. Record task/run ID, variant, commit or input hash, runtime/model versions, reasoning settings, cache condition, usage source, total tokens, money, duration, acceptance result, human corrections and evidence location.

Normalize provider usage into disjoint buckets before aggregating. Input totals may already include cache reads/writes; output totals may already include reasoning. Never add a subset twice. Keep unavailable fields unknown, not zero. Deduplicate streamed events by request ID; distinguish per-request values from cumulative snapshots. Include failures, retries, compactors, subagents, reviewers and integration. Separate one-time research/setup cost from recurring execution cost; show both for payback.

<!-- cli-specific: API accounting fields differ; other hosts must use their documented usage schema, not copy these formulas blindly. -->
For OpenAI Responses, cached input is included in `input_tokens`, and reasoning in `output_tokens`; add the two totals, not their detail fields. For Anthropic Messages, input is `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`; add `output_tokens` separately. Confirm the actual API/version schema before applying either mapping.

For a fixed cohort:

```text
tokens per accepted task = all execution tokens / accepted task count
cost per accepted task   = all execution cost / accepted task count
reduction per accepted task =
  1 - (candidate execution tokens / candidate accepted task count)
      / (baseline execution tokens / baseline accepted task count)
```

The reduction is undefined if either accepted count or baseline execution tokens are zero. Label aggregate token reduction separately; use reduction per accepted task for an accepted-task efficiency target. If none succeeds, the quality gate fails. A cheaper model or cached input may reduce money without reducing tokens. Characters, bytes, lines and local tokenizer counts measure size, not billing. A subscription allowance cannot be reconstructed from token counts without documented host metering.

Do not add tool-result size on top of request usage: it is already represented in later model input. Attribute its size separately to locate waste. Projecting repeated context cost requires the actual later calls retaining it; do not assume every byte is always resent or recomputed.

## Comparison

1. Freeze inputs, baseline settings and acceptance checks before tuning. Include routine, difficult, failed and interrupted work from the actual workflow. Keep some cases held out.
2. Change one intervention class at a time. For a user-approved model comparison, freeze the same
   task, base, acceptance, tools, effort and permissions while varying only the model. Otherwise
   keep model, effort, permissions and tools fixed; if permissions cannot be frozen, record them
   as an uncontrolled confounder. Isolate candidate work and count unsuccessful attempts,
   recovery and integration. Counterbalance run order; report warm/cold cache separately where
   controllable, and mark uncontrolled conditions.
3. Repeat enough paired cases to expose model/infrastructure variance. Agree sample size and quality margin before results; a small pilot discovers failures but does not establish non-inferiority. Report sample size, task mix and uncertainty, not just the best run.
4. Check the original outcome: errors found, citation completeness, exact identifiers, authorization and required checks. Prefer executable acceptance tests plus independent artifact review; self-grading a shortened answer is insufficient.
5. Report aggregate totals, success rates, tokens per accepted task and per-task changes. Use actual
   available cumulative usage without double-counting cache or reasoning detail; unavailable cost,
   quota and serving data stay unknown. Separate study overhead from ordinary execution. Inspect tail
   regressions and human correction time. Failure costs stay in the numerator. Do not select only
   successful tasks or average unlike workloads without stating the weighting, and do not infer
   savings from output length or an incomplete task.

A target such as halving tokens passes only on the agreed workload and quality gate. No observed regression in a finite sample is limited evidence, not a guarantee.

## Resume

Save baseline identity, candidate diff, case IDs/results, unknowns and next action in a small record. Keep raw artifacts behind paths with appropriate access and retention. Resume from the record instead of retelling history.
