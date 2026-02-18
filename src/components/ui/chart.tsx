import * as React from "react";

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, unknown>;
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`w-full ${className}`} {...props} />
);
ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const ChartTooltipContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const ChartLegend = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const ChartLegendContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const ChartConfig: Record<string, unknown> = {};
