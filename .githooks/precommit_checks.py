#!/usr/bin/env python3
"""YourStrat pre-commit guards (Stories 1.2 + 1.3).

Scans ONLY the added lines of staged `mobile/**/*.ts(x)` files outside
`mobile/theme/` — so it blocks *new* violations without punishing existing code:

  1.2 one-theme (NFR3, AP-1/AP-2):
    - raw hex color literal (#abc / #aabbcc)  -> use a token from theme/colors.ts
    - padding/margin set to a non-zero numeric literal -> use a spacing.* token
  1.3 scope guard (AP-15):
    - AI-commentary copy ("Based on" / "It looks like") -> forbidden voice

Blocks the commit (exit 1), naming each file:line. The theme/ directory is the
allowed source of truth and is exempt. Animation-justification and >=10-item
list checks live in the PR template (.github/pull_request_template.md) — they
can't be detected reliably by regex.

Emergency bypass (owner, rare): `git commit --no-verify`.
"""
from __future__ import annotations

import re
import subprocess
import sys

HEX = re.compile(r"#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b")
SPACING = re.compile(
    r"\b(?:padding|margin)(?:Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?\s*:\s*(\d+)"
)
AI_COPY = re.compile(r"Based on|It looks like")


def _run(args: list[str]) -> str:
    return subprocess.run(args, capture_output=True, text=True).stdout


def staged_targets() -> list[str]:
    names = _run(["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"]).splitlines()
    out = []
    for f in names:
        f = f.strip()
        if not (f.endswith(".ts") or f.endswith(".tsx")):
            continue
        if not f.startswith("mobile/"):
            continue
        if f.startswith("mobile/theme/"):
            continue
        out.append(f)
    return out


def added_lines(path: str):
    """Yield (lineno_in_new_file, text) for each added line in the staged diff."""
    diff = _run(["git", "diff", "--cached", "-U0", "--no-color", "--", path]).splitlines()
    new_lineno = 0
    for line in diff:
        if line.startswith("@@"):
            m = re.search(r"\+(\d+)", line)
            new_lineno = int(m.group(1)) if m else new_lineno
            continue
        if line.startswith("+++"):
            continue
        if line.startswith("+"):
            yield new_lineno, line[1:]
            new_lineno += 1
        elif line.startswith("-"):
            continue  # removed line — does not advance the new-file counter


def main() -> int:
    violations: list[str] = []
    for path in staged_targets():
        for lineno, text in added_lines(path):
            if HEX.search(text):
                violations.append(f"{path}:{lineno}  raw hex color - use a token from theme/colors.ts")
            m = SPACING.search(text)
            if m and m.group(1) != "0":
                violations.append(
                    f"{path}:{lineno}  padding/margin literal {m.group(1)} - use a spacing.* token"
                )
            if AI_COPY.search(text):
                violations.append(
                    f"{path}:{lineno}  AI-commentary copy - forbidden voice (scope guard / AP-15)"
                )

    if violations:
        sys.stderr.write("\nYourStrat pre-commit guard blocked this commit:\n\n")
        for v in violations:
            sys.stderr.write(f"  x {v}\n")
        sys.stderr.write(
            "\nFix the lines above (theme/ is the source of truth for color + spacing).\n"
            "Emergency bypass (rare): git commit --no-verify\n\n"
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
