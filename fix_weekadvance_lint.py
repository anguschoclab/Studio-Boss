import re

with open('src/engine/core/weekAdvance.ts', 'r') as f:
    content = f.read()

# Fix: let prestigeChange = ceremonyResult.prestigeChange; -> We need to update state.studio.prestige later.
# Let's check how prestigeChange is used.
content = content.replace("const prestigeChange = ceremonyResult.prestigeChange;", "let prestigeChange = ceremonyResult.prestigeChange;")
content = content.replace("prestigeChange -= razzies.studioPrestigePenalty;", "prestigeChange -= razzies.studioPrestigePenalty; // Decrease studio prestige")

with open('src/engine/core/weekAdvance.ts', 'w') as f:
    f.write(content)
