import * as React from "react";

export interface HoverCardProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const HoverCard = ({ children }: HoverCardProps) => <div>{children}</div>;
export const HoverCardTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
export const HoverCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`z-50 w-64 rounded-md border border-[#c9a574]/20 bg-[#1a2a2a] p-4 text-white shadow-md ${className}`} {...props} />
  )
);
HoverCardContent.displayName = "HoverCardContent";
