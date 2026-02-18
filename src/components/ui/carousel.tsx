import * as React from "react";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`relative ${className}`} {...props} />
);
Carousel.displayName = "Carousel";

export const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`flex ${className}`} {...props} />
);
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`min-w-0 shrink-0 grow-0 ${className}`} {...props} />
);
CarouselItem.displayName = "CarouselItem";

export const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => (
    <button ref={ref} className={`absolute left-0 top-1/2 -translate-y-1/2 ${className}`} {...props}>Prev</button>
  )
);
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', ...props }, ref) => (
    <button ref={ref} className={`absolute right-0 top-1/2 -translate-y-1/2 ${className}`} {...props}>Next</button>
  )
);
CarouselNext.displayName = "CarouselNext";

export const useCarousel = () => ({ 
  scrollPrev: () => {}, 
  scrollNext: () => {}, 
  canScrollPrev: false, 
  canScrollNext: false 
});
