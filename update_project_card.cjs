const fs = require('fs');

const path = 'src/components/pipeline/ProjectCard.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /\{project\.status === 'pitching' && \(/,
  `{project.status === 'needs_greenlight' && (
        <div className="pt-2">
           <Button
             variant="destructive"
             size="sm"
             className="w-full text-xs"
             onClick={(e) => {
               e.stopPropagation();
               selectProject(project.id);
             }}
           >
             Review Greenlight
           </Button>
        </div>
      )}

      {/* Pitch Button */}
      {project.status === 'pitching' && (`
);

fs.writeFileSync(path, code);
