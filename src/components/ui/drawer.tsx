import * as React from "react";

export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Drawer = ({ children }: DrawerProps) => <div>{children}</div>;
export const DrawerTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
export const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border border-[#c9a574]/20 bg-[#1a2a2a] ${className}`} {...props} />
  )
);
DrawerContent.displayName = "DrawerContent";

export const DrawerHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`grid gap-1.5 p-4 text-center sm:text-left ${className}`} {...props} />
);
export const DrawerFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-auto flex flex-col gap-2 p-4 ${className}`} {...props} />
);
export const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h2 ref={ref} className={`text-lg font-semibold text-white ${className}`} {...props} />
  )
);
DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p ref={ref} className={`text-sm text-gray-400 ${className}`} {...props} />
  )
);
DrawerDescription.displayName = "DrawerDescription";

export const DrawerClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => <button ref={ref} className={className} {...props} />
);
DrawerClose.displayName = "DrawerClose";
