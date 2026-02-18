import * as React from "react";

export interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
}

export const Toaster = ({ position = 'bottom-right', ...props }: ToasterProps) => {
  return (
    <div
      data-position={position}
      className="fixed z-50 pointer-events-none"
      {...props}
    />
  );
};
