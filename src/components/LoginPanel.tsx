import { useState } from 'react';
import exampleImage from 'figma:asset/0a2a9faa1b59d5fa1e388a2eec5b08498dd7a493.png';
import logoImage from 'figma:asset/aa0296e2522220bcfcda71f86c708cb2cbc616b9.png';
import { login } from '../utils/api';

// Iconos SVG inline
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

interface LoginPanelProps {
  onLoginSuccess: () => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo('');
    setError('');

    try {
      // Llamada al backend para validar credenciales
      const response = await login(email, password);

      if (response.success) {
        // Login exitoso
        
        // Guardar token y datos del usuario
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          type: response.user.type // 'admin' o 'artist'
        }));
        
        onLoginSuccess();
      } else {
        // Credenciales incorrectas
        throw new Error(response.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
      setError(errorMessage);
      setDebugInfo('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecoveryLoading(true);
    setRecoveryError('');
    setRecoverySuccess(false);

    try {
      // Validar email
      if (!recoveryEmail || !recoveryEmail.includes('@')) {
        throw new Error('Por favor ingresa un email válido');
      }

      // Simular llamada al backend
      // En producción, aquí iría la llamada real al endpoint de recuperación
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Implementar endpoint real en backend
      // await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: recoveryEmail })
      // });

      setRecoverySuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar el correo';
      setRecoveryError(errorMessage);
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const closeRecoveryModal = () => {
    setShowRecoveryModal(false);
    setRecoveryEmail('');
    setRecoverySuccess(false);
    setRecoveryError('');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }} className="login-container">
      {/* IMAGEN DE FONDO GLOBAL - cubre todo el ancho */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${exampleImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        opacity: 0.6,
        zIndex: 1
      }} />

      {/* OVERLAY VERDE GLOBAL - aplicado a toda la imagen */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(13, 31, 35, 0.85) 0%, rgba(19, 46, 53, 0.8) 50%, rgba(45, 74, 83, 0.75) 100%)',
        backdropFilter: 'blur(2px)',
        zIndex: 2
      }} />

      {/* CAPA DE TINTE VERDE GLOBAL */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(32, 64, 64, 0.4)',
        mixBlendMode: 'multiply' as const,
        zIndex: 2
      }} />

      {/* LADO IZQUIERDO - Logo y branding */}
      <div className="left-panel" style={{
        position: 'relative',
        width: '55%',
        overflow: 'hidden',
        zIndex: 3
      }}>
        {/* Logo y texto corporativo */}
        <div className="logo-section" style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          width: '80%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Logo BIGARTIST */}
          <img 
            src={logoImage} 
            alt="BIGARTIST" 
            className="logo-image"
            style={{
              width: 'auto',
              maxWidth: '500px',
              height: 'auto',
              marginBottom: '16px',
              filter: 'drop-shadow(0 0 40px rgba(201, 165, 116, 0.4))',
              objectFit: 'contain'
            }}
          />
          
          {/* Línea dorada en el medio */}
          <div style={{
            width: '100px',
            height: '1.5px',
            background: 'linear-gradient(to right, transparent, #c9a574, transparent)',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 10px rgba(201, 165, 116, 0.5)'
          }} />

          <div className="subtitle" style={{
            color: '#c9a574',
            fontSize: '22px',
            fontWeight: '300',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            marginBottom: '0'
          }}>
            Royalties Management
          </div>
        </div>
      </div>

      {/* LADO DERECHO - Formulario de login */}
      <div className="right-panel" style={{
        position: 'relative',
        width: '45%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        overflow: 'hidden',
        zIndex: 3
      }}>
        <div className="form-container" style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 3 }}>
          {/* Header del formulario */}
          <div style={{ marginBottom: '48px' }}>
            <h2 className="form-title" style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              Admin Panel
            </h2>
            <p className="form-subtitle" style={{
              fontSize: '15px',
              color: '#AFB3B7',
              fontWeight: '400'
            }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin}>
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '14px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                {error}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#AFB3B7',
                marginBottom: '10px',
                letterSpacing: '0.3px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#ffffff',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(201, 165, 116, 0.3)',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: '500'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c9a574';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                  e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#AFB3B7',
                marginBottom: '10px',
                letterSpacing: '0.3px'
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    fontSize: '15px',
                    color: '#ffffff',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '2px solid rgba(201, 165, 116, 0.3)',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a574';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#69818D',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#c9a574'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#69818D'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#0D1F23',
                background: isLoading ? 'rgba(201, 165, 116, 0.5)' : 'linear-gradient(135deg, #c9a574 0%, #d4b589 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)',
                marginBottom: '16px',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 165, 116, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.3)';
                }
              }}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>

            {/* Enlace de recuperar contraseña */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c9a574',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  padding: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#d4b589';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#c9a574';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Debug Info */}
            {debugInfo && (
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93c5fd',
                padding: '14px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                marginBottom: '16px',
                whiteSpace: 'pre-line',
                fontFamily: 'monospace',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {debugInfo}
              </div>
            )}
          </form>

          {/* Footer */}
          <div style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(175, 179, 183, 0.2)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#69818D',
              fontWeight: '400'
            }}>
              © 2026 Big Artist Management S.L.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {showRecoveryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 47, 47, 0.98) 0%, rgba(20, 35, 35, 0.98) 100%)',
            border: '1px solid rgba(201, 165, 116, 0.3)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
          }}>
            {!recoverySuccess ? (
              <>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(201, 165, 116, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '32px'
                  }}>
                    🔑
                  </div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    marginBottom: '8px' 
                  }}>
                    Recuperar Contraseña
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#AFB3B7', 
                    lineHeight: '1.6' 
                  }}>
                    Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
                  </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleRecoverySubmit}>
                  {recoveryError && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '18px' }}>⚠️</span>
                      {recoveryError}
                    </div>
                  )}

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#AFB3B7',
                      marginBottom: '10px'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: '15px',
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        border: '2px solid rgba(201, 165, 116, 0.3)',
                        borderRadius: '10px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#c9a574';
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                        e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={closeRecoveryModal}
                      disabled={isRecoveryLoading}
                      style={{
                        flex: 1,
                        padding: '14px 24px',
                        borderRadius: '12px',
                        border: '1px solid rgba(201, 165, 116, 0.3)',
                        background: 'rgba(42, 63, 63, 0.4)',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isRecoveryLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: isRecoveryLoading ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isRecoveryLoading) {
                          e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
                          e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isRecoveryLoading) {
                          e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                          e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.3)';
                        }
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isRecoveryLoading}
                      style={{
                        flex: 1,
                        padding: '14px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isRecoveryLoading 
                          ? 'rgba(201, 165, 116, 0.5)' 
                          : 'linear-gradient(135deg, #c9a574 0%, #d4b589 100%)',
                        color: '#0D1F23',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isRecoveryLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)',
                        opacity: isRecoveryLoading ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isRecoveryLoading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 165, 116, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isRecoveryLoading) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.3)';
                        }
                      }}
                    >
                      {isRecoveryLoading ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                {/* Mensaje de éxito */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '40px'
                  }}>
                    ✅
                  </div>
                  <h3 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: '#ffffff', 
                    marginBottom: '12px' 
                  }}>
                    ¡Correo enviado!
                  </h3>
                  <p style={{ 
                    fontSize: '15px', 
                    color: '#AFB3B7', 
                    lineHeight: '1.8',
                    marginBottom: '24px' 
                  }}>
                    Hemos enviado las instrucciones de recuperación a <strong style={{ color: '#c9a574' }}>{recoveryEmail}</strong>
                    <br /><br />
                    Revisa tu bandeja de entrada y sigue los pasos indicados.
                  </p>
                  <button
                    onClick={closeRecoveryModal}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #c9a574 0%, #d4b589 100%)',
                      color: '#0D1F23',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 165, 116, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.3)';
                    }}
                  >
                    Entendido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style>{`
        /* RESPONSIVE MOBILE */
        @media (max-width: 968px) {
          .login-container {
            flex-direction: column !important;
          }

          .left-panel {
            width: 100% !important;
            min-height: 35vh !important;
            max-height: 35vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .right-panel {
            width: 100% !important;
            min-height: 65vh !important;
            padding: 30px 24px !important;
          }

          .logo-section {
            width: 90% !important;
            position: static !important;
            transform: none !important;
            padding: 0 20px;
          }

          .logo-image {
            max-width: 280px !important;
            margin-bottom: 20px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            display: block !important;
          }

          .subtitle {
            font-size: 14px !important;
            letter-spacing: 3px !important;
            margin-bottom: 20px !important;
          }

          .form-container {
            max-width: 100% !important;
          }

          .form-title {
            font-size: 26px !important;
          }

          .form-subtitle {
            font-size: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .left-panel {
            min-height: 30vh !important;
            max-height: 30vh !important;
          }

          .right-panel {
            min-height: 70vh !important;
            padding: 24px 20px !important;
          }

          .logo-image {
            max-width: 220px !important;
            margin-bottom: 16px !important;
          }

          .subtitle {
            font-size: 12px !important;
            letter-spacing: 2px !important;
            margin-bottom: 16px !important;
          }

          .form-title {
            font-size: 24px !important;
            margin-bottom: 8px !important;
          }

          .form-subtitle {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}