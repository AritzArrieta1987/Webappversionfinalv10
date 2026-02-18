import { Outlet, useLocation, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { 
  Home, LogOut, Bell, Menu 
} from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '../ui/sidebar';

// Componente interno que usa useSidebar
function DashboardContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpen } = useSidebar();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; type: string; email?: string } | null>(null);
  const [notifications, setNotifications] = useState<{ id: number; text: string; time: string; read: boolean }[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Cargar notificaciones existentes desde localStorage
    const loadNotifications = () => {
      const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      setNotifications(storedNotifications);
    };
    
    loadNotifications();
    
    // Escuchar eventos personalizados de nuevas solicitudes de pago
    const handlePaymentRequest = (event: any) => {
      console.log('🔔 Nueva solicitud de pago recibida:', event.detail);
      
      const data = event.detail;
      const newNotification = {
        id: Date.now(),
        text: `${data.artistName} ha solicitado un pago de ${data.amount.toFixed(2)}€`,
        time: 'Ahora',
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Reproducir sonido de notificación
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYJGGS64OefTBANUKrm8LJfGgU7k9nywn0zBSR8zPLYiTUIGWq86+2hTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGAU7k9nyw38wBCF+zvLZiTYJGWq86+2gTQ8OTq3k8LJeGA==');
        audio.play();
      } catch (err) {
        console.log('No se pudo reproducir el sonido de notificación');
      }
    };
    
    window.addEventListener('paymentRequested', handlePaymentRequest);
    
    return () => {
      window.removeEventListener('paymentRequested', handlePaymentRequest);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* SIDEBAR */}
      <Sidebar>
        <SidebarHeader>
          <div className="logo">BIGARTIST</div>
          <div className="logo-subtitle">Royalties</div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => {
                      navigate(item.path);
                      setOpen(false);
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* MAIN CONTENT */}
      <SidebarInset>
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <SidebarTrigger>
              <Menu size={24} />
            </SidebarTrigger>
            <div className="header-title">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </div>
          </div>

          <div className="header-actions">
            {/* Notificaciones */}
            <div className="notifications-wrapper">
              <button 
                className="notification-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {notificationsOpen && notifications.length > 0 && (
                <>
                  <div 
                    className="notifications-overlay"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notificaciones</h3>
                      <span className="badge">{unreadCount}</span>
                    </div>
                    <div className="notifications-list">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className="notification-item"
                          onClick={() => {
                            // Marcar como leída
                            setNotifications(prev => 
                              prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                            );
                            // Navegar a finanzas
                            navigate('/finances');
                            setNotificationsOpen(false);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="notification-dot" style={{ 
                            background: notif.read ? 'rgba(201, 165, 116, 0.3)' : '#c9a574' 
                          }}></div>
                          <div>
                            <p className="notification-text">{notif.text}</p>
                            <span className="notification-time">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      className="notifications-footer"
                      onClick={() => {
                        navigate('/finances');
                        setNotificationsOpen(false);
                      }}
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar */}
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name || 'Usuario'}</div>
                <div className="user-role">{user?.type === 'admin' ? 'Administrador' : 'Artista'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* BOTTOM NAVIGATION MOBILE */}
        <nav className="bottom-nav">
          {[
            { path: '/', icon: Home, label: 'Inicio' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SidebarInset>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #0d1f23;
        }

        /* ==================== LOGO ==================== */
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #c9a574;
          letter-spacing: 2px;
          text-align: center;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #AFB3B7;
          text-align: center;
          margin-top: 4px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        /* ==================== LOGOUT BUTTON ==================== */
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          width: 100%;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        /* ==================== HEADER ==================== */
        .header {
          position: sticky;
          top: 0;
          height: 70px;
          background: #1a2f35;
          border-bottom: 1px solid rgba(201, 165, 116, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 90;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-title {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        /* ==================== NOTIFICACIONES ==================== */
        .notifications-wrapper {
          position: relative;
        }

        .notification-btn {
          position: relative;
          background: rgba(201, 165, 116, 0.1);
          border: 1px solid rgba(201, 165, 116, 0.2);
          color: #c9a574;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .notification-btn:hover {
          background: rgba(201, 165, 116, 0.15);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notifications-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
        }

        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 360px;
          background: #2a3f3f;
          border: 1px solid rgba(201, 165, 116, 0.2);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 101;
          overflow: hidden;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(201, 165, 116, 0.2);
        }

        .notifications-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .badge {
          background: #c9a574;
          color: #0d1f23;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .notifications-list {
          max-height: 320px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(201, 165, 116, 0.1);
          transition: background 0.2s ease;
        }

        .notification-item:hover {
          background: rgba(201, 165, 116, 0.05);
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          background: #c9a574;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .notification-text {
          font-size: 13px;
          color: #ffffff;
          margin: 0 0 4px 0;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 11px;
          color: #69818D;
        }

        .notifications-footer {
          width: 100%;
          padding: 14px;
          background: rgba(201, 165, 116, 0.05);
          border: none;
          color: #c9a574;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .notifications-footer:hover {
          background: rgba(201, 165, 116, 0.1);
        }

        /* ==================== USER AVATAR ==================== */
        .user-avatar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #c9a574 0%, #d4b589 100%);
          color: #0d1f23;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .user-role {
          font-size: 11px;
          color: #69818D;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ==================== PAGE CONTENT ==================== */
        .page-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          background: #0d1f23;
        }

        /* ==================== BOTTOM NAVIGATION MOBILE ==================== */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: #2a3f3f;
          border-top: 1px solid rgba(201, 165, 116, 0.2);
          padding: 8px 0;
          z-index: 100;
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #AFB3B7;
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .bottom-nav-item.active {
          color: #c9a574;
        }

        /* ==================== RESPONSIVE ==================== */
        @media (max-width: 768px) {
          .header {
            padding: 0 16px;
          }

          .header-title {
            font-size: 18px;
          }

          .user-info {
            display: none;
          }

          .page-content {
            padding: 20px 16px 90px 16px;
          }

          .bottom-nav {
            display: flex;
          }

          .notifications-dropdown {
            width: calc(100vw - 32px);
            right: -16px;
          }
        }

        @media (max-width: 480px) {
          .header-title {
            font-size: 16px;
          }

          .page-content {
            padding: 16px 16px 90px 16px;
          }
        }
      `}</style>
    </>
  );
}

// Componente principal que envuelve con SidebarProvider
export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="dashboard-layout">
        <DashboardContent />
      </div>
    </SidebarProvider>
  );
}