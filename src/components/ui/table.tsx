import * as React from "react";

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={`w-full caption-bottom text-sm ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => {
    return <thead ref={ref} className={`[&_tr]:border-b border-[#c9a574]/20 ${className}`} {...props} />;
  }
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => {
    return <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
  }
);
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => {
    return <tfoot ref={ref} className={`bg-[#1a2a2a] font-medium ${className}`} {...props} />;
  }
);
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={`border-b border-[#c9a574]/20 transition-colors hover:bg-[#c9a574]/10 data-[state=selected]:bg-[#c9a574]/20 ${className}`}
        {...props}
      />
    );
  }
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`h-12 px-4 text-left align-middle font-medium text-gray-400 [&:has([role=checkbox])]:pr-0 ${className}`}
        {...props}
      />
    );
  }
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 text-white ${className}`}
        {...props}
      />
    );
  }
);
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <caption
        ref={ref}
        className={`mt-4 text-sm text-gray-400 ${className}`}
        {...props}
      />
    );
  }
);
TableCaption.displayName = "TableCaption";
