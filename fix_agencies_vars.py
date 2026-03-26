import re

with open('src/engine/generators/agencies.ts', 'r') as f:
    content = f.read()

# I accidentally removed AGENT_FIRST_NAMES and AGENT_LAST_NAMES when replacing the whole file earlier.
agents_vars = """
const AGENT_FIRST_NAMES = ['Ari', 'Bryan', 'Maha', 'Jeremy', 'Richard', 'Sue', 'Ali', 'Kevin', 'Aaron', 'Emma', 'David', 'Laura'];
const AGENT_LAST_NAMES = ['Gold', 'Lourd', 'Dakhil', 'Zimmer', 'Lovett', 'Mengers', 'Emanuel', 'Huvane', 'Sorkin', 'Stone', 'Smith', 'Jones'];

export function generateAgents(agencies: Agency[], countPerAgency: number): Agent[] {
"""

content = content.replace("export function generateAgents(agencies: Agency[], countPerAgency: number): Agent[] {", agents_vars)

with open('src/engine/generators/agencies.ts', 'w') as f:
    f.write(content)
