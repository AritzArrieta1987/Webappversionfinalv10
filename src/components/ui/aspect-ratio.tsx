import * as React from "react";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className = '', ratio = 1, style, ...props }, ref) => (
    <div ref={ref} style={{ paddingBottom: `${100 / ratio}%`, ...style }} className={`relative ${className}`} {...props} />
  )
);
AspectRatio.displayName = "AspectRatio";
