import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { X } from "lucide-react";

// ==================== CONTEXT ====================
interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
};

// ==================== PROVIDER ====================
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarProvider = ({ children, defaultOpen = true }: SidebarProviderProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setOpen(defaultOpen);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true } as AddEventListenerOptions);
    return () => window.removeEventListener('resize', checkMobile, { passive: true } as AddEventListenerOptions);
  }, [defaultOpen]);

  const toggleSidebar = () => setOpen(!open);

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// ==================== SIDEBAR ====================
interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const Sidebar = ({ children, className = "" }: SidebarProps) => {
  const { open, setOpen, isMobile } = useSidebar();

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={className}
        style={{
          position: 'fixed',
          left: isMobile && !open ? '-280px' : 0,
          top: 0,
          width: '260px',
          height: '100vh',
          background: '#2a3f3f',
          borderRight: '1px solid rgba(201, 165, 116, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
        }}
      >
        {/* Botón cerrar en móvil */}
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#c9a574',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} />
          </button>
        )}

        {children}
      </aside>
    </>
  );
};

// ==================== SIDEBAR INSET ====================
interface SidebarInsetProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarInset = ({ children, className = "" }: SidebarInsetProps) => {
  const { open, isMobile } = useSidebar();

  return (
    <div
      className={className}
      style={{
        marginLeft: !isMobile && open ? '260px' : 0,
        transition: 'margin-left 0.3s ease',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
};

// ==================== SIDEBAR TRIGGER ====================
interface SidebarTriggerProps {
  className?: string;
  children?: React.ReactNode;
}

export const SidebarTrigger = ({ className = "", children }: SidebarTriggerProps) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        color: '#c9a574',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
};

// ==================== SIDEBAR HEADER ====================
interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarHeader = ({ children, className = "" }: SidebarHeaderProps) => {
  return (
    <div
      className={className}
      style={{
        padding: '32px 24px 24px',
        borderBottom: '1px solid rgba(201, 165, 116, 0.2)',
      }}
    >
      {children}
    </div>
  );
};

// ==================== SIDEBAR CONTENT ====================
interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarContent = ({ children, className = "" }: SidebarContentProps) => {
  return (
    <div
      className={className}
      style={{
        flex: 1,
        padding: '24px 16px',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
};

// ==================== SIDEBAR FOOTER ====================
interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarFooter = ({ children, className = "" }: SidebarFooterProps) => {
  return (
    <div
      className={className}
      style={{
        padding: '16px',
        borderTop: '1px solid rgba(201, 165, 116, 0.2)',
      }}
    >
      {children}
    </div>
  );
};

// ==================== SIDEBAR MENU ====================
interface SidebarMenuProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarMenu = ({ children, className = "" }: SidebarMenuProps) => {
  return (
    <nav className={className}>
      {children}
    </nav>
  );
};

// ==================== SIDEBAR MENU ITEM ====================
interface SidebarMenuItemProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarMenuItem = ({ children, className = "" }: SidebarMenuItemProps) => {
  return (
    <div className={className} style={{ marginBottom: '4px' }}>
      {children}
    </div>
  );
};

// ==================== SIDEBAR MENU BUTTON ====================
interface SidebarMenuButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SidebarMenuButton = ({ 
  children, 
  isActive = false, 
  onClick, 
  className = "" 
}: SidebarMenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        width: '100%',
        color: isActive ? '#c9a574' : '#AFB3B7',
        background: isActive ? 'rgba(201, 165, 116, 0.15)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(201, 165, 116, 0.1)';
          e.currentTarget.style.color = '#c9a574';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#AFB3B7';
        }
      }}
    >
      {children}
    </button>
  );
};