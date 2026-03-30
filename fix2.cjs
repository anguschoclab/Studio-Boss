const fs = require('fs');

let content = fs.readFileSync('src/components/ui/chart.tsx', 'utf8');

const search = `<style>
      {Object.entries(THEMES)
        .map(([theme, prefix]) => {
          const rules = colorConfig
            .map(([key, itemConfig]) => {
              const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;

              if (!color) return null;

              // Sanitize the key to prevent CSS variable injection.
              const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, "");

              // Sanitize the color value to prevent CSS breakout.
              // We permit standard CSS color characters: #, (), %, commas, and decimals.
              // We explicitly block characters that could terminate a declaration or rule: ; { }
              const safeColor = color.replace(/[;{}]/g, "");

              return \`  --color-\${safeKey}: \${safeColor};\`;
            })
            .filter(Boolean)
            .join("\\n");

          return \`\\n\${prefix} [data-chart=\${safeId}] {\\n\${rules}\\n}\\n\`;
        })
        .join("\\n")}
    </style>`;

const replace = `<style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => {
            const rules = colorConfig
              .map(([key, itemConfig]) => {
                const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;

                if (!color) return null;

                // Sanitize the key to prevent CSS variable injection.
                const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, "");

                // Sanitize the color value to prevent CSS breakout.
                // We permit standard CSS color characters: #, (), %, commas, and decimals.
                // We explicitly block characters that could terminate a declaration or rule: ; { }
                const safeColor = color.replace(/[;{}]/g, "");

                return \`  --color-\${safeKey}: \${safeColor};\`;
              })
              .filter(Boolean)
              .join("\\n");

            return \`\\n\${prefix} [data-chart=\${safeId}] {\\n\${rules}\\n}\\n\`;
          })
          .join("\\n")
          // Replace '<' to prevent XSS breakout from <style> tags
          .replace(/</g, "\\\\3C "),
      }}
    />`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('src/components/ui/chart.tsx', content);
    console.log("Reverted successfully!");
} else {
    console.log("Could not find the search string to revert!");
}
