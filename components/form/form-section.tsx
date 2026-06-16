"use client";
// components/form/form-section.tsx
import { formSectionStyles } from "@/constants/styles";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  titleClassName?: string;
  titleTag?: "h2" | "p" | "div";
}

export default function FormSection({
  title,
  children,
  headerAction,
  titleClassName,
  titleTag = "h2",
}: FormSectionProps) {
  const TitleTag = titleTag;
  const titleClasses = titleClassName || formSectionStyles.title;

  return (
    <section className={formSectionStyles.section}>
      {headerAction ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <TitleTag className={titleClasses}>{title}</TitleTag>
          {headerAction}
        </div>
      ) : (
        <TitleTag className={titleClasses}>{title}</TitleTag>
      )}
      {children}
    </section>
  );
}
