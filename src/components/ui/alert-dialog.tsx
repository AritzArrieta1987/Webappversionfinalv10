import * as React from "react";

export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const AlertDialog = ({ children }: AlertDialogProps) => <div>{children}</div>;
export const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => (
    <button ref={ref} className={`inline-flex h-10 items-center justify-center rounded-md bg-[#c9a574] px-4 py-2 text-sm font-semibold text-white ${className}`} {...props} />
  )
);
AlertDialogAction.displayName = "AlertDialogAction";

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => (
    <button ref={ref} className={`inline-flex h-10 items-center justify-center rounded-md border border-[#c9a574]/20 px-4 py-2 text-sm font-semibold ${className}`} {...props} />
  )
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export const AlertDialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#c9a574]/20 bg-[#1a2a2a] p-6 shadow-lg ${className}`} {...props} />
  )
);
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-400 ${className}`} {...props} />
);
export const AlertDialogFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
);
export const AlertDialogHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
);
export const AlertDialogTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={`text-lg font-semibold text-white ${className}`} {...props} />
);
export const AlertDialogTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
