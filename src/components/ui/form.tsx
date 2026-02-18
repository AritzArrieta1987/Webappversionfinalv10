import * as React from "react";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className = '', ...props }, ref) => <form ref={ref} className={className} {...props} />
);
Form.displayName = "Form";

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`space-y-2 ${className}`} {...props} />
);
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = '', ...props }, ref) => <label ref={ref} className={`text-sm font-medium text-white ${className}`} {...props} />
);
FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={className} {...props} />
);
FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => <p ref={ref} className={`text-sm text-gray-400 ${className}`} {...props} />
);
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => <p ref={ref} className={`text-sm text-red-500 ${className}`} {...props} />
);
FormMessage.displayName = "FormMessage";

export const FormField = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
