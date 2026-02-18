import { toast as sonnerToast } from 'sonner@2.0.3';

export const toast = {
  success: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.success(title, {
      description: options?.description,
      duration: options?.duration || 4000,
    });
  },
  error: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.error(title, {
      description: options?.description,
      duration: options?.duration || 4000,
    });
  },
  info: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.info(title, {
      description: options?.description,
      duration: options?.duration || 4000,
    });
  },
  warning: (title: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.warning(title, {
      description: options?.description,
      duration: options?.duration || 4000,
    });
  },
};
