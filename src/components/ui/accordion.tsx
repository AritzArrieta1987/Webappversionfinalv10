import * as React from "react";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={className} {...props} />
);
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`border-b border-[#c9a574]/20 ${className}`} {...props} />
);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => (
    <button ref={ref} className={`flex w-full items-center justify-between py-4 font-medium transition-all hover:underline text-white ${className}`} {...props} />
  )
);
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`overflow-hidden text-sm transition-all text-gray-400 ${className}`} {...props} />
  )
);
AccordionContent.displayName = "AccordionContent";
