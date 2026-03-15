sed -i 's/interface CommandDialogProps extends DialogProps {}/type CommandDialogProps = DialogProps;/g' src/components/ui/command.tsx
sed -i 's/export interface TextareaProps\n  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}/export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;/g' src/components/ui/textarea.tsx
sed -i 's/interface TextareaProps/type TextareaProps/g' src/components/ui/textarea.tsx
