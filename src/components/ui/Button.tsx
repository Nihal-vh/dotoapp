import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "amber" | "emerald" | "white";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-lg";

    const variantStyles = {
      default: "bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 font-semibold shadow-xs",
      white: "bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 font-semibold shadow-xs",
      secondary: "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800",
      outline: "border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-900 hover:text-white",
      ghost: "text-zinc-300 hover:bg-zinc-900 hover:text-white",
      destructive: "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-700",
      amber: "bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 font-semibold shadow-xs",
      emerald: "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold shadow-xs",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
