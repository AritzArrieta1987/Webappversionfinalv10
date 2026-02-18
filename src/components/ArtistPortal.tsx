import { useState, useEffect, useRef } from 'react';
import { Bell, BarChart3, Music, FileText, DollarSign, LogOut, Disc, CheckCircle, AlertCircle, Info, X, TrendingUp, Calendar, Camera, Settings, Wallet, CreditCard, Globe, Clock, Download, Eye, FileSignature, Package, Play, Pause, Shirt, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ContractPDFViewer } from './ContractPDFViewer';
import logoImage from 'figma:asset/aa0296e2522220bcfcda71f86c708cb2cbc616b9.png';
import backgroundImage from 'figma:asset/0a2a9faa1b59d5fa1e388a2eec5b08498dd7a493.png';

interface ArtistPortalProps {
  onLogout: () => void;
  artistData?: {
    id: number;
    name: string;
    email: string;
    photo?: string;
    totalRevenue: number;
    totalStreams: number;
    tracks: any[];
    monthlyData: { month: string; revenue: number; streams: number }[];
    platformBreakdown: { [key: string]: number };
    // ✅ AGREGAR VALORES YA CALCULADOS
    royaltyPercentage?: number;
    artistRoyalty?: number;
    labelShare?: number;
  };
}

export default function ArtistPortal({ onLogout, artistData }: ArtistPortalProps) {
  // Datos del artista con fallback
  const defaultData = {
    id: 0,
    name: artistData?.name || 'Artista',
    email: artistData?.email || 'artist@bigartist.es',
    totalRevenue: 0,
    totalStreams: 0,
    tracks: [],
    monthlyData: [],
    platformBreakdown: {}
  };

  const data = artistData || defaultData;

  // 🔍 DEBUG: Log de datos recibidos
  useEffect(() => {
    console.log('🎨 ArtistPortal - Datos recibidos:', {
      name: data.name,
      totalRevenue: data.totalRevenue,
      artistRoyalty: data.artistRoyalty,
      royaltyPercentage: data.royaltyPercentage,
      tracks: data.tracks?.length || 0
    });
  }, [data]);

  const [activeTab, setActiveTab] = useState('Dashboard');
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
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [bannerImage, setBannerImage] = useState<string>(
    artistData?.photo || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1400&h=300&fit=crop'
  );

  // Estados para el reproductor de audio
  const [trackAudios, setTrackAudios] = useState<{ [key: string]: string }>({});
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Estados para el formulario de pago
  const [paymentFormData, setPaymentFormData] = useState({
    firstName: '',
    lastName: '',
    accountHolder: '',
    iban: '',
    amount: ''
  });

  // Historial de pagos (se llenará desde el backend)
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: number;
    date: string;
    amount: number;
    status: string;
    method: string;
    reference: string;
  }>>([]);

  // Cargar notificaciones del artista desde localStorage
  useEffect(() => {
    const loadArtistNotifications = () => {
      if (data.id) {
        const artistNotificationKey = `artistNotifications_${data.id}`;
        const savedNotifications = JSON.parse(localStorage.getItem(artistNotificationKey) || '[]');
        setNotifications(savedNotifications);
      }
    };
    
    loadArtistNotifications();
    
    // ✅ Escuchar eventos de nuevas notificaciones
    const handleNotificationReceived = (event: any) => {
      if (event.detail?.artistId === data.id) {
        loadArtistNotifications();
        
        // ✅ Reproducir sonido de notificación
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTgwMUKXh8LhkHAU3kdXx0H0sASV1xe/glEIKElyx6OyrWBIIR5zd8sFuJAYug8vw3YU2BxlqvO3mm1ENDQ==');
        audio.play().catch(() => {});
      }
    };
    
    window.addEventListener('artistNotificationReceived', handleNotificationReceived);
    
    return () => {
      window.removeEventListener('artistNotificationReceived', handleNotificationReceived);
    };
  }, [data.id]);

  // Cargar audios desde localStorage
  useEffect(() => {
    const savedAudios = JSON.parse(localStorage.getItem('trackAudios') || '{}');
    setTrackAudios(savedAudios);
    
    // 🔄 Escuchar cuando se carga un nuevo audio
    const handleStorageChange = () => {
      const updatedAudios = JSON.parse(localStorage.getItem('trackAudios') || '{}');
      setTrackAudios(updatedAudios);
      console.log('🔔 ArtistPortal: Audios actualizados');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('trackAudioUploaded', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('trackAudioUploaded', handleStorageChange);
    };
  }, []);

  // Auto-completar titular de cuenta cuando cambian nombre o apellidos
  useEffect(() => {
    if (paymentFormData.firstName || paymentFormData.lastName) {
      const fullName = `${paymentFormData.firstName} ${paymentFormData.lastName}`.trim();
      setPaymentFormData(prev => ({
        ...prev,
        accountHolder: fullName
      }));
    }
  }, [paymentFormData.firstName, paymentFormData.lastName]);

  // Contratos (se llenarán desde el backend)
  const [contracts, setContracts] = useState<Array<{
    id: number;
    artistName: string;
    contractType: string;
    status: string;
    startDate: string;
    endDate: string;
    royaltyPercentage: number;
    totalRevenue?: number;
    isPhysical?: boolean;
    workBilling?: string;
    contractPDF?: string;
    contractPDFName?: string;
    signedAt?: string;
  }>>([]);

  // Cargar contratos del artista desde localStorage
  useEffect(() => {
    const savedContracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    // Filtrar contratos que pertenecen a este artista
    const artistContracts = savedContracts.filter(
      (contract: any) => contract.artistName === data.name
    );
    setContracts(artistContracts);
  }, [data.name]);

  // Estado para contrato seleccionado (modal de detalle)
  const [selectedContract, setSelectedContract] = useState<any>(null);
  
  // Estado para visor de PDF
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  
  // Función para firmar contrato
  const handleSignContract = (contractId: number) => {
    const allContracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const updatedContracts = allContracts.map((contract: any) => {
      if (contract.id === contractId) {
        return {
          ...contract,
          signedAt: new Date().toISOString(),
          status: 'active' // Cambiar a activo cuando se firma
        };
      }
      return contract;
    });
    
    // Guardar en localStorage
    localStorage.setItem('contracts', JSON.stringify(updatedContracts));
    
    // Actualizar estado local
    const artistContracts = updatedContracts.filter(
      (contract: any) => contract.artistName === data.name
    );
    setContracts(artistContracts);
    
    // Crear notificación
    const newNotification = {
      id: Date.now(),
      type: 'success',
      title: 'Contrato Firmado',
      message: 'Has firmado el contrato exitosamente',
      time: new Date().toLocaleString('es-ES'),
      read: false
    };
    
    const artistNotificationKey = `artistNotifications_${data.id}`;
    const existingNotifications = JSON.parse(localStorage.getItem(artistNotificationKey) || '[]');
    const updatedNotifications = [newNotification, ...existingNotifications];
    localStorage.setItem(artistNotificationKey, JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  };

  // Estado para notificación de éxito de pago
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Auto-cerrar notificación después de 4 segundos
  useEffect(() => {
    if (showPaymentSuccess) {
      const timer = setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showPaymentSuccess]);

  // Actualizar banner cuando cambia la foto del artista
  useEffect(() => {
    if (artistData?.photo) {
      setBannerImage(artistData.photo);
    }
  }, [artistData?.photo]);

  // Detectar pantalla móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para formatear importes en formato europeo
  const formatEuro = (amount: number): string => {
    return amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '€';
  };

  // Función para reproducir/pausar audio
  const togglePlayAudio = (trackId: string) => {
    if (playingTrackId === trackId) {
      // Pausar
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      // Reproducir
      if (audioRef.current) {
        audioRef.current.src = trackAudios[trackId];
        audioRef.current.play();
        setPlayingTrackId(trackId);
      }
    }
  };

  // Limpiar cuando termina el audio
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setPlayingTrackId(null);
      };
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  // Cerrar notificaciones al hacer click fuera
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

  // Función para marcar notificación como leída
  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    
    // ✅ Guardar en localStorage
    const artistNotificationKey = `artistNotifications_${data.id}`;
    localStorage.setItem(artistNotificationKey, JSON.stringify(updatedNotifications));
  };

  // Función para eliminar notificación
  const deleteNotification = (id: number) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    
    // ✅ Guardar en localStorage
    const artistNotificationKey = `artistNotifications_${data.id}`;
    localStorage.setItem(artistNotificationKey, JSON.stringify(updatedNotifications));
  };

  // Función para cambiar imagen del banner
  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Obtener icono según tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle, color: '#4ade80' };
      case 'warning':
        return { icon: AlertCircle, color: '#f59e0b' };
      case 'error':
        return { icon: AlertCircle, color: '#ef4444' };
      default:
        return { icon: Info, color: '#60a5fa' };
    }
  };

  const tabs = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Mi Catálogo', icon: Music },
    { name: 'Físico', icon: Package },
    { name: 'Royalties', icon: DollarSign },
    { name: 'Contratos', icon: FileText },
    { name: 'Configuración', icon: Settings }
  ];

  // ✅ USAR VALORES YA CALCULADOS EN ArtistPortalPage (misma lógica que Dashboard)
  const totalRoyalties = data.totalRevenue || 0;
  const totalArtista = data.artistRoyalty || 0;
  const totalBAM = data.labelShare || 0;
  const royaltyPercentage = data.royaltyPercentage || 50;
  
  // 🔍 DEBUG: Mostrar valores recibidos
  console.log('🎯🎯🎯 ===== ARTIST PORTAL ACTUALIZADO V2 ===== 🎯🎯🎯');
  console.log('💵 VALORES RECIBIDOS EN ARTISTPORTAL (calculados en ArtistPortalPage):');
  console.log('  - totalRoyalties (bruto):', totalRoyalties);
  console.log('  - royaltyPercentage:', royaltyPercentage + '%');
  console.log('  - totalArtista:', totalArtista);
  console.log('  - totalBAM:', totalBAM);
  console.log('🎯🎯🎯 ========================================= 🎯🎯🎯');

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div>
            {/* Métricas principales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: isMobile ? '12px' : '16px',
              marginBottom: '32px'
            }}>
              {/* Total Royalties */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: isMobile ? '16px' : '20px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: '50%',
                    background: 'rgba(201, 165, 116, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DollarSign size={isMobile ? 20 : 24} color="#c9a574" />
                  </div>
                  <div style={{
                    fontSize: isMobile ? '9px' : '10px',
                    fontWeight: '600',
                    color: '#6b7280',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    textAlign: 'right'
                  }}>
                    Total Royalties
                  </div>
                </div>
                <div style={{
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  {totalRoyalties.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>Ingresos totales acumulados ✅ V2</span>
                </div>
              </div>

              {/* Total Artista */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: isMobile ? '16px' : '20px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: '50%',
                    background: 'rgba(74, 222, 128, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp size={isMobile ? 20 : 24} color="#4ade80" />
                  </div>
                  <div style={{
                    fontSize: isMobile ? '9px' : '10px',
                    fontWeight: '600',
                    color: '#6b7280',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    textAlign: 'right'
                  }}>
                    Total Artista
                  </div>
                </div>
                <div style={{
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: '700',
                  color: '#4ade80',
                  letterSpacing: '-0.5px',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  {totalArtista.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{royaltyPercentage}% para el artista</span>
                </div>
              </div>

              {/* Total BAM (Label Share) */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: isMobile ? '16px' : '20px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '40px' : '48px',
                    height: isMobile ? '40px' : '48px',
                    borderRadius: '50%',
                    background: 'rgba(251, 146, 60, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Wallet size={isMobile ? 20 : 24} color="#fb923c" />
                  </div>
                  <div style={{
                    fontSize: isMobile ? '9px' : '10px',
                    fontWeight: '600',
                    color: '#6b7280',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    textAlign: 'right'
                  }}>
                    Total BAM
                  </div>
                </div>
                <div style={{
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: '700',
                  color: '#fb923c',
                  letterSpacing: '-0.5px',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  {totalBAM.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{100 - royaltyPercentage}% para el sello</span>
                </div>
              </div>
            </div>

            {/* Gráfico de Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr',
              gap: isMobile ? '16px' : '24px',
              marginBottom: isMobile ? '20px' : '32px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <BarChart3 size={20} color="#c9a574" />
                  Overview
                </h2>
                
                {data.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={isMobile ? 150 : 180}>
                    <LineChart data={data.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 165, 116, 0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#AFB3B7" 
                        style={{ fontSize: isMobile ? '10px' : '12px' }}
                        interval={isMobile ? 1 : 0}
                      />
                      <YAxis 
                        stroke="#AFB3B7" 
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${value}€`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a2f2f',
                          border: '1px solid rgba(201, 165, 116, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        formatter={(value: any) => [`${value}€`, 'Ingresos']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#c9a574" 
                        strokeWidth={2}
                        dot={{ fill: '#c9a574', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <BarChart3 size={48} color="#c9a574" style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      No hay datos disponibles
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contrato Activo - Resumen */}
            <div style={{
              marginBottom: isMobile ? '20px' : '32px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '16px',
                padding: isMobile ? '20px' : '24px'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <FileSignature size={20} color="#c9a574" />
                  Contrato Activo
                </h2>
                
                {contracts.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: isMobile ? '16px' : '20px'
                  }}>
                    {/* Información del Contrato */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      padding: isMobile ? '16px' : '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#AFB3B7', marginBottom: '6px' }}>Tipo de Contrato</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: 'rgba(201, 165, 116, 0.15)',
                            border: '1px solid rgba(201, 165, 116, 0.3)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#c9a574'
                          }}>
                            {contracts[0].contractType}
                          </span>
                          <span style={{
                            padding: '4px 12px',
                            background: contracts[0].status === 'active' 
                              ? 'rgba(34, 197, 94, 0.15)' 
                              : 'rgba(239, 68, 68, 0.15)',
                            border: contracts[0].status === 'active'
                              ? '1px solid rgba(34, 197, 94, 0.3)'
                              : '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: contracts[0].status === 'active' ? '#22c55e' : '#ef4444'
                          }}>
                            {contracts[0].status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#AFB3B7', marginBottom: '6px' }}>Porcentaje de Royalties</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '32px', fontWeight: '700', color: '#c9a574' }}>
                            {contracts[0].royaltyPercentage}%
                          </span>
                          <span style={{ fontSize: '14px', color: '#AFB3B7' }}>del total</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#AFB3B7', marginBottom: '6px' }}>Facturación de Obra</p>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                          {contracts[0].workBilling || 'No especificado'}
                        </p>
                      </div>
                    </div>

                    {/* Fechas y Detalles */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      padding: isMobile ? '16px' : '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#AFB3B7', marginBottom: '6px' }}>Fecha de Inicio</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#c9a574" />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                            {new Date(contracts[0].startDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#AFB3B7', marginBottom: '6px' }}>Fecha de Finalización</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#c9a574" />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                            {new Date(contracts[0].endDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {contracts[0].totalRevenue !== undefined && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          border: '1px solid rgba(201, 165, 116, 0.3)'
                        }}>
                          <p style={{ fontSize: '12px', color: '#AFB3B7', marginBottom: '4px' }}>Ingresos Totales del Contrato</p>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#c9a574' }}>
                            €{contracts[0].totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <FileSignature size={48} color="#c9a574" style={{ opacity: 0.3 }} />
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      No hay contratos activos disponibles
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'Mi Catálogo':
        return (
          <div>
            <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: isMobile ? '12px' : '16px', color: '#ffffff' }}>
              Mi Catálogo
            </h1>
            
            {/* Caja informativa de porcentaje */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)',
              border: '1px solid rgba(201, 165, 116, 0.3)',
              borderRadius: '12px',
              padding: isMobile ? '12px 16px' : '16px 20px',
              marginBottom: isMobile ? '16px' : '24px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: isMobile ? '12px' : '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(201, 165, 116, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileSignature size={20} color="#c9a574" />
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                    Tu porcentaje de royalties
                  </div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#AFB3B7' }}>
                    Según tu contrato activo
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: isMobile ? '12px' : '16px',
                width: isMobile ? '100%' : 'auto'
              }}>
                <div style={{
                  flex: isMobile ? 1 : 'none',
                  padding: '10px 16px',
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '600', color: '#4ade80', marginBottom: '4px' }}>
                    Artista
                  </div>
                  <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#4ade80' }}>
                    {royaltyPercentage}%
                  </div>
                </div>
                <div style={{
                  flex: isMobile ? 1 : 'none',
                  padding: '10px 16px',
                  background: 'rgba(251, 146, 60, 0.1)',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '600', color: '#fb923c', marginBottom: '4px' }}>
                    Compañía
                  </div>
                  <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#fb923c' }}>
                    {100 - royaltyPercentage}%
                  </div>
                </div>
              </div>
            </div>
            
            {data.tracks.length === 0 ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center'
              }}>
                <Music size={48} color="#c9a574" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '18px', color: '#AFB3B7', marginBottom: '8px' }}>No hay canciones aún</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Tus canciones aparecerán aquí cuando se procesen los datos</p>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.tracks.map((track: any, index: number) => {
                    // Generar el mismo ID que en CatalogPage
                    const trackName = track.title || track.name;
                    const trackId = track.isrc || `${data.name}-${trackName}`;
                    const hasAudio = trackAudios[trackId];
                    const isPlaying = playingTrackId === trackId;
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? '12px' : '16px',
                          padding: isMobile ? '14px' : '20px',
                          background: isPlaying 
                            ? 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                          borderRadius: isMobile ? '10px' : '12px',
                          border: isPlaying 
                            ? '1px solid rgba(201, 165, 116, 0.4)'
                            : '1px solid rgba(201, 165, 116, 0.15)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {/* Botón de play/pause o icono de disco */}
                        {hasAudio ? (
                          <button
                            onClick={() => togglePlayAudio(trackId)}
                            style={{
                              width: isMobile ? '48px' : '56px',
                              height: isMobile ? '48px' : '56px',
                              borderRadius: isMobile ? '10px' : '12px',
                              background: isPlaying
                                ? 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)'
                                : 'linear-gradient(135deg, rgba(201, 165, 116, 0.25) 0%, rgba(201, 165, 116, 0.1) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid rgba(201, 165, 116, 0.3)',
                              boxShadow: isPlaying 
                                ? '0 4px 20px rgba(201, 165, 116, 0.4)'
                                : '0 4px 12px rgba(201, 165, 116, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {isPlaying ? (
                              <Pause size={isMobile ? 20 : 24} color="#ffffff" fill="#ffffff" />
                            ) : (
                              <Play size={isMobile ? 20 : 24} color="#c9a574" />
                            )}
                          </button>
                        ) : (
                          <div style={{
                            width: isMobile ? '48px' : '56px',
                            height: isMobile ? '48px' : '56px',
                            borderRadius: isMobile ? '10px' : '12px',
                            background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.25) 0%, rgba(201, 165, 116, 0.1) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid rgba(201, 165, 116, 0.2)',
                            boxShadow: '0 4px 12px rgba(201, 165, 116, 0.1)'
                          }}>
                            <Disc size={isMobile ? 24 : 28} color="#c9a574" />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: isMobile ? '4px' : '6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {trackName}
                          </div>
                          
                          {track.isrc && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: isMobile ? '4px' : '6px',
                              padding: isMobile ? '3px 8px' : '4px 10px',
                              background: 'rgba(201, 165, 116, 0.1)',
                              border: '1px solid rgba(201, 165, 116, 0.2)',
                              borderRadius: '6px',
                              fontSize: isMobile ? '10px' : '12px',
                              fontWeight: '600',
                              color: '#c9a574',
                              fontFamily: 'monospace',
                              letterSpacing: '0.5px'
                            }}>
                              <Globe size={isMobile ? 10 : 12} />
                              {track.isrc}
                            </div>
                          )}
                        </div>

                        {!isMobile && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: hasAudio 
                              ? 'rgba(74, 222, 128, 0.1)'
                              : 'rgba(201, 165, 116, 0.1)',
                            border: hasAudio 
                              ? '1px solid rgba(74, 222, 128, 0.3)'
                              : '1px solid rgba(201, 165, 116, 0.3)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: hasAudio ? '#4ade80' : '#c9a574'
                          }}>
                            {hasAudio ? (
                              <>
                                <Music size={14} />
                                Audio
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Activo
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'Físico':
        const physicalSalesData = JSON.parse(localStorage.getItem('physicalSales') || '[]');
        const myPhysicalSales = physicalSalesData.filter((sale: any) => sale.artistName === data.name);
        const myTotalPhysicalRevenue = myPhysicalSales.reduce((sum: number, sale: any) => sum + (sale.totalRevenue || 0), 0);
        const myTotalPhysicalUnits = myPhysicalSales.reduce((sum: number, sale: any) => sum + (sale.unitsSold || 0), 0);
        
        return (
          <div>
            <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
              Ventas Físicas
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7', marginBottom: isMobile ? '20px' : '32px' }}>
              Tus ventas de discos físicos y merchandising
            </p>
            
            {myPhysicalSales.length > 0 ? (
              <>
                {/* Estadísticas */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: isMobile ? '12px' : '20px',
                  marginBottom: isMobile ? '24px' : '32px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)',
                    borderRadius: '16px',
                    padding: isMobile ? '20px' : '24px',
                    border: '1px solid rgba(201, 165, 116, 0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(201, 165, 116, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Package size={20} color="#c9a574" />
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Total Productos
                      </span>
                    </div>
                    <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700', color: '#c9a574' }}>
                      {myPhysicalSales.length}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(42, 63, 63, 0.4)',
                    borderRadius: '16px',
                    padding: isMobile ? '20px' : '24px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(201, 165, 116, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ShoppingCart size={20} color="#c9a574" />
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Unidades Vendidas
                      </span>
                    </div>
                    <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700', color: '#ffffff' }}>
                      {myTotalPhysicalUnits.toLocaleString('es-ES')}
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(42, 63, 63, 0.4)',
                    borderRadius: '16px',
                    padding: isMobile ? '20px' : '24px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <DollarSign size={20} color="#22c55e" />
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Ingresos Totales
                      </span>
                    </div>
                    <div style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700', color: '#22c55e' }}>
                      €{myTotalPhysicalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Lista de Productos */}
                <div style={{
                  background: 'rgba(42, 63, 63, 0.3)',
                  borderRadius: '16px',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: isMobile ? '16px' : '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                      Mis Productos
                    </h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{
                            padding: isMobile ? '12px' : '16px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: '700',
                            color: '#c9a574',
                            textAlign: 'left',
                            textTransform: 'uppercase'
                          }}>
                            Producto
                          </th>
                          <th style={{
                            padding: isMobile ? '12px' : '16px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: '700',
                            color: '#c9a574',
                            textAlign: 'right',
                            textTransform: 'uppercase'
                          }}>
                            Precio
                          </th>
                          <th style={{
                            padding: isMobile ? '12px' : '16px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: '700',
                            color: '#c9a574',
                            textAlign: 'right',
                            textTransform: 'uppercase'
                          }}>
                            Unidades
                          </th>
                          <th style={{
                            padding: isMobile ? '12px' : '16px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: '700',
                            color: '#c9a574',
                            textAlign: 'right',
                            textTransform: 'uppercase'
                          }}>
                            % Royalty
                          </th>
                          <th style={{
                            padding: isMobile ? '12px' : '16px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                            fontSize: isMobile ? '11px' : '13px',
                            fontWeight: '700',
                            color: '#c9a574',
                            textAlign: 'right',
                            textTransform: 'uppercase'
                          }}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {myPhysicalSales.map((product: any, index: number) => (
                          <tr key={index} style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 165, 116, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: isMobile ? '12px' : '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {product.photo ? (
                                  <img
                                    src={product.photo}
                                    alt={product.name}
                                    style={{
                                      width: '48px',
                                      height: '48px',
                                      borderRadius: '8px',
                                      objectFit: 'cover',
                                      border: '2px solid rgba(201, 165, 116, 0.3)'
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px',
                                    background: 'rgba(201, 165, 116, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid rgba(201, 165, 116, 0.3)'
                                  }}>
                                    {product.type === 'CD' || product.type === 'Vinyl' ? (
                                      <Disc size={20} color="#c9a574" />
                                    ) : product.type === 'T-Shirt' ? (
                                      <Shirt size={20} color="#c9a574" />
                                    ) : (
                                      <Package size={20} color="#c9a574" />
                                    )}
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#ffffff' }}>
                                    {product.name}
                                  </div>
                                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#AFB3B7', marginTop: '2px' }}>
                                    {product.type}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#ffffff', textAlign: 'right' }}>
                              €{product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', color: '#c9a574', fontWeight: '600', textAlign: 'right' }}>
                              {product.unitsSold}
                            </td>
                            <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', color: '#c9a574', fontWeight: '600', textAlign: 'right' }}>
                              {product.royaltyPercentage || 100}%
                            </td>
                            <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', fontWeight: '700', color: '#22c55e', textAlign: 'right' }}>
                              €{product.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '20px',
                padding: isMobile ? '48px 24px' : '80px 48px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}>
                <div style={{
                  width: isMobile ? '80px' : '120px',
                  height: isMobile ? '80px' : '120px',
                  borderRadius: '50%',
                  background: 'rgba(201, 165, 116, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Package size={isMobile ? 40 : 60} color="#c9a574" />
                </div>

                <div>
                  <h2 style={{
                    fontSize: isMobile ? '24px' : '32px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '12px',
                  }}>
                    No hay ventas físicas
                  </h2>
                  <p style={{
                    fontSize: isMobile ? '14px' : '16px',
                    color: '#AFB3B7',
                    lineHeight: '1.6',
                    maxWidth: '500px',
                  }}>
                    Aún no tienes productos físicos registrados. Contacta con el administrador para agregar CDs, vinilos o merchandising.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'Royalties':
        return (
          <div>
            <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
              Mis Royalties
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7', marginBottom: isMobile ? '12px' : '16px' }}>
              Gestiona tus pagos y solicita transferencias
            </p>
            
            {/* Nota informativa de porcentaje */}
            <div style={{
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '10px',
              padding: isMobile ? '10px 14px' : '12px 16px',
              marginBottom: isMobile ? '20px' : '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle size={18} color="#4ade80" />
              <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#4ade80', fontWeight: '600' }}>
                El balance mostrado es tu parte ({royaltyPercentage}%) según tu contrato activo
              </div>
            </div>
            
            {/* Grid: Tarjeta y Formulario */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '420px 1fr',
              gap: isMobile ? '20px' : '24px',
              marginBottom: isMobile ? '20px' : '24px',
              alignItems: 'start'
            }}>
              {/* Tarjeta de Balance */}
              <div style={{
                background: 'linear-gradient(135deg, #1a2f2f 0%, #2a3f3f 25%, #1f3838 50%, #2c4848 75%, #1a2f2f 100%)',
                borderRadius: isMobile ? '16px' : '20px',
                padding: isMobile ? '24px' : '32px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(201, 165, 116, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: isMobile ? 'auto' : '1.586',
                minHeight: isMobile ? '240px' : 'auto',
                border: '1px solid rgba(201, 165, 116, 0.15)'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'linear-gradient(rgba(201, 165, 116, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 165, 116, 0.03) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                  opacity: 0.5
                }} />
                
                <div style={{
                  position: 'absolute',
                  top: '-80px',
                  right: '-80px',
                  width: '250px',
                  height: '250px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(201, 165, 116, 0.15) 0%, transparent 70%)',
                  filter: 'blur(50px)'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: isMobile ? '24px' : '32px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isMobile ? '10px' : '11px',
                        fontWeight: '700',
                        color: 'rgba(201, 165, 116, 0.7)',
                        letterSpacing: isMobile ? '1.5px' : '2px',
                        textTransform: 'uppercase',
                        marginBottom: isMobile ? '4px' : '6px'
                      }}>
                        Cuenta Premium
                      </div>
                      <div style={{
                        fontSize: isMobile ? '14px' : '17px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #c9a574 0%, #e6c79a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '0.5px'
                      }}>
                        BIGARTIST ROYALTIES
                      </div>
                    </div>
                    
                    <div style={{
                      width: isMobile ? '40px' : '48px',
                      height: isMobile ? '32px' : '38px',
                      borderRadius: isMobile ? '6px' : '8px',
                      background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.3) 0%, rgba(201, 165, 116, 0.15) 100%)',
                      border: '1px solid rgba(201, 165, 116, 0.4)',
                      position: 'relative',
                      boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: isMobile ? '6px' : '8px',
                        left: isMobile ? '6px' : '8px',
                        right: isMobile ? '6px' : '8px',
                        bottom: isMobile ? '6px' : '8px',
                        border: '1px solid rgba(201, 165, 116, 0.3)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: isMobile ? '18px' : '24px' }}>
                    <div style={{
                      fontSize: isMobile ? '10px' : '11px',
                      fontWeight: '600',
                      color: 'rgba(201, 165, 116, 0.7)',
                      marginBottom: isMobile ? '6px' : '8px',
                      letterSpacing: isMobile ? '0.8px' : '1px',
                      textTransform: 'uppercase'
                    }}>
                      Balance Disponible
                    </div>
                    <div style={{
                      fontSize: isMobile ? '32px' : '42px',
                      fontWeight: '900',
                      background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: isMobile ? '-1px' : '-1.5px',
                      lineHeight: '1',
                      textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.1))'
                    }}>
                      {formatEuro(totalArtista)}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}>
                    <div>
                      <div style={{
                        fontSize: isMobile ? '9px' : '10px',
                        fontWeight: '700',
                        color: 'rgba(201, 165, 116, 0.5)',
                        marginBottom: isMobile ? '4px' : '6px',
                        letterSpacing: isMobile ? '1px' : '1.5px',
                        textTransform: 'uppercase'
                      }}>
                        Titular de la cuenta
                      </div>
                      <div style={{
                        fontSize: isMobile ? '14px' : '17px',
                        fontWeight: '800',
                        color: '#ffffff',
                        letterSpacing: isMobile ? '1px' : '1.5px',
                        textTransform: 'uppercase',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                      }}>
                        {data.name}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(201, 165, 116, 0.25)',
                        border: '2px solid rgba(201, 165, 116, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Wallet size={18} color="#c9a574" />
                      </div>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(201, 165, 116, 0.35)',
                        border: '2px solid rgba(201, 165, 116, 0.5)',
                        marginLeft: '-16px',
                        backdropFilter: 'blur(10px)'
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de Solicitud de Pago */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(42, 63, 63, 0.4) 100%)',
                border: '2px solid rgba(201, 165, 116, 0.3)',
                borderRadius: '20px',
                padding: isMobile ? '20px' : '32px',
                backdropFilter: 'blur(10px)'
              }}>
                <h2 style={{
                  fontSize: isMobile ? '18px' : '22px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <CreditCard size={24} color="#c9a574" />
                  Solicitar Pago
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: '#AFB3B7',
                  marginBottom: isMobile ? '20px' : '28px'
                }}>
                  Completa tus datos bancarios para recibir el pago
                </p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  
                  try {
                    const today = new Date();
                    const newId = Date.now();
                    const reference = `PAY-${today.getFullYear()}-${newId.toString().slice(-3)}`;
                    
                    const paymentRequest = {
                      id: newId,
                      artistId: data.id,
                      artistName: data.name,
                      artistEmail: data.email,
                      firstName: paymentFormData.firstName,
                      lastName: paymentFormData.lastName,
                      accountHolder: paymentFormData.accountHolder,
                      iban: paymentFormData.iban,
                      amount: parseFloat(paymentFormData.amount),
                      status: 'Pendiente',
                      method: 'Transferencia Bancaria',
                      reference: reference,
                      date: today.toISOString(),
                      createdAt: today.toISOString()
                    };
                    
                    // Guardar en localStorage
                    const existingRequests = JSON.parse(localStorage.getItem('paymentRequests') || '[]');
                    existingRequests.unshift(paymentRequest);
                    localStorage.setItem('paymentRequests', JSON.stringify(existingRequests));
                    
                    // Crear notificación
                    const notification = {
                      id: newId,
                      type: 'payment_request',
                      artistId: data.id,
                      artistName: data.name,
                      amount: parseFloat(paymentFormData.amount),
                      text: `${data.name} ha solicitado un pago de ${parseFloat(paymentFormData.amount).toFixed(2)}€`,
                      time: 'Ahora',
                      read: false,
                      createdAt: today.toISOString()
                    };
                    
                    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                    existingNotifications.unshift(notification);
                    localStorage.setItem('notifications', JSON.stringify(existingNotifications));
                    
                    // Disparar evento personalizado para actualizar la UI
                    window.dispatchEvent(new CustomEvent('paymentRequested', { 
                      detail: paymentRequest 
                    }));
                    
                    // Agregar al historial local
                    const newPayment = {
                      id: newId,
                      date: today.toLocaleDateString('es-ES'),
                      amount: parseFloat(paymentFormData.amount),
                      status: 'Pendiente',
                      method: 'Transferencia Bancaria',
                      reference: reference
                    };
                    
                    setPaymentHistory([newPayment, ...paymentHistory]);
                    
                    // Limpiar formulario
                    setPaymentFormData({
                      firstName: '',
                      lastName: '',
                      accountHolder: '',
                      iban: '',
                      amount: ''
                    });
                    
                    setShowPaymentSuccess(true);
                    
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Error al procesar la solicitud. Por favor, intenta de nuevo.');
                  }
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: isMobile ? '16px' : '20px',
                    marginBottom: isMobile ? '16px' : '20px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#AFB3B7',
                        marginBottom: '8px'
                      }}>
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentFormData.firstName}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, firstName: e.target.value })}
                        placeholder="Introduce tu nombre"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(201, 165, 116, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#AFB3B7',
                        marginBottom: '8px'
                      }}>
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentFormData.lastName}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, lastName: e.target.value })}
                        placeholder="Introduce tus apellidos"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(201, 165, 116, 0.3)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#AFB3B7',
                      marginBottom: '8px'
                    }}>
                      Titular de la Cuenta *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentFormData.accountHolder}
                      readOnly
                      placeholder="Se completará automáticamente"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(201, 165, 116, 0.05)',
                        border: '1px solid rgba(201, 165, 116, 0.3)',
                        borderRadius: '12px',
                        color: '#c9a574',
                        fontSize: '14px',
                        fontWeight: '600',
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'not-allowed'
                      }}
                    />
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Info size={12} />
                      Este campo se completa automáticamente con tu nombre y apellidos
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#AFB3B7',
                      marginBottom: '8px'
                    }}>
                      Número de Cuenta (IBAN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentFormData.iban}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, iban: e.target.value })}
                      placeholder="ES00 0000 0000 0000 0000 0000"
                      maxLength={34}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(201, 165, 116, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        letterSpacing: '1px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
                    gap: '20px',
                    alignItems: 'end'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#AFB3B7',
                        marginBottom: '8px'
                      }}>
                        Importe a Solicitar *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          required
                          value={paymentFormData.amount}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                          min="0"
                          max={data.totalRevenue}
                          step="0.01"
                          placeholder="0.00"
                          style={{
                            width: '100%',
                            padding: '14px 50px 14px 16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(201, 165, 116, 0.3)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            fontSize: '18px',
                            fontWeight: '600',
                            fontFamily: 'inherit',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#c9a574'
                        }}>
                          €
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginTop: '6px'
                      }}>
                        Máximo disponible: <span style={{ color: '#c9a574', fontWeight: '600' }}>{formatEuro(data.totalRevenue)}</span>
                      </div>
                    </div>

                    <div>
                      <button
                      type="submit"
                      style={{
                        padding: '16px 40px',
                        background: 'linear-gradient(135deg, #c9a574 0%, #b8956a 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#0D1F23',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 6px 20px rgba(201, 165, 116, 0.4)',
                        height: '54px',
                        whiteSpace: 'nowrap',
                        width: isMobile ? '100%' : 'auto'
                      }}
                    >
                        <DollarSign size={20} />
                        Solicitar Transferencia
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(96, 165, 250, 0.08)',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    marginTop: '20px'
                  }}>
                    <Info size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px', color: '#AFB3B7', lineHeight: '1.5' }}>
                      Las transferencias se procesan en <span style={{ color: '#60a5fa', fontWeight: '600' }}>2-3 días hábiles</span>. Recibirás una notificación cuando se complete el pago.
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Historial de Pagos */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Calendar size={20} color="#c9a574" />
                Historial de Pagos
              </h2>

              {paymentHistory.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <FileText size={32} color="#c9a574" style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', color: '#AFB3B7', marginBottom: '4px' }}>
                    No hay pagos registrados
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Tus transferencias aparecerán aquí
                  </p>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  overflow: isMobile ? 'auto' : 'hidden'
                }}>
                  {!isMobile && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr 180px 200px 160px',
                      gap: '16px',
                      padding: '16px 20px',
                      background: 'rgba(201, 165, 116, 0.08)',
                      borderBottom: '1px solid rgba(201, 165, 116, 0.15)'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9a574', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Fecha
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9a574', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Referencia
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9a574', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Método
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9a574', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                        Importe
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#c9a574', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                        Estado
                      </div>
                    </div>
                  )}

                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      style={{
                        display: isMobile ? 'block' : 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '140px 1fr 180px 200px 160px',
                        gap: '16px',
                        padding: isMobile ? '16px' : '18px 20px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    >
                      {isMobile ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                              {payment.date}
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#c9a574' }}>
                              {formatEuro(payment.amount)}
                            </div>
                          </div>
                          <div style={{ fontSize: '13px', color: '#AFB3B7', marginBottom: '8px' }}>
                            {payment.reference}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '13px', color: '#AFB3B7' }}>
                              {payment.method}
                            </div>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: payment.status === 'Pendiente' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                              border: payment.status === 'Pendiente' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(74, 222, 128, 0.3)',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: payment.status === 'Pendiente' ? '#fbbf24' : '#4ade80'
                            }}>
                              {payment.status === 'Pendiente' ? <Clock size={14} /> : <CheckCircle size={14} />}
                              {payment.status}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
                            {payment.date}
                          </div>
                          <div style={{ fontSize: '13px', color: '#AFB3B7', fontFamily: 'monospace', fontWeight: '600' }}>
                            {payment.reference}
                          </div>
                          <div style={{ fontSize: '13px', color: '#AFB3B7' }}>
                            {payment.method}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#c9a574', textAlign: 'right' }}>
                            {formatEuro(payment.amount)}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              background: payment.status === 'Pendiente' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                              border: payment.status === 'Pendiente' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(74, 222, 128, 0.3)',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: payment.status === 'Pendiente' ? '#fbbf24' : '#4ade80'
                            }}>
                              {payment.status === 'Pendiente' ? <Clock size={14} /> : <CheckCircle size={14} />}
                              {payment.status}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'Configuración':
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
              Configuración
            </h1>
            <p style={{ fontSize: '14px', color: '#AFB3B7', marginBottom: '32px' }}>
              Gestiona tu cuenta y preferencias
            </p>

            <div style={{
              background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(42, 63, 63, 0.4) 100%)',
              border: '2px solid rgba(201, 165, 116, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(10px)',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Camera size={24} color="#c9a574" />
                Banner del Perfil
              </h2>
              <p style={{ fontSize: '14px', color: '#AFB3B7', marginBottom: '20px' }}>
                Personaliza la imagen de banner de tu portal
              </p>
              
              <div style={{
                width: '100%',
                height: '180px',
                borderRadius: '12px',
                backgroundImage: `url(${bannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                marginBottom: '16px',
                border: '2px solid rgba(201, 165, 116, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                onClick={() => bannerInputRef.current?.click()}>
                  <Camera size={32} color="#ffffff" />
                </div>
              </div>
              
              <button
                onClick={() => bannerInputRef.current?.click()}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #c9a574 0%, #b8956a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#0D1F23',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(201, 165, 116, 0.3)'
                }}
              >
                <Camera size={18} />
                Cambiar Banner
              </button>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                style={{ display: 'none' }}
              />
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(42, 63, 63, 0.4) 100%)',
              border: '2px solid rgba(201, 165, 116, 0.3)',
              borderRadius: '20px',
              padding: '28px',
              backdropFilter: 'blur(10px)',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings size={24} color="#c9a574" />
                Información del Perfil
              </h2>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#AFB3B7', marginBottom: '8px' }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(201, 165, 116, 0.2)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#AFB3B7', marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(201, 165, 116, 0.2)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'Contratos':
        return (
          <div>
            <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
              Mis Contratos
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7', marginBottom: isMobile ? '20px' : '32px' }}>
              Gestiona tus acuerdos y contratos con BIGARTIST ROYALTIES
            </p>

            {contracts.length === 0 ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center'
              }}>
                <FileText size={48} color="#c9a574" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '18px', color: '#AFB3B7', marginBottom: '8px' }}>No hay contratos disponibles</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Tus contratos aparecerán aquí cuando sean procesados</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? '20px' : '32px'
              }}>
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    style={{
                      background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
                      border: contract.status === 'Activo' ? '2px solid rgba(201, 165, 116, 0.4)' : '1px solid rgba(201, 165, 116, 0.2)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '18px' : '24px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#ffffff',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <FileSignature size={20} color="#c9a574" />
                          {contract.contractType}
                        </h3>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: contract.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : contract.status === 'expired' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                          border: contract.status === 'active' ? '1px solid rgba(74, 222, 128, 0.3)' : contract.status === 'expired' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: contract.status === 'active' ? '#4ade80' : contract.status === 'expired' ? '#ef4444' : '#fbbf24',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {contract.status === 'active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {contract.status === 'active' ? 'Activo' : contract.status === 'expired' ? 'Expirado' : 'Pendiente'}
                        </div>
                      </div>
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: '#AFB3B7',
                      lineHeight: '1.6',
                      marginBottom: '20px'
                    }}>
                      Contrato de {contract.contractType} con BIGARTIST ROYALTIES
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: isMobile ? '12px' : '16px',
                      marginBottom: isMobile ? '16px' : '20px',
                      padding: isMobile ? '12px' : '16px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: isMobile ? '10px' : '12px',
                      border: '1px solid rgba(201, 165, 116, 0.1)'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#AFB3B7', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Tipo
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                          {contract.isPhysical ? 'Físico' : 'Digital'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#AFB3B7', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Royalty
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#c9a574' }}>
                          {contract.royaltyPercentage}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#AFB3B7', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Inicio
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                          {new Date(contract.startDate).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#AFB3B7', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Fin
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                          {new Date(contract.endDate).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>

                    {/* Estado del contrato firmado */}
                    {contract.signedAt && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '10px',
                        marginBottom: '12px'
                      }}>
                        <CheckCircle size={16} color="#22c55e" />
                        <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: '600' }}>
                          Firmado el {new Date(contract.signedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      {contract.contractPDF ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContract(contract);
                            setShowPDFViewer(true);
                          }}
                          style={{
                            width: '100%',
                            background: contract.signedAt 
                              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                              : 'linear-gradient(135deg, #c9a574 0%, #b8956a 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 20px',
                            color: contract.signedAt ? '#ffffff' : '#1a1a1a',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: contract.signedAt 
                              ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                              : '0 4px 12px rgba(201, 165, 116, 0.3)'
                          }}
                        >
                          {contract.signedAt ? (
                            <>
                              <Eye size={16} />
                              Ver Contrato Firmado
                            </>
                          ) : (
                            <>
                              <FileSignature size={16} />
                              Ver y Firmar Contrato
                            </>
                          )}
                        </button>
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '10px',
                            color: '#ef4444',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <AlertCircle size={16} />
                          PDF no disponible
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              background: 'rgba(96, 165, 250, 0.08)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              gap: '12px'
            }}>
              <Info size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '13px', color: '#AFB3B7', lineHeight: '1.6' }}>
                <strong style={{ color: '#60a5fa' }}>Información importante:</strong> Todos los contratos son legalmente vinculantes. 
                Si tienes dudas sobre alguna cláusula o necesitas realizar modificaciones, contacta con tu gestor en 
                <span style={{ color: '#c9a574', fontWeight: '600' }}> contacto@bigartist.es</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px', color: '#ffffff' }}>
              {activeTab}
            </h1>
            <div style={{
              background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '16px', color: '#AFB3B7' }}>Sección en construcción</p>
            </div>
          </div>
        );
    }
  };

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
        opacity: 0.25,
        filter: 'blur(0px)',
        zIndex: 0
      }} />

      {/* OVERLAY VERDE GLOBAL */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        backdropFilter: 'blur(2px)',
        opacity: 0.75,
        zIndex: 0
      }} />

      {/* CAPA DE TINTE VERDE GLOBAL */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 32, 39, 0.3)',
        mixBlendMode: 'multiply' as const,
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Banner con menú integrado */}
        <div style={{
          position: 'relative',
          height: isMobile ? '400px' : '570px',
          overflow: 'hidden'
        }}>
          {/* Banner Image Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bannerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {/* Overlays del Banner */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(15, 32, 39, 0.5) 0%, rgba(32, 58, 67, 0.45) 50%, rgba(44, 83, 100, 0.4) 100%)'
            }} />
            
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 32, 39, 0.25)',
              mixBlendMode: 'multiply' as const
            }} />
            
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15, 32, 39, 0.7) 0%, rgba(15, 32, 39, 0.4) 15%, transparent 35%, rgba(15, 32, 39, 0.05) 50%, rgba(15, 32, 39, 0.1) 65%, rgba(15, 32, 39, 0.2) 75%, rgba(15, 32, 39, 0.35) 85%, rgba(15, 32, 39, 0.5) 93%, rgba(15, 32, 39, 0.65) 98%, rgba(15, 32, 39, 0.75) 100%)'
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(15, 32, 39, 0.9) 100%)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Menú superior */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: isMobile ? '12px 20px' : '12px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '16px' : '32px',
            background: 'linear-gradient(180deg, rgba(15, 32, 39, 0.7) 0%, rgba(15, 32, 39, 0.3) 70%, transparent 100%)',
            borderBottom: '1px solid rgba(201, 165, 116, 0.1)'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <img 
                src={logoImage}
                alt="BIGARTIST"
                style={{
                  height: isMobile ? '32px' : '40px',
                  transition: 'all 0.4s ease'
                }}
              />
            </div>

            {/* Tabs del menú */}
            <div style={{ display: isMobile ? 'none' : 'flex', gap: '8px', flex: 1, justifyContent: 'center' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0)',
                      color: isActive ? '#c9a574' : 'rgba(255, 255, 255, 0.6)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap'
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
                      border: '2px solid #1a2332'
                    }} />
                  )}
                </button>

                {/* Notification Panel */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '380px',
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
                        notifications.map((notif) => {
                          const { icon: IconComponent, color } = getNotificationIcon(notif.type);
                          return (
                            <div
                              key={notif.id}
                              style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                background: notif.read ? 'transparent' : 'rgba(201, 165, 116, 0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                              }}
                              onClick={() => markAsRead(notif.id)}
                            >
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: `${color}15`,
                                  border: `1px solid ${color}40`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <IconComponent size={18} color={color} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    marginBottom: '4px'
                                  }}>
                                    {notif.title}
                                  </div>
                                  <div style={{
                                    fontSize: '13px',
                                    color: '#AFB3B7',
                                    marginBottom: '6px',
                                    lineHeight: '1.4'
                                  }}>
                                    {notif.message}
                                  </div>
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#6b7280'
                                  }}>
                                    {notif.time}
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>

                              {!notif.read && (
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '8px',
                                  transform: 'translateY(-50%)',
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#c9a574'
                                }} />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onLogout}
                style={{
                  padding: isMobile ? '8px 12px' : '10px 20px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                <LogOut size={isMobile ? 16 : 18} />
                {!isMobile && 'Salir'}
              </button>
            </div>
          </div>

          {/* Texto de Bienvenida */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: isMobile ? '0 20px 30px 20px' : '0 40px 40px 40px'
          }}>
            <h1 style={{
              fontSize: isMobile ? '28px' : '48px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: isMobile ? '8px' : '12px',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)',
              letterSpacing: '-0.5px',
              margin: 0,
              marginBottom: isMobile ? '8px' : '12px'
            }}>
              Bienvenido, {data.name}
            </h1>
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#AFB3B7',
              fontWeight: '400',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              margin: 0
            }}>
              Resumen de tu actividad y estadísticas
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main style={{
          padding: isMobile ? '20px' : '40px',
          paddingTop: isMobile ? '20px' : '40px',
          paddingBottom: isMobile ? '100px' : '40px',
          maxWidth: '1400px',
          margin: '0 auto',
          minHeight: 'calc(100vh - 80px)'
        }}>
          {renderContent()}
        </main>

        {/* Footer */}
        <footer style={{
          position: 'relative',
          marginTop: isMobile ? '40px' : '60px',
          padding: isMobile ? '20px' : '20px 40px',
          display: isMobile ? 'none' : 'block'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{
                fontSize: '12px',
                color: 'rgba(175, 179, 183, 0.6)'
              }}>
                © 2026 BIGARTIST ROYALTIES. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Notificación de éxito de pago */}
      {showPaymentSuccess && (
        <div style={{
          position: 'fixed',
          top: isMobile ? '16px' : '24px',
          right: isMobile ? '16px' : '24px',
          left: isMobile ? '16px' : 'auto',
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.98) 0%, rgba(30, 47, 47, 0.98) 100%)',
          border: '2px solid #c9a574',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '16px 18px' : '20px 24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(201, 165, 116, 0.3)',
          zIndex: 10000,
          minWidth: isMobile ? 'auto' : '400px',
          backdropFilter: 'blur(10px)',
          animation: 'slideInRight 0.4s ease-out'
        }}>
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(400px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            @keyframes progressBar {
              from {
                transform: scaleX(1);
              }
              to {
                transform: scaleX(0);
              }
            }
          `}</style>
          
          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={24} color="#fbbf24" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Solicitud Enviada
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Pendiente
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#AFB3B7',
                lineHeight: '1.5'
              }}>
                Tu solicitud de pago ha sido enviada correctamente. Se procesará en 2-3 días hábiles.
              </div>
            </div>

            <button
              onClick={() => setShowPaymentSuccess(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#AFB3B7',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{
            marginTop: '16px',
            height: '3px',
            background: 'rgba(201, 165, 116, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #c9a574 0%, #b8956a 100%)',
              animation: 'progressBar 4s linear',
              transformOrigin: 'left'
            }} />
          </div>
        </div>
      )}

      {/* Bottom Navigation Móvil */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, rgba(26, 47, 47, 0.98) 0%, rgba(30, 47, 47, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '2px solid rgba(201, 165, 116, 0.3)',
          padding: '12px 0 8px',
          zIndex: 9999,
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '0 8px'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    border: 'none',
                    background: isActive ? 'rgba(201, 165, 116, 0.15)' : 'transparent',
                    borderRadius: '12px',
                    color: isActive ? '#c9a574' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '64px'
                  }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span style={{
                    fontSize: '10px',
                    fontWeight: isActive ? '700' : '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    {tab.name === 'Mi Catálogo' ? 'Catálogo' : tab.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Elemento de audio oculto para reproducción */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Visor de PDF del contrato */}
      <ContractPDFViewer
        isOpen={showPDFViewer}
        onClose={() => {
          setShowPDFViewer(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
        onSign={handleSignContract}
      />
    </div>
  );
}
