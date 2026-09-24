import {FormField} from "../../forms/FormField";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Dices} from "lucide-react";

interface ProjectTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
}

export const ProjectTitleField = ({ value, onChange, onGenerate }: ProjectTitleFieldProps) => (
  <FormField label="Title" htmlFor="project-title" required>
    <div className="flex gap-2 group relative">
      <Input
        id="project-title"
        aria-label="Project Title"
        required
        maxLength={100}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Untitled Project"
        className="bg-black/40 border-white/5 font-display font-black italic tracking-tight text-foreground/90 h-14 rounded-none focus-visible:ring-primary focus-visible:border-primary/40 transition-all duration-700 text-lg uppercase"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="w-14 h-14 shrink-0 border-white/10 rounded-none hover:bg-white/5 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all duration-700"
        onClick={onGenerate}
        title="Generate Random Title"
        aria-label="Generate Random Title"
      >
        <Dices className="h-6 w-6" strokeWidth={2} />
      </Button>
    </div>
  </FormField>
);
