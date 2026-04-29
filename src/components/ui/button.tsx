import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  children: ReactNode;
};

export function Button({ className, variant = "primary", size = "md", children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-orange-600",
    secondary: "bg-black text-white hover:bg-zinc-800",
    ghost: "bg-transparent hover:bg-accent text-foreground",
    outline: "border bg-white hover:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:bg-red-700",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
  };
  return (
    <button
      className={cn("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-center font-semibold leading-none transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
