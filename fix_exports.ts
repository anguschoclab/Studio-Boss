import { readFileSync, writeFileSync } from 'fs';

const files = [
    'src/components/Theme/GlobalThemeProvider.tsx',
    'src/components/navigation/CommandPalette.tsx',
    'src/hooks/useKeyboardShortcuts.tsx'
];

for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    if (!content.startsWith('/* eslint-disable react-refresh/only-export-components */')) {
        content = '/* eslint-disable react-refresh/only-export-components */\n' + content;
        writeFileSync(file, content);
    }
}
console.log('Fixed export warnings');
