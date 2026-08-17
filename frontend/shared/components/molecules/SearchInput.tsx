"use client";

import { Search } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

const SearchInput = ({
  value,
  onValueChange,
  placeholder,
  className,
  inputClassName,
}: SearchInputProps) => {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D95A5]" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 rounded-lg border-[#DEE1E7] bg-white pl-9",
          inputClassName,
        )}
      />
    </div>
  );
};

export default SearchInput;
