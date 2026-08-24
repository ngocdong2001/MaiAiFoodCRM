"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export type SelectFieldOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  ariaLabel?: string;
  size?: "sm" | "default";
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
};

const SelectField = ({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  size = "default",
  className,
  contentClassName,
  disabled,
}: SelectFieldProps) => {
  const selected = options.find((option) => option.value === value);

  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange((next as string) ?? "")}
      disabled={disabled}
    >
      <SelectTrigger
        size={size}
        aria-label={ariaLabel}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder}>{selected?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectField;
