import * as React from "react";

export interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Popover = ({ children }: PopoverProps) => <div>{children}</div>;
export const PopoverTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`z-50 w-72 rounded-md border border-[#c9a574]/20 bg-[#1a2a2a] p-4 text-white shadow-md ${className}`} {...props} />
  )
);
PopoverContent.displayName = "PopoverContent";

export const PopoverAnchor = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
