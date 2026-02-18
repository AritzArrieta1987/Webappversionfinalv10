import * as React from "react";

export interface DropdownMenuProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`min-w-[8rem] overflow-hidden rounded-md border border-[#c9a574]/20 bg-[#1a2a2a] p-1 text-white shadow-md ${className}`} {...props} />
  )
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[#c9a574]/20 ${className}`} {...props} />
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuCheckboxItem = DropdownMenuItem;
export const DropdownMenuRadioItem = DropdownMenuItem;
export const DropdownMenuLabel = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-2 py-1.5 text-sm font-semibold text-white ${className}`} {...props} />
);
export const DropdownMenuSeparator = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`-mx-1 my-1 h-px bg-[#c9a574]/20 ${className}`} {...props} />
);
export const DropdownMenuShortcut = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`ml-auto text-xs tracking-widest text-gray-400 ${className}`} {...props} />
);
export const DropdownMenuGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const DropdownMenuPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const DropdownMenuSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const DropdownMenuSubContent = DropdownMenuContent;
export const DropdownMenuSubTrigger = DropdownMenuItem;
export const DropdownMenuRadioGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
