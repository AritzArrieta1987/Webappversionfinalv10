import * as React from "react";

export const NavigationMenu = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className = '', ...props }, ref) => <nav ref={ref} className={`relative z-10 flex ${className}`} {...props} />
);
NavigationMenu.displayName = "NavigationMenu";

export const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className = '', ...props }, ref) => <ul ref={ref} className={`flex space-x-1 ${className}`} {...props} />
);
NavigationMenuList.displayName = "NavigationMenuList";

export const NavigationMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className = '', ...props }, ref) => <li ref={ref} className={className} {...props} />
);
NavigationMenuItem.displayName = "NavigationMenuItem";

export const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => <button ref={ref} className={`px-4 py-2 text-sm font-medium ${className}`} {...props} />
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export const NavigationMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`absolute left-0 top-0 w-full ${className}`} {...props} />
);
NavigationMenuContent.displayName = "NavigationMenuContent";

export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className = '', ...props }, ref) => <a ref={ref} className={`text-[#c9a574] hover:underline ${className}`} {...props} />
);
NavigationMenuLink.displayName = "NavigationMenuLink";

export const NavigationMenuIndicator = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={className} {...props} />;
export const NavigationMenuViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={className} {...props} />
);
NavigationMenuViewport.displayName = "NavigationMenuViewport";

export const navigationMenuTriggerStyle = () => '';
