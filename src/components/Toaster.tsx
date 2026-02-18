import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(26, 35, 50, 0.95)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          color: '#ffffff',
        },
      }}
    />
  );
}