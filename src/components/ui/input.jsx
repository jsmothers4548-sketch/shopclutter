import * as React from "react"

import { cn } from "@/lib/utils"
import { applySentenceCase, applyWordCase } from "@/lib/autoCase"

const NON_TEXT_TYPES = ["email", "tel", "number", "password", "url"];

const Input = React.forwardRef(({ className, type, onChange, autoCapitalize, ...props }, ref) => {
  const handleChange = (e) => {
    if (onChange && !NON_TEXT_TYPES.includes(type)) {
      const mode =
        autoCapitalize === "words"
          ? "words"
          : autoCapitalize === "none"
            ? "none"
            : "sentences";
      if (mode !== "none") {
        const transformed =
          mode === "words"
            ? applyWordCase(e.target.value)
            : applySentenceCase(e.target.value);
        if (transformed !== e.target.value) e.target.value = transformed;
      }
    }
    onChange?.(e);
  };
  return (
    (<input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      onChange={handleChange}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }