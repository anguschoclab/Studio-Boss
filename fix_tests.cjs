const fs = require('fs');

function removeUnused(file, variables) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    variables.forEach(v => {
        let regex = new RegExp(`(import\\s+\\{[^\\}]*?)(\\b${v}\\b\\s*,?\\s*)([^\\}]*?\\})`, 'g');
        code = code.replace(regex, (match, p1, p2, p3) => {
            let cleaned = (p1 + p3).replace(/,\\s*\\}/, '}').replace(/\\{\\s*,/, '{');
            return cleaned.includes('{}') ? '' : cleaned;
        });

        regex = new RegExp(`let\\s+${v}\\s*;?\\n?`, 'g');
        code = code.replace(regex, '');
        regex = new RegExp(`const\\s+${v}\\s*=[^;]*;\\n?`, 'g');
        code = code.replace(regex, '');
    });
    fs.writeFileSync(file, code);
}

removeUnused('src/test/selectors.test.ts', ['GameState']);
removeUnused('src/test/persistence/saveLoad.test.ts', ['GameState', 'afterEach']);
removeUnused('src/test/engine/systems/talent/RelationshipSystem.test.ts', ['GameState']);
removeUnused('src/test/engine/systems/awards_razzies.test.ts', ['GameState']);
removeUnused('src/test/engine/systems/awards.test.ts', ['RandomGenerator']);
removeUnused('src/test/components/modals/UnifiedModal.test.tsx', ['container']);

let code = fs.readFileSync('src/test/setup.ts', 'utf8');
code = code.replace(/_stringUrl: string \| URL/g, 'stringUrl: string | URL');
code = code.replace(/_options\?: WorkerOptions/g, 'options?: WorkerOptions');
code = code.replace(/_message: any/g, 'message: any');
code = code.replace(/_transfer: Transferable\[\]/g, 'transfer: Transferable[]');
code = code.replace(/_type: string/g, 'type: string');
code = code.replace(/_listener: EventListenerOrEventListenerObject/g, 'listener: EventListenerOrEventListenerObject');
code = code.replace(/_options\?: boolean \| EventListenerOptions/g, 'options?: boolean | EventListenerOptions');
code = code.replace(/_event: Event/g, 'event: Event');

code = code.replace(/stringUrl: string \| URL/g, '_stringUrl: string | URL');
code = code.replace(/options\?: WorkerOptions/g, '_options?: WorkerOptions');
code = code.replace(/message: any/g, '_message: any');
code = code.replace(/transfer: Transferable\[\]/g, '_transfer: Transferable[]');
code = code.replace(/type: string/g, '_type: string');
code = code.replace(/listener: EventListenerOrEventListenerObject/g, '_listener: EventListenerOrEventListenerObject');
code = code.replace(/options\?: boolean \| EventListenerOptions/g, '_options?: boolean | EventListenerOptions');
code = code.replace(/event: Event/g, '_event: Event');
fs.writeFileSync('src/test/setup.ts', code);

code = fs.readFileSync('src/test/engine/systems/talent/driftEngine.test.ts', 'utf8');
code = code.replace(/const \{ personality, ...rest \} = talent;/, 'const { personality: _personality, ...rest } = talent;');
fs.writeFileSync('src/test/engine/systems/talent/driftEngine.test.ts', code);
