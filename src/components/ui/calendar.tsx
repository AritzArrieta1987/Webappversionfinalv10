import * as React from "react";

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: 'single' | 'multiple' | 'range';
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`p-3 ${className}`} {...props}>
      <div className="text-white">Calendar Component</div>
    </div>
  )
);
Calendar.displayName = "Calendar";
