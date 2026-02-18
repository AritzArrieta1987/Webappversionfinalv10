import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-[#c9a574]/20 bg-[#1a2a2a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c9a574] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export const SelectTrigger = Select;
export const SelectValue = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectItem = ({ children, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) => (
  <option {...props}>{children}</option>
);
export const SelectGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectLabel = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const SelectSeparator = () => null;
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;
