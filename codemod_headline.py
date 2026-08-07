#!/usr/bin/env python3
"""Safe codemod: rename Headline type → NewsEvent across the codebase.

Protected (NOT changed):
- HeadlineCategory (separate type, no word boundary between Headline and Category)
- headline / headlines (lowercase — field names, variable names)
- Headlines (plural with capital — no word boundary after 'e')

Changed:
- Headline as a type reference → NewsEvent
- import { Headline } → import { NewsEvent }
- export type Headline = NewsEvent → removed

Post-processing: deduplicate imports where both Headline and NewsEvent were imported.
"""
import re
import os
import sys

SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")

def find_ts_files(root):
    """Find all .ts and .tsx files, excluding node_modules."""
    result = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip node_modules
        if "node_modules" in dirpath:
            continue
        for f in filenames:
            if f.endswith(".ts") or f.endswith(".tsx"):
                result.append(os.path.join(dirpath, f))
    return result

def process_file(filepath):
    """Process a single file. Returns (changed, description)."""
    with open(filepath, "r") as f:
        content = f.read()
    
    original = content
    changes = []
    
    # Step 1: Remove the type alias definition line
    # Match: export type Headline = NewsEvent;
    alias_pattern = r'^export type Headline = NewsEvent;\s*\n'
    if re.search(alias_pattern, content, re.MULTILINE):
        content = re.sub(alias_pattern, '', content, flags=re.MULTILINE)
        changes.append("removed type alias definition")
    
    # Step 2: Replace \bHeadline\b with NewsEvent (word boundary, case-sensitive)
    # This won't match HeadlineCategory (no word boundary between 'e' and 'C')
    # This won't match headline (lowercase) or Headlines (no word boundary after 'e')
    new_content, count = re.subn(r'\bHeadline\b', 'NewsEvent', content)
    if count > 0:
        content = new_content
        changes.append(f"replaced {count} occurrences of Headline → NewsEvent")
    
    # Step 3: Deduplicate imports — if a file now has both NewsEvent and NewsEvent in imports
    # e.g., import { NewsEvent, NewsEvent } from "..." → import { NewsEvent } from "..."
    # Also handle: import { NewsEvent, OtherType, NewsEvent } → import { NewsEvent, OtherType }
    def dedup_import(match):
        prefix = match.group(1)  # import { or , 
        names = match.group(2)   # the names inside braces
        suffix = match.group(3)  # } from "..."
        
        # Split by comma, strip, dedup preserving order
        name_list = [n.strip() for n in names.split(',') if n.strip()]
        seen = set()
        deduped = []
        for n in name_list:
            if n not in seen:
                seen.add(n)
                deduped.append(n)
        
        return f"{prefix}{' '.join(deduped)}{suffix}"
    
    # Match import statements with braces: import { A, B } from "..."
    content = re.sub(
        r'(import \{)([^}]+)(\} from "[^"]+";)',
        dedup_import,
        content
    )
    
    if content != original:
        with open(filepath, "w") as f:
            f.write(content)
        return True, "; ".join(changes)
    return False, ""

def main():
    files = find_ts_files(SRC_DIR)
    print(f"Scanning {len(files)} files...")
    
    changed_files = []
    for filepath in files:
        changed, desc = process_file(filepath)
        if changed:
            relpath = os.path.relpath(filepath, SRC_DIR)
            changed_files.append((relpath, desc))
            print(f"  CHANGED: {relpath} — {desc}")
    
    print(f"\nTotal: {len(changed_files)} files changed")
    
    # Verify no remaining standalone Headline references
    print("\nVerifying no remaining \\bHeadline\\b references...")
    remaining = []
    for filepath in files:
        with open(filepath, "r") as f:
            content = f.read()
        matches = re.findall(r'\bHeadline\b', content)
        if matches:
            remaining.append((os.path.relpath(filepath, SRC_DIR), len(matches)))
    
    if remaining:
        print(f"WARNING: {len(remaining)} files still have Headline references:")
        for path, count in remaining:
            print(f"  {path}: {count} matches")
    else:
        print("Clean — no standalone Headline references remain.")

if __name__ == "__main__":
    main()
