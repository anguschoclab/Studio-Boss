import re

with open('src/components/news/NewsFeed.tsx', 'r') as f:
    content = f.read()

# Add razzies styling to categoryStyles
content = re.sub(
    r"  rumor: 'border-purple-500/30 bg-purple-500/10 text-purple-500',\n\};",
    "  rumor: 'border-purple-500/30 bg-purple-500/10 text-purple-500',\n  razzies: 'border-pink-500/30 bg-pink-500/10 text-pink-500',\n};",
    content
)

with open('src/components/news/NewsFeed.tsx', 'w') as f:
    f.write(content)
