import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-zinc-500 focus-visible:ring-zinc-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-zinc-400 font-mono">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
