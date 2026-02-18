// components/form/FormSection.tsx
"use client";
import { formSectionStyles } from "@/constants/styles";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className={formSectionStyles.section}>
      <h2 className={formSectionStyles.title}>{title}</h2>
      {children}
    </section>
  );
}
