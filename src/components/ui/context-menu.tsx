import * as React from "react";

export interface ContextMenuProps {
  children?: React.ReactNode;
}

export const ContextMenu = ({ children }: ContextMenuProps) => <div>{children}</div>;
export const ContextMenuTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
export const ContextMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`min-w-[8rem] rounded-md border border-[#c9a574]/20 bg-[#1a2a2a] p-1 ${className}`} {...props} />
);
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`cursor-pointer rounded px-2 py-1.5 hover:bg-[#c9a574]/20 ${className}`} {...props} />
);
ContextMenuItem.displayName = "ContextMenuItem";

export const ContextMenuCheckboxItem = ContextMenuItem;
export const ContextMenuRadioItem = ContextMenuItem;
export const ContextMenuLabel = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`px-2 py-1.5 font-semibold ${className}`} {...props} />;
export const ContextMenuSeparator = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`my-1 h-px bg-[#c9a574]/20 ${className}`} {...props} />;
export const ContextMenuShortcut = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={`ml-auto text-xs ${className}`} {...props} />;
export const ContextMenuGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const ContextMenuPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const ContextMenuSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const ContextMenuSubContent = ContextMenuContent;
export const ContextMenuSubTrigger = ContextMenuItem;
export const ContextMenuRadioGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
