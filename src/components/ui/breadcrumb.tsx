import * as React from "react";

export const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = '', ...props }, ref) => <nav ref={ref} className={className} {...props} />
);
Breadcrumb.displayName = "Breadcrumb";

export const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className = '', ...props }, ref) => <ol ref={ref} className={`flex items-center gap-2 ${className}`} {...props} />
);
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className = '', ...props }, ref) => <li ref={ref} className={`inline-flex items-center gap-2 ${className}`} {...props} />
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className = '', ...props }, ref) => <a ref={ref} className={`text-[#c9a574] hover:underline ${className}`} {...props} />
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`text-white ${className}`} {...props} />
);

export const BreadcrumbSeparator = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`text-gray-400 ${className}`} {...props}>/</span>
);

export const BreadcrumbEllipsis = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`text-gray-400 ${className}`} {...props}>...</span>
);
