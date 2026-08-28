"use client";

import type { ReactNode } from "react";

import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

type FormFieldProps = {
  /** Visible label text. Omit to render a label-less control slot. */
  label?: string;
  /** Appends a "*" to the label to signal a required field. */
  required?: boolean;
  /** Optional hint shown below the label. */
  description?: ReactNode;
  /** Optional validation/helper message shown below the control. */
  error?: ReactNode;
  /**
   * The control itself. Must be a single element, otherwise pass it wrapped
   * in a fragment/div. When `true`, the wrapper uses the full width of its container.
   */
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  htmlFor?: string;
};

/**
 * Standardized form field: label + control + description/error, used across
 * every feature's dialogs so field layout is consistent app-wide.
 */
const FormField = ({
  label,
  required,
  description,
  error,
  children,
  className,
  contentClassName,
  htmlFor,
}: FormFieldProps) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    {label ? (
      <Label htmlFor={htmlFor} className={cn(error && "text-destructive")}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
    ) : null}
    {description ? (
      <p className="text-xs text-muted-foreground">{description}</p>
    ) : null}
    <div className={cn("min-w-0", contentClassName)}>{children}</div>
    {error ? (
      <p className="text-xs text-destructive" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);

export default FormField;
