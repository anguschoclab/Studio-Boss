const { Project } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.app.json",
});

const sourceFiles = project.getSourceFiles();

let changes = 0;

sourceFiles.forEach(sourceFile => {
    let text = sourceFile.getFullText();
    let original = text;

    // Projects
    text = text.replace(/studio\.internal\.projects/g, 'entities.projects');
    // Talents
    text = text.replace(/industry\.talentPool/g, 'entities.talents');
    // Contracts
    text = text.replace(/studio\.internal\.contracts/g, 'entities.contracts');
    // Rivals
    text = text.replace(/industry\.rivals/g, 'entities.rivals');

    if (text !== original) {
        sourceFile.replaceWithText(text);
        sourceFile.saveSync();
        changes++;
    }
});

console.log(`Refactored ${changes} files.`);
