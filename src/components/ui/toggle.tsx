import * as React from "react";

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className = '', pressed = false, onPressedChange, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
    
    const variantStyles = {
      default: pressed ? 'bg-gray-200' : 'hover:bg-gray-100',
      outline: pressed ? 'bg-gray-200' : 'border border-gray-200 hover:bg-gray-100'
    };
    
    const sizeStyles = {
      default: 'h-10 px-3',
      sm: 'h-9 px-2.5',
      lg: 'h-11 px-5'
    };
    
    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
    
    return (
      <button
        ref={ref}
        className={classes}
        data-state={pressed ? 'on' : 'off'}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
      />
    );
  }
);
Toggle.displayName = "Toggle";

export const toggleVariants = () => '';
