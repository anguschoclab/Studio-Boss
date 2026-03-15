const fs = require('fs');
let content = fs.readFileSync('tailwind.config.ts', 'utf8');

content = "import tailwindcssAnimate from 'tailwindcss-animate';\n" + content.replace(
  /plugins: \[\/\/ @ts-expect-error plugin import\n    require\("tailwindcss-animate"\)\],/g,
  "plugins: [tailwindcssAnimate],"
);

fs.writeFileSync('tailwind.config.ts', content);
