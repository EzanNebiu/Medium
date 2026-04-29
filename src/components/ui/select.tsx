import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-11 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20", className)} {...props} />;
}
