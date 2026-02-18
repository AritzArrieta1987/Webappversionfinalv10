import * as React from "react";

export interface TooltipProviderProps {
  children?: React.ReactNode;
}

export const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>;
};

export interface TooltipProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip = ({ children }: TooltipProps) => {
  return <>{children}</>;
};

export const TooltipTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-sm text-gray-700 shadow-md ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";
