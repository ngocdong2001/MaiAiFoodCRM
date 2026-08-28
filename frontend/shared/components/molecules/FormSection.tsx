"use client";

import type { ElementType, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type FormSectionProps = {
  /** Section heading shown as a legend/label. */
  title?: string;
  /** Optional secondary hint text under the title. */
  description?: ReactNode;
  /** Optional trailing action (e.g. "Copy to all days" buttons). */
  actions?: ReactNode;
  /** Mark the section title with an accent dot icon. */
  icon?: ReactNode;
  /**
   * Render as a bordered card (default) or as a plain, borderless group.
   */
  variant?: "bordered" | "plain";
  /** Optional extra wrapper classes. */
  className?: string;
  /** Content to group together. */
  children: ReactNode;
  /** Override the wrapper element (e.g. "fieldset" vs "section"). */
  as?: ElementType;
};

/**
 * Standardized way to group related form fields into a single, labelled
 * section (mirrors the "Weekly Schedule / Per-Date Override / Specialties"
 * grouping used in the staff dialog). Use this everywhere so every dialog
 * groups its information the same way.
 */
const FormSection = ({
  title,
  description,
  actions,
  icon,
  variant = "bordered",
  className,
  children,
  as,
}: FormSectionProps) => {
  const Component: ElementType =
    as ?? (variant === "bordered" ? "fieldset" : "section");

  return (
    <Component
      className={cn(
        variant === "bordered" && "rounded-lg border border-[#DEE1E7] p-4",
        className,
      )}
    >
      {title || description || actions || icon ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title ? (
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                {icon}
                {title}
              </div>
            ) : null}
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </Component>
  );
};

export default FormSection;
