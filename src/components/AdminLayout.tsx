import { LayoutDashboard, Users, Music, Wallet, FileText, Upload, Bell, Zap, Menu, X, Home, LogOut, Trash2, Package, Settings, Lock, Mail, UserCog } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router';
import logoImage from 'figma:asset/aa0296e2522220bcfcda71f86c708cb2cbc616b9.png';
import backgroundImage from 'figma:asset/0a2a9faa1b59d5fa1e388a2eec5b08498dd7a493.png';

interface AdminLayoutProps {
  onLogout: () => void;
}

export default function AdminLayout({ onLogout }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showCreateArtistAccess, setShowCreateArtistAccess] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [artistPassword, setArtistPassword] = useState('');
  const [artistName, setArtistName] = useState('');
  const [isCreatingAccess, setIsCreatingAccess] = useState(false);
  const [createAccessSuccess, setCreateAccessSuccess] = useState(false);

  // Tabs del menú
  const tabs = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Artistas', path: '/artists', icon: Users },
    { name: 'Catálogo', path: '/catalog', icon: Music },
    { name: 'Físico', path: '/physical-sales', icon: Package },
    { name: 'Finanzas', path: '/finances', icon: Wallet },
    { name: 'Contratos', path: '/contracts', icon: FileText },
    { name: 'Subir CSV', path: '/upload', icon: Upload },
  ];

  // Función para resetear todos los datos
  const handleResetAllData = () => {
    // Limpiar todo el localStorage excepto el token de autenticación
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    localStorage.clear();
    
    // Restaurar token de autenticación
    if (token) localStorage.setItem('token', token);
    if (email) localStorage.setItem('userEmail', email);
    
    setShowResetConfirm(false);
    setShowSettingsMenu(false);
    
    // Recargar la página para reflejar los cambios
    window.location.reload();
  };

  // Función para cambiar contraseña
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    // Aquí iría la lógica real de cambio de contraseña con el backend
    alert('Contraseña cambiada exitosamente');
    setShowChangePassword(false);
    setShowSettingsMenu(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  // Función para cambiar email
  const handleChangeEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }
    // Aquí iría la lógica real de cambio de email con el backend
    localStorage.setItem('userEmail', newEmail);
    alert('Email cambiado exitosamente');
    setShowChangeEmail(false);
    setShowSettingsMenu(false);
    setNewEmail('');
  };

  // Función para crear acceso de artista
  const handleCreateArtistAccess = async () => {
    if (!artistEmail || !artistEmail.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }
    if (!artistPassword || artistPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!artistName || artistName.trim() === '') {
      alert('Por favor ingresa el nombre del artista');
      return;
    }

    setIsCreatingAccess(true);

    try {
      // TODO: Implementar llamada al backend real
      // await fetch('/api/auth/create-artist', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify({ 
      //     email: artistEmail, 
      //     password: artistPassword,
      //     name: artistName 
      //   })
      // });

      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCreateAccessSuccess(true);
    } catch (error) {
      alert('Error al crear acceso de artista');
      console.error(error);
    } finally {
      setIsCreatingAccess(false);
    }
  };

  const closeCreateArtistModal = () => {
    setShowCreateArtistAccess(false);
    setArtistEmail('');
    setArtistPassword('');
    setArtistName('');
    setCreateAccessSuccess(false);
    setShowSettingsMenu(false);
  };

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar notificaciones al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Cerrar menú de ajustes al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  // Obtener el tab activo basado en la ruta
  const getActiveTab = () => {
    const currentTab = tabs.find(tab => tab.path === location.pathname);
    return currentTab ? currentTab.name : 'Dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* IMAGEN DE FONDO GLOBAL */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        opacity: 0.15,
        filter: 'blur(0px)',
        zIndex: -3,
        pointerEvents: 'none'
      }} />

      {/* OVERLAY VERDE GLOBAL */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        backdropFilter: 'blur(2px)',
        opacity: 0.7,
        zIndex: -2,
        pointerEvents: 'none'
      }} />

      {/* CAPA DE TINTE VERDE GLOBAL */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 32, 39, 0.25)',
        mixBlendMode: 'multiply' as const,
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header con menú horizontal */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: isMobile ? '12px 20px' : '16px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '16px' : '32px',
          background: 'linear-gradient(180deg, rgba(15, 32, 39, 0.4) 0%, rgba(15, 32, 39, 0.2) 100%)',
          borderBottom: '1px solid rgba(201, 165, 116, 0.15)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img 
              src={logoImage}
              alt="BIGARTIST"
              style={{
                height: isMobile ? '32px' : '40px',
                transition: 'all 0.4s ease',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
            />
          </div>

          {/* Tabs del menú - Desktop */}
          <div style={{ display: isMobile ? 'none' : 'flex', gap: '8px', flex: 1, justifyContent: 'center' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => navigate(tab.path)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(201, 165, 116, 0.15)' : 'rgba(0, 0, 0, 0)',
                    color: isActive ? '#c9a574' : 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#c9a574';
                      e.currentTarget.style.background = 'rgba(201, 165, 116, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0)';
                    }
                  }}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Notificaciones y Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Botón de Ajustes/Configuración */}
            <button
              onClick={() => setShowSettingsMenu(true)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: showSettingsMenu ? 'rgba(201, 165, 116, 0.2)' : 'rgba(201, 165, 116, 0.15)',
                border: `1px solid ${showSettingsMenu ? 'rgba(201, 165, 116, 0.4)' : 'rgba(201, 165, 116, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(201, 165, 116, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showSettingsMenu ? 'rgba(201, 165, 116, 0.2)' : 'rgba(201, 165, 116, 0.15)';
                e.currentTarget.style.borderColor = showSettingsMenu ? 'rgba(201, 165, 116, 0.4)' : 'rgba(201, 165, 116, 0.3)';
              }}
              title="Configuración"
            >
              <Settings size={20} color="#c9a574" />
            </button>

            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: showNotifications 
                    ? 'rgba(201, 165, 116, 0.2)' 
                    : 'rgba(42, 63, 63, 0.4)',
                  border: `1px solid ${showNotifications ? 'rgba(201, 165, 116, 0.4)' : 'rgba(201, 165, 116, 0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <Bell size={20} color="#c9a574" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #0f2027'
                  }} />
                )}
              </button>

              {/* Notification Panel */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: isMobile ? '300px' : '380px',
                  maxHeight: '500px',
                  background: 'linear-gradient(135deg, rgba(20, 35, 35, 0.98) 0%, rgba(15, 30, 30, 0.98) 100%)',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(20px)',
                  overflow: 'hidden',
                  zIndex: 1000
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(201, 165, 116, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                      Notificaciones
                    </h3>
                    <div style={{ fontSize: '12px', color: '#AFB3B7' }}>
                      {notifications.filter(n => !n.read).length} nuevas
                    </div>
                  </div>

                  <div style={{
                    maxHeight: '420px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}>
                    {notifications.length === 0 ? (
                      <div style={{
                        padding: '32px 20px',
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px' }}>No hay notificaciones</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                            background: notification.read ? 'transparent' : 'rgba(201, 165, 116, 0.05)',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                          }}
                          onClick={() => {
                            setNotifications(notifications.map(n => 
                              n.id === notification.id ? { ...n, read: true } : n
                            ));
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#c9a574' }}>
                              {notification.title}
                            </span>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                              {notification.time}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#AFB3B7', margin: 0, lineHeight: '1.4' }}>
                            {notification.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botón de Logout - Visible tanto en desktop como móvil */}
            <button
              onClick={onLogout}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              <LogOut size={20} color="#ef4444" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div style={{
          padding: isMobile ? '20px' : '32px 48px',
          paddingBottom: isMobile ? '100px' : '32px', // Espacio extra en mobile para bottom nav
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          <Outlet />
        </div>

        {/* Bottom Navigation - Solo Mobile */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'linear-gradient(180deg, rgba(15, 32, 39, 0.95) 0%, rgba(10, 25, 30, 0.98) 100%)',
            borderTop: '1px solid rgba(201, 165, 116, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
            padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => navigate(tab.path)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '8px 2px',
                    border: 'none',
                    background: 'transparent',
                    color: isActive ? '#c9a574' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Icon size={18} />
                  <span style={{
                    fontSize: '9px',
                    fontWeight: isActive ? '600' : '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación para resetear datos */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 47, 47, 0.98) 0%, rgba(20, 35, 35, 0.98) 100%)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(251, 146, 60, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={32} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                ¿Resetear todos los datos?
              </h3>
              <p style={{ fontSize: '14px', color: '#AFB3B7', lineHeight: '1.6' }}>
                Esta acción eliminará permanentemente:
              </p>
            </div>

            <div style={{
              background: 'rgba(42, 63, 63, 0.4)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: '14px', color: '#ffffff', lineHeight: '2' }}>
                <li>Todos los archivos CSV subidos</li>
                <li>Todos los artistas creados</li>
                <li>Todo el catálogo musical</li>
                <li>Todos los audios cargados</li>
                <li>Todas las estadísticas y métricas</li>
                <li>Todos los contratos y royalties</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>⚠️ Advertencia:</div>
              <div style={{ color: '#AFB3B7', fontSize: '13px' }}>
                Esta acción NO se puede deshacer. Tu sesión se mantendrá activa.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleResetAllData}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 146, 60, 0.5)',
                  background: 'rgba(251, 146, 60, 0.2)',
                  color: '#fb923c',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.5)';
                }}
              >
                Sí, resetear todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menú de configuración */}
      {showSettingsMenu && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 47, 47, 0.98) 0%, rgba(20, 35, 35, 0.98) 100%)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(251, 146, 60, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Settings size={32} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                Configuración
              </h3>
              <p style={{ fontSize: '14px', color: '#AFB3B7', lineHeight: '1.6' }}>
                Ajusta tus preferencias y seguridad
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowSettingsMenu(false);
                  setShowChangePassword(true);
                }}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                <Lock size={18} color="#c9a574" />
                <span>Cambiar contraseña</span>
              </button>
              <button
                onClick={() => {
                  setShowSettingsMenu(false);
                  setShowChangeEmail(true);
                }}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                <Mail size={18} color="#c9a574" />
                <span>Cambiar correo electrónico</span>
              </button>

              <button
                onClick={() => {
                  setShowSettingsMenu(false);
                  setShowCreateArtistAccess(true);
                }}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                <UserCog size={18} color="#c9a574" />
                <span>Crear Acceso Artista</span>
              </button>

              {/* Separador */}
              <div style={{
                height: '1px',
                background: 'rgba(201, 165, 116, 0.2)',
                margin: '8px 0'
              }} />

              <button
                onClick={() => {
                  setShowSettingsMenu(false);
                  setShowResetConfirm(true);
                }}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  background: 'rgba(251, 146, 60, 0.1)',
                  color: '#fb923c',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.3)';
                }}
              >
                <Trash2 size={18} color="#fb923c" />
                <span>Borrar todos los datos</span>
              </button>

              <button
                onClick={onLogout}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
              >
                <LogOut size={18} color="#ef4444" />
                <span>Cerrar sesión</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => setShowSettingsMenu(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showChangePassword && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 47, 47, 0.98) 0%, rgba(20, 35, 35, 0.98) 100%)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(251, 146, 60, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Lock size={32} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                Cambiar contraseña
              </h3>
              <p style={{ fontSize: '14px', color: '#AFB3B7', lineHeight: '1.6' }}>
                Ingresa tu nueva contraseña
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowChangePassword(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 146, 60, 0.5)',
                  background: 'rgba(251, 146, 60, 0.2)',
                  color: '#fb923c',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.5)';
                }}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de email */}
      {showChangeEmail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 47, 47, 0.98) 0%, rgba(20, 35, 35, 0.98) 100%)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(251, 146, 60, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Mail size={32} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                Cambiar email
              </h3>
              <p style={{ fontSize: '14px', color: '#AFB3B7', lineHeight: '1.6' }}>
                Ingresa tu nuevo email
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="email"
                placeholder="Nuevo email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowChangeEmail(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeEmail}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 146, 60, 0.5)',
                  background: 'rgba(251, 146, 60, 0.2)',
                  color: '#fb923c',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.5)';
                }}
              >
                Cambiar email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación de acceso de artista */}
      {showCreateArtistAccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 47, 47, 0.98) 0%, rgba(20, 35, 35, 0.98) 100%)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: '20px',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(251, 146, 60, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <UserCog size={32} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                Crear acceso de artista
              </h3>
              <p style={{ fontSize: '14px', color: '#AFB3B7', lineHeight: '1.6' }}>
                Ingresa los detalles del artista
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="email"
                placeholder="Email del artista"
                value={artistEmail}
                onChange={(e) => setArtistEmail(e.target.value)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
              <input
                type="password"
                placeholder="Contraseña del artista"
                value={artistPassword}
                onChange={(e) => setArtistPassword(e.target.value)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
              <input
                type="text"
                placeholder="Nombre del artista"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={closeCreateArtistModal}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  background: 'rgba(42, 63, 63, 0.4)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateArtistAccess}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 146, 60, 0.5)',
                  background: 'rgba(251, 146, 60, 0.2)',
                  color: '#fb923c',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.5)';
                }}
              >
                {isCreatingAccess ? 'Creando...' : 'Crear acceso'}
              </button>
            </div>

            {createAccessSuccess && (
              <div style={{
                marginTop: '24px',
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Acceso de artista creado exitososamente
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}