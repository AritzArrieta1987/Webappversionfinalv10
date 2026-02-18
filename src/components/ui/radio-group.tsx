import * as React from "react";

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`grid gap-2 ${className}`} {...props} />
);
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} type="radio" className={`h-4 w-4 rounded-full border border-[#c9a574] text-[#c9a574] ${className}`} {...props} />
  )
);
RadioGroupItem.displayName = "RadioGroupItem";
