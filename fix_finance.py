import re

with open('src/engine/systems/finance.ts', 'r') as f:
    content = f.read()

# Modify calculateWeeklyRevenue to use applyIronicViewingMultiplier
multiplier_func = """
function applyIronicViewingMultiplier(baseRevenue: number): number {
  // Cult classics flatten out and earn a steady ironic viewing revenue stream, preventing it from dropping off to 0
  return Math.max(baseRevenue * 1.5, 100000); // Guarantees at least $100k weekly or 1.5x of whatever the base is
}
"""
content = content.replace("export function calculateWeeklyRevenue", multiplier_func + "\nexport function calculateWeeklyRevenue")

# add isCultClassic handling
content = re.sub(
    r"      const backendCut = revenue \* \(\(totalBackendPercent \* backendMultiplier\) \/ 100\);\n      sum \+= \(\(revenue - backendCut\) \* eventMult\);",
    "      const backendCut = revenue * ((totalBackendPercent * backendMultiplier) / 100);\n      let netRevenue = (revenue - backendCut);\n      if (p.isCultClassic) {\n         netRevenue = applyIronicViewingMultiplier(netRevenue);\n      }\n      sum += (netRevenue * eventMult);",
    content
)

with open('src/engine/systems/finance.ts', 'w') as f:
    f.write(content)
