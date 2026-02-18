import * as React from "react";

export const Menubar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`flex h-10 items-center space-x-1 rounded-md border border-[#c9a574]/20 bg-[#1a2a2a] p-1 ${className}`} {...props} />
);
Menubar.displayName = "Menubar";

export const MenubarMenu = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => <button ref={ref} className={`px-3 py-1.5 text-sm ${className}`} {...props} />
);
MenubarTrigger.displayName = "MenubarTrigger";

export const MenubarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`min-w-[12rem] rounded-md border border-[#c9a574]/20 bg-[#1a2a2a] p-1 ${className}`} {...props} />
);
MenubarContent.displayName = "MenubarContent";

export const MenubarItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`cursor-pointer rounded px-2 py-1.5 hover:bg-[#c9a574]/20 ${className}`} {...props} />
);
MenubarItem.displayName = "MenubarItem";

export const MenubarSeparator = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`my-1 h-px bg-[#c9a574]/20 ${className}`} {...props} />;
export const MenubarLabel = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`px-2 py-1.5 font-semibold ${className}`} {...props} />;
export const MenubarCheckboxItem = MenubarItem;
export const MenubarRadioGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const MenubarRadioItem = MenubarItem;
export const MenubarPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const MenubarSubContent = MenubarContent;
export const MenubarSubTrigger = MenubarItem;
export const MenubarGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const MenubarSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const MenubarShortcut = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={`ml-auto text-xs ${className}`} {...props} />;
