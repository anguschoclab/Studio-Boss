const fs = require('fs');
const file = 'src/components/modals/CreateProjectModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<ProjectFormat>('film');
  const [genre, setGenre] = useState<string>(GENRES[0]);
  const [budgetTier, setBudgetTier] = useState<BudgetTierKey>('mid');
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCES[0]);
  const [flavor, setFlavor] = useState('');

  // Auto-generate title when modal opens if title is empty
  useEffect(() => {
    if (showCreateProject && !title) {
      setTitle(generateProjectTitle(genre));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateProject, genre]);`;

// Doing a regex replace to catch the whole block
const newContent = content.replace(
/  const \[title, setTitle\] = useState\(''\);\s+\/\/ Auto-generate title when modal opens if title is empty\s+useEffect\(\(\) => {\s+if \(showCreateProject && !title\) {\s+setTitle\(generateProjectTitle\(genre\)\);\s+}\s+\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\s+}, \[showCreateProject, genre\]\);\s+const \[format, setFormat\] = useState<ProjectFormat>\('film'\);\s+const \[genre, setGenre\] = useState<string>\(GENRES\[0\]\);\s+const \[budgetTier, setBudgetTier\] = useState<BudgetTierKey>\('mid'\);\s+const \[targetAudience, setTargetAudience\] = useState<string>\(TARGET_AUDIENCES\[0\]\);\s+const \[flavor, setFlavor\] = useState\(''\);/g,
  replacement
);

fs.writeFileSync(file, newContent);
