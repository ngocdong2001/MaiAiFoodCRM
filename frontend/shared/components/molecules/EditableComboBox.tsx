"use client";

import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export type EditableComboBoxOption<TValue extends string = string> = {
  value: TValue;
  label: ReactNode;
  icon?: ReactNode;
};

type EditableComboBoxProps<TValue extends string = string> = {
  value: TValue;
  onValueChange: (value: TValue) => void;
  options: EditableComboBoxOption<TValue>[];
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  "aria-label"?: string;
};

/**
 * Reusable, styled combobox built on top of shadcn's Select. Meant for
 * compact, instant-switch pickers (language, theme, etc.) that need a
 * friendlier trigger/dropdown look than the bare Select primitives.
 */
const EditableComboBox = <TValue extends string = string>({
  value,
  onValueChange,
  options,
  icon,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  ...props
}: EditableComboBoxProps<TValue>) => {
  const handleChange = (next: TValue | null) => {
    if (!next) return;
    onValueChange(next);
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger
        aria-label={props["aria-label"]}
        className={cn(
          "rounded-full border border-border bg-background/80 px-3 shadow-sm backdrop-blur-sm transition-colors hover:bg-accent/70 hover:text-accent-foreground data-open:border-ring data-open:bg-accent/70 data-open:text-accent-foreground",
          className,
          triggerClassName,
        )}
      >
        {icon ? (
          <span className="shrink-0 text-muted-foreground in-data-open:text-accent-foreground">
            {icon}
          </span>
        ) : null}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "min-w-36 overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-1 shadow-lg backdrop-blur-md",
          contentClassName,
        )}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="gap-2 rounded-lg"
          >
            {option.icon ? (
              <span className="shrink-0 text-muted-foreground">
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EditableComboBox;
