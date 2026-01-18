"use client";
//@/components/SectionDisclosure
interface SectionDisclosureProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
}

export default function SectionDisclosure({
  label,
  expanded,
  onToggle,
}: SectionDisclosureProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="mt-6 flex items-center gap-2 text-sm font-medium
                 text-slate-700 hover:text-slate-900"
    >
      <span>{label}</span>
      <span className="text-slate-500">{expanded ? "▾" : "▸"}</span>
    </button>
  );
}
