import * as React from "react";

export const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`overflow-hidden rounded-md border border-[#c9a574]/20 ${className}`} {...props} />
);
Command.displayName = "Command";

export interface CommandDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const CommandDialog = ({ children }: CommandDialogProps) => <div>{children}</div>;
export const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => <input ref={ref} className={`w-full bg-transparent outline-none ${className}`} {...props} />
);
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`max-h-[300px] overflow-y-auto ${className}`} {...props} />
);
CommandList.displayName = "CommandList";

export const CommandEmpty = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children || 'No results found.'}</div>;
export const CommandGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`p-1 ${className}`} {...props} />
);
CommandGroup.displayName = "CommandGroup";

export const CommandItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`cursor-pointer px-2 py-1.5 rounded hover:bg-[#c9a574]/20 ${className}`} {...props} />
);
CommandItem.displayName = "CommandItem";

export const CommandShortcut = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={`ml-auto text-xs ${className}`} {...props} />;
export const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`-mx-1 my-1 h-px bg-[#c9a574]/20 ${className}`} {...props} />
);
CommandSeparator.displayName = "CommandSeparator";
