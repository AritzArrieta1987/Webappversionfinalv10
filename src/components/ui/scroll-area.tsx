import * as React from "react";

export const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`relative overflow-auto ${className}`} {...props} />
);
ScrollArea.displayName = "ScrollArea";

export const ScrollBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`flex ${className}`} {...props} />
);
ScrollBar.displayName = "ScrollBar";
