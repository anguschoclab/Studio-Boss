import {FormField} from "../../forms/FormField";
import {Textarea} from "@/components/ui/textarea";

interface FlavorFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const FlavorField = ({ value, onChange }: FlavorFieldProps) => (
  <FormField label="Positioning (optional)" htmlFor="project-flavor">
    <Textarea
      id="project-flavor"
      aria-label="Positioning"
      maxLength={500}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Define the unique selling point of this project..."
      className="min-h-[100px] resize-none bg-black/40 border-white/5 font-body italic text-sm rounded-none focus-visible:ring-primary focus-visible:border-primary/40 transition-all duration-700 leading-relaxed text-foreground/80"
    />
  </FormField>
);
