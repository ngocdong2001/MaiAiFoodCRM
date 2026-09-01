"use client";

import type { FormEvent, ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heading text. */
  title: string;
  /** Optional subtitle under the heading. */
  description?: ReactNode;
  /** Optional error message rendered as a banner above the form. */
  error?: ReactNode;
  /** Footer action labels. Omit `submitLabel` to hide the submit button. */
  submitLabel?: string;
  cancelLabel?: string;
  /** Whether the submit action is in-flight. */
  submitting?: boolean;
  /** Disable submit without showing a spinner (e.g. field validation). */
  submitDisabled?: boolean;
  /** Submit handler. When provided, the body is wrapped in a `<form>`. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Extra actions placed on the left of the footer (before Cancel). */
  footerActions?: ReactNode;
  /** Dialog width/size class overrides. */
  contentClassName?: string;
  /** Stretch body into a scrollable area with a pinned footer (recommended). */
  scrollable?: boolean;
  children: ReactNode;
};

/**
 * Shared modal shell for create/edit/read forms across the whole app:
 * consistent header, error banner, body, and Cancel/Submit footer.
 */
const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  error,
  submitLabel,
  cancelLabel = "Cancel",
  submitting = false,
  submitDisabled = false,
  onSubmit,
  footerActions,
  contentClassName,
  scrollable = true,
  children,
}: FormDialogProps) => {
  const body = (
    <form
      onSubmit={onSubmit}
      className={cn(
        "space-y-5",
        scrollable && "min-h-0 overflow-y-auto px-5 py-4",
      )}
    >
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <span className="text-sm">{error}</span>
        </div>
      ) : null}
      {children}
    </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          scrollable && "max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden p-0",
          contentClassName,
        )}
      >
        <DialogHeader
          className={cn("px-5 pt-5 pb-0", !scrollable && "px-0 pt-0")}
        >
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {onSubmit ? (
          body
        ) : (
          <div
            className={cn(
              scrollable && "min-h-0 overflow-y-auto px-5 py-4",
            )}
          >
            {children}
          </div>
        )}

        {(submitLabel !== undefined || cancelLabel || footerActions) && (
          <DialogFooter
            className={cn(scrollable && "mx-0 mb-0 rounded-b-xl px-5 py-4")}
          >
            {footerActions}
            <div className="flex items-center gap-2">
              {cancelLabel ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {cancelLabel}
                </Button>
              ) : null}
              {submitLabel !== undefined ? (
                <Button
                  type={onSubmit ? "submit" : "button"}
                  disabled={submitting || submitDisabled}
                >
                  {submitting ? "Saving..." : submitLabel}
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
