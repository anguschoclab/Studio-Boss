#!/usr/bin/env python3
"""Fix corrupted imports from commit 81ff164b.

The commit removed spaces after `{` and before `}` in imports,
but also accidentally removed commas between import names:
  import {vi beforeEach} from "vitest"  →  import {vi, beforeEach} from "vitest"

This script restores commas in brace imports that have multiple names.
"""
import re
import os

SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")

def find_ts_files(root):
    result = []
    for dirpath, dirnames, filenames in os.walk(root):
        if "node_modules" in dirpath:
            continue
        for f in filenames:
            if f.endswith(".ts") or f.endswith(".tsx"):
                result.append(os.path.join(dirpath, f))
    return result

def fix_imports(content):
    """Fix import statements: {a b c} → {a, b, c}"""
    def fix_brace_content(match):
        prefix = match.group(1)  # import { or , 
        inner = match.group(2)   # content inside braces
        suffix = match.group(3)  # } from "..."
        
        # Skip if inner is empty or a single token
        inner_stripped = inner.strip()
        if not inner_stripped:
            return match.group(0)
        
        # Check if there are already commas — if so, leave alone
        if ',' in inner:
            return match.group(0)
        
        # Split by whitespace and rejoin with commas
        tokens = inner_stripped.split()
        if len(tokens) <= 1:
            return match.group(0)
        
        # Check if tokens look like valid import names (identifiers, possibly with 'as', 'type')
        # Also handle default imports before braces — but those are outside the brace match
        fixed = ', '.join(tokens)
        return f"{prefix}{fixed}{suffix}"
    
    # Match: import {content} from "..."
    # Also match: , {content} from "..." (for mixed default + named imports)
    content = re.sub(
        r'(import \{)([^}]+)(\} from "[^"]+";)',
        fix_brace_content,
        content
    )
    
    # Also handle: import Default, {content} from "..."
    content = re.sub(
        r'(, \{)([^}]+)(\} from "[^"]+";)',
        fix_brace_content,
        content
    )
    
    return content

def main():
    files = find_ts_files(SRC_DIR)
    print(f"Scanning {len(files)} files...")
    
    changed = 0
    for filepath in files:
        with open(filepath, "r") as f:
            original = f.read()
        
        fixed = fix_imports(original)
        
        if fixed != original:
            with open(filepath, "w") as f:
                f.write(fixed)
            changed += 1
            print(f"  FIXED: {os.path.relpath(filepath, SRC_DIR)}")
    
    print(f"\nTotal: {changed} files fixed")

if __name__ == "__main__":
    main()
