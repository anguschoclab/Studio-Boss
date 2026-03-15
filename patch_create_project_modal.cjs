const fs = require('fs');
const path = 'src/components/modals/CreateProjectModal.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add game state and selectedTalent state
code = code.replace(
  /const \{ createProject \} = useGameStore\(\);/,
  `const { createProject, gameState } = useGameStore();\n  const [selectedTalent, setSelectedTalent] = useState<string[]>([]);`
);

// 2. Add extra budget logic for talent
code = code.replace(
  /let calculatedBudget = tier\.budget;/,
  `let calculatedBudget = tier.budget;
  const talentPool = gameState?.talentPool || [];
  const talentFees = selectedTalent.reduce((sum, id) => {
    const t = talentPool.find(t => t.id === id);
    return sum + (t?.fee || 0);
  }, 0);
  `
);
code = code.replace(
  /calculatedBudget = calculatedWeeklyCost \* calculatedProdWeeks \+ \(tier\.budget \* 0\.2\);/,
  `calculatedBudget = calculatedWeeklyCost * calculatedProdWeeks + (tier.budget * 0.2);`
);

// 3. Update handleCreate
code = code.replace(
  /createProject\(\{ title: title.trim\(\), format, genre, budgetTier, targetAudience, flavor, tvFormat, episodes, releaseModel \}\);/,
  `createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor, tvFormat, episodes, releaseModel, attachedTalentIds: selectedTalent });`
);
code = code.replace(
  /createProject\(\{ title: title.trim\(\), format, genre, budgetTier, targetAudience, flavor \}\);/,
  `createProject({ title: title.trim(), format, genre, budgetTier, targetAudience, flavor, attachedTalentIds: selectedTalent });`
);

// 4. Update state clearing
code = code.replace(
  /setTitle\(''\);\n    setFlavor\(''\);/,
  `setTitle('');\n    setFlavor('');\n    setSelectedTalent([]);`
);

// 5. Add talent selection UI and modify budget text
code = code.replace(
  /Est. Total Budget: \{formatMoney\(calculatedBudget\)\}/,
  `Est. Base Budget: {formatMoney(calculatedBudget)}<br />
              Talent Fees: {formatMoney(talentFees)}<br />
              Est. Total Budget: {formatMoney(calculatedBudget + talentFees)}`
);

const talentUI = `
          {/* Talent Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider">Attach Talent</Label>
            <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2">
              {talentPool.map(t => (
                <div key={t.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={t.id}
                    checked={selectedTalent.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTalent([...selectedTalent, t.id]);
                      else setSelectedTalent(selectedTalent.filter(id => id !== t.id));
                    }}
                  />
                  <Label htmlFor={t.id} className="text-sm cursor-pointer flex-1">
                    {t.name} ({t.type}) - {formatMoney(t.fee)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
`;

code = code.replace(
  /\{\/\* Flavor \*\/\}/,
  `${talentUI}\n\n          {/* Flavor */}`
);

fs.writeFileSync(path, code);
