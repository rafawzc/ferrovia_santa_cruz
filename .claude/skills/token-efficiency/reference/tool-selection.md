# Choose an efficiency mechanism

Use existing capabilities first. Check current official docs, installed version and actual host support. Research-only requests do not authorize installation.

| Mechanism | Use when | Acceptance condition |
|---|---|---|
| CLI filters, structured reporters, `rg`, `jq` | Excessive returned data | Preserve status, diagnostics, coverage and raw access |
| Native usage; optional ccusage | Need session/model totals | Validate schema, deduplication and provider accounting; label estimated prices |
| Optional RTK proxy | Supported commands repeatedly emit verbose output | Compare original/filtered fixtures, including failures and unsupported commands |
| Optional context-mode MCP | Large results need local storage/retrieval | Verify adapter, retrieval completeness, permissions, persistence and raw bypass |
| Optional LLMLingua | Prose remains large after deterministic selection | Count compressor cost and verify protected facts and downstream quality |
| Tool discovery/programmatic execution | Schemas/intermediate data dominate | Load relevant schemas; process outside model context; return decision evidence |
| Prompt caching | Reused prefixes dominate money/latency | Observe usage/billing; preserve stable prefixes |
| Native compaction | Conversation approaches host limits | Preserve host output/protocol; verify continuation; count compaction |

Before embedding tools, inspect pinned release, license, data flow and adapters. A skill may bundle a tested helper and route to optional dependencies; describing them does not install binaries, rewrite global hooks or add MCP servers. Prefer opt-in adapters with raw fallbacks over unconditional command rewriting. Measure whether tooling earns its context and maintenance cost.

Treat vendor compression percentages as hypotheses for the complete task. Local processing may still send returned snippets to an external model. Persistent indexes may retain sensitive output; follow caller access/retention policy.

For programmatic tool execution, keep intermediate data in the execution environment and return selected evidence; printing every intermediate result defeats the mechanism. Prefer an existing host capability or tested domain helper over a new execution runtime. Bounded output does not prove complete collection or bounded I/O. Preserve coverage, classified failures and recoverable detail. For repeated observations, use scoped checkpoints and acknowledge only the snapshot actually handled; unchanged content can still contain unresolved failures. A head SHA alone cannot identify changing reviews or checks.

<!-- cli-specific: API/host controls differ; fallback is portable source selection and measurement without setting changes. -->
For OpenAI API workloads, inspect documented input/cache and output/reasoning fields. Verbosity, reasoning effort, tool search and compaction depend on model/API version. Lower visible verbosity need not reduce reasoning; hard caps can truncate work. Verify current cache write/read semantics rather than hardcoding old prices.

For Claude Code, use available context/usage diagnostics; check whether MCP definitions are already deferred before adding discovery. Hooks and commands are host adapters. For Cursor, inspect whether rules load always, by path, by description or explicit invocation. Do not transplant keys between hosts.

Model routing is a separate experiment. Preserve explicit choices; compare accepted-task cost before adopting smaller models/lower effort. API batching and caching may lower price without halving tokens, and may alter latency. State which objective improves.
