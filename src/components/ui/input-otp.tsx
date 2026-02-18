import * as React from "react";

export interface InputOTPProps extends React.InputHTMLAttributes<HTMLInputElement> {
  maxLength?: number;
}

export const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className = '', maxLength = 6, ...props }, ref) => (
    <input ref={ref} maxLength={maxLength} className={`text-center ${className}`} {...props} />
  )
);
InputOTP.displayName = "InputOTP";

export const InputOTPGroup = ({ children }: { children?: React.ReactNode }) => <div className="flex gap-2">{children}</div>;
export const InputOTPSlot = ({ index, ...props }: { index: number } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className="w-10 h-10 flex items-center justify-center border border-[#c9a574]/20 rounded" {...props} />
);
export const InputOTPSeparator = () => <div className="flex items-center">-</div>;
