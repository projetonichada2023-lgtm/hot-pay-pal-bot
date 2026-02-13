import { Zap } from "lucide-react";

interface SectionTagProps {
  children: React.ReactNode;
}

export function SectionTag({ children }: SectionTagProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-display font-medium text-primary tracking-wider uppercase mb-4">
      <Zap className="w-3 h-3" />
      {children}
    </div>
  );
}
