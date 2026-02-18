import * as React from "react";

export const ResizablePanelGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`flex h-full w-full ${className}`} {...props} />
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export const ResizablePanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`flex-1 ${className}`} {...props} />
);
ResizablePanel.displayName = "ResizablePanel";

export const ResizableHandle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`w-1 bg-[#c9a574]/20 ${className}`} {...props} />
);
ResizableHandle.displayName = "ResizableHandle";
