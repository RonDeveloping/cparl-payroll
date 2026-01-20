"use client";
//@/components/SectionDisclosure

import { ChevronRight, Ellipsis } from "lucide-react";

interface SectionDisclosureProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
}

export default function SectionDisclosure({
  label,
  expanded,
  onToggle: toggleDisclosure,
}: SectionDisclosureProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // Prevents focus from jumping to the disclosure
      onClick={toggleDisclosure}
      aria-expanded={expanded}
      className="cursor-pointer mt-6 flex items-center gap-2 text-sm font-medium
                 text-slate-700 hover:text-slate-900"
    >
      <ChevronRight
        className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${expanded ? "rotate-90" : "rotate-0"}`}
      />
      <span className="inline-flex min-w-[6ch]">
        {expanded ? label : <Ellipsis className="w-5 h-5 text-slate-500" />}
      </span>
    </button>
  );
}
