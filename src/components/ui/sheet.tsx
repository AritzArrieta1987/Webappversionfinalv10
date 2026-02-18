import * as React from "react";

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Sheet = ({ children, open, onOpenChange }: SheetProps) => {
  return <div data-state={open ? 'open' : 'closed'}>{children}</div>;
};

export const SheetTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>;
};

export const SheetClose = ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => {
  return <button {...props}>{children}</button>;
};

export const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`fixed right-0 top-0 z-50 h-full w-3/4 max-w-sm border-l bg-white p-6 shadow-lg ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SheetContent.displayName = "SheetContent";

export const SheetHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}
      {...props}
    />
  );
};

export const SheetFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
      {...props}
    />
  );
};

export const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={`text-lg font-semibold ${className}`}
        {...props}
      />
    );
  }
);
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-gray-500 ${className}`}
        {...props}
      />
    );
  }
);
SheetDescription.displayName = "SheetDescription";
