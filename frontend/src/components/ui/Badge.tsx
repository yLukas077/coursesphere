import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" | "success" }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variant === "default" && "bg-primary/10 text-primary",
      variant === "outline" && "border border-border text-foreground",
      variant === "success" && "bg-emerald-100 text-emerald-700",
      className
    )}
    {...props}
  />
);
