import json
import os

with open('lint_report.json', 'r') as f:
    report = json.load(f)

summary = {}
for file_report in report:
    file_path = file_report['filePath']
    messages = file_report['messages']
    if not messages:
        continue
    
    file_summary = {}
    for msg in messages:
        rule = msg.get('ruleId', 'none')
        file_summary[rule] = file_summary.get(rule, 0) + 1
    
    # Store only relative path for readability
    rel_path = os.path.relpath(file_path, os.getcwd())
    summary[rel_path] = file_summary

# Sort by total error count
sorted_summary = sorted(summary.items(), key=lambda x: sum(x[1].values()), reverse=True)

for path, rules in sorted_summary[:20]:
    total = sum(rules.values())
    print(f"{path}: {total} total errors")
    for rule, count in rules.items():
        print(f"  - {rule}: {count}")

