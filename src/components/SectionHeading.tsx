interface SectionHeadingProps {
  label: string;
  right?: React.ReactNode;
}

export function SectionHeading({ label, right }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-6">
      <span className="font-label text-[0.625rem] sm:text-[0.6875rem] text-muted-foreground shrink-0">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      {right ? <span className="shrink-0">{right}</span> : null}
    </div>
  );
}
