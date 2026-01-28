// components/form/FormSection.tsx
"use client";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b">
        {title}
      </h2>
      {children}
    </section>
  );
}
