# Return evidence for the next decision

Identify the question before a command: existence, filenames, count, values, failure cause or complete artifact. Select the smallest output answering it; broaden when evidence is insufficient.

| Need | Starting pattern |
|---|---|
| File discovery | `rg --files <scope> -g '<glob>'` |
| Files containing a literal | `rg -l -F -- '<literal>' <scope>` |
| Located evidence | `rg -n -F -C 3 -- '<literal>' <scope>` |
| Known range | `sed -n '<start>,<end>p' <file>` |
| Change overview | `git diff --stat`, then relevant full diff |
| API fields | Server-side projection/filter; otherwise `jq` on saved JSON |
| Build/test result | Repository command, saved full log, actual status and reporter summary |

Replace placeholders from the task; check availability. Exclusions depend on the question: generated files or dependencies may be relevant. No search matches differs from command failure; inspect the tool's exit status.

## Failure and recovery

Capture stdout and stderr to a unique artifact before extraction. Preserve the producer status. This illustrative POSIX shell wrapper accepts a noninteractive command; adapt the log location to local policy:

```sh
#!/bin/sh
umask 077
if [ "$#" -eq 0 ]; then
  printf 'usage: capture COMMAND [ARG ...]\n' >&2
  exit 2
fi
task_log_dir=$(mktemp -d "${TMPDIR:-/tmp}/task-output.XXXXXX") || exit 1
if "$@" >"$task_log_dir/output.log" 2>&1; then
  task_rc=0
else
  task_rc=$?
fi
printf 'exit=%s log=%s\n' "$task_rc" "$task_log_dir/output.log"
exit "$task_rc"
```

This stores evidence; it neither judges success nor redacts secrets. Read the runner summary and every distinct failure needed for the decision from the saved log. For long-running work use the host's job/session mechanism and meaningful progress updates. Preserve log access through review/recovery, then follow retention policy.

Do not use a producer piped to `head`/`tail` as the sole record: early pipe closure may interrupt it, and a pipeline may hide its status. `pipefail`, where supported, detects failure but neither preserves the full log nor proves truncation complete. `2>/dev/null`, `|| true`, and success inferred from an empty error search hide necessary distinctions.

## Filtering contract

Return status, scope, counts, diagnostic identifiers/locations, partial-output indicator, and retrieval path/cursor. Prefer structured test reporters. A regex for `ERROR` misses other assertions, warnings, exceptions or signals. Check totals, skipped tests and producer status before calling a suite green.

Bounded views need an omitted count or truncation flag and a way to fetch more. “No finding” requires complete relevant coverage, not the first page. A display token cap does not implement source selection or correctness. Keep full diffs, exact source, unique failures and requested exhaustive results recoverable.
