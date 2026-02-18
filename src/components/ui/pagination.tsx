import * as React from "react";

export const Pagination = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = '', ...props }, ref) => <nav ref={ref} className={`flex w-full justify-center ${className}`} {...props} />
);
Pagination.displayName = "Pagination";

export const PaginationContent = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className = '', ...props }, ref) => <ul ref={ref} className={`flex flex-row items-center gap-1 ${className}`} {...props} />
);
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className = '', ...props }, ref) => <li ref={ref} className={className} {...props} />
);
PaginationItem.displayName = "PaginationItem";

export const PaginationLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className = '', ...props }, ref) => (
    <a ref={ref} className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#c9a574]/20 text-sm hover:bg-[#c9a574]/20 ${className}`} {...props} />
  )
);
PaginationLink.displayName = "PaginationLink";

export const PaginationPrevious = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className = '', ...props }, ref) => <PaginationLink ref={ref} className={className} {...props} />
);
PaginationPrevious.displayName = "PaginationPrevious";

export const PaginationNext = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className = '', ...props }, ref) => <PaginationLink ref={ref} className={className} {...props} />
);
PaginationNext.displayName = "PaginationNext";

export const PaginationEllipsis = ({ className = '', ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`flex h-9 w-9 items-center justify-center ${className}`} {...props}>...</span>
);
