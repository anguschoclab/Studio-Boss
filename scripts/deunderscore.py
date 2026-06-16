#!/usr/bin/env python3
"""One-shot: strip underscores from DISPLAY-only ALL_CAPS tokens in .tsx files.

Safety model: a token is KEPT (untouched) if it is used functionally ANYWHERE
in the codebase — declared as an identifier, used as an object key, compared in
=== / case, accessed as a property, called, indexed, or imported. Only tokens
that are *never* code (pure display strings like COMMAND_CENTER) get their
underscores turned into spaces. When in doubt, keep.
"""
import re, sys, glob, os

ROOT = os.path.join(os.path.dirname(__file__), "..", "src")
files = glob.glob(os.path.join(ROOT, "**", "*.tsx"), recursive=True)

# ALL_CAPS with >=1 underscore AND >=1 letter (the letter lookahead excludes
# numeric separators like 1_000_000, which are number literals, not labels).
TOKEN = r"(?=[A-Z0-9_]*[A-Z])[A-Z0-9]+(?:_[A-Z0-9]+)+"

# --- Pass 1: build the KEEP set (functional tokens) across ALL files ---
keep = set()
keep_patterns = [
    re.compile(r"\b(?:const|let|var|function|class|enum|interface|type)\s+(" + TOKEN + r")"),
    re.compile(r"(?:^|[\s{,(])(" + TOKEN + r")\s*:"),                      # object key  FOO_BAR:
    re.compile(r"(?:===|!==|==|!=|case)\s*['\"`](" + TOKEN + r")['\"`]"),  # comparison RHS
    re.compile(r"['\"`](" + TOKEN + r")['\"`]\s*(?:===|!==|==|!=)"),       # comparison LHS
    re.compile(r"\btype\s*:\s*['\"`](" + TOKEN + r")['\"`]"),             # type: 'FOO_BAR'
    re.compile(r"\.(" + TOKEN + r")\b"),                                   # prop access .FOO_BAR
    re.compile(r"\b(" + TOKEN + r")\s*[\(\[]"),                            # call/index FOO_BAR( or [
    re.compile(r"<(" + TOKEN + r")[\s/>]"),                                # component <FOO_BAR
]
import_re = re.compile(r"import\s*(?:type\s*)?\{([^}]*)\}")

contents = {}
for f in files:
    with open(f, encoding="utf-8") as fh:
        c = fh.read()
    contents[f] = c
    for pat in keep_patterns:
        for m in pat.finditer(c):
            keep.add(m.group(1))
    for m in import_re.finditer(c):
        for part in m.group(1).split(","):
            t = part.strip().split(" as ")[0].strip()
            if re.fullmatch(TOKEN, t):
                keep.add(t)

tok_re = re.compile(r"\b(" + TOKEN + r")\b")
transformed_tokens = set()

def repl(m):
    t = m.group(1)
    if t in keep:
        return t
    transformed_tokens.add(t)
    return t.replace("_", " ")

changed = 0
for f, c in contents.items():
    new = tok_re.sub(repl, c)
    if new != c:
        with open(f, "w", encoding="utf-8") as fh:
            fh.write(new)
        changed += 1

print(f"Files changed: {changed}")
print(f"Distinct tokens de-underscored: {len(transformed_tokens)}")
print(f"Distinct tokens KEPT (functional): {len(keep)}")
print("\n--- KEPT (sample, these stay as code) ---")
for t in sorted(keep)[:60]:
    print("  keep:", t)
