import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Download, Filter, Calendar, Eye, FileText, Clock, ChevronDown, TrendingDown, Check, X, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { IncomeSection } from './IncomeSection';
import { ExpensesSection } from './ExpensesSection';
import { PhysicalSalesSection } from './PhysicalSalesSection';
import { toast } from 'sonner@2.0.3';

interface FinancesPanelProps {
  dashboardData: any;
  artists: any[];
  uploadedFiles?: any[];
  paymentRequests?: any[];
  setPaymentRequests?: (requests: any[]) => void;
  notifications?: any[];
  setNotifications?: (notifications: any[]) => void;
}

export function FinancesPanel({ dashboardData, artists, paymentRequests = [], setPaymentRequests, notifications = [], setNotifications }: FinancesPanelProps) {
  // Normalizar paymentRequests para asegurar que tienen los campos correctos
  const normalizedPaymentRequests = paymentRequests.map((req: any) => ({
    ...req,
    artistName: req.artistName || req.artist_name || 'Artista',
    artistPhoto: req.artistPhoto || req.artist_photo || null,
    firstName: req.firstName || req.first_name || '',
    lastName: req.lastName || req.last_name || '',
    accountHolder: req.accountHolder || req.account_holder || '',
    iban: req.iban || req.IBAN || '',
    date: req.date || req.createdAt || new Date().toISOString(), // ✅ Normalizar fecha
    status: req.status === 'Pendiente' ? 'pending' : req.status, // ✅ Normalizar status
    artistId: req.artistId || req.artist_id || 0,
    artistEmail: req.artistEmail || req.artist_email || ''
  }));
  
  const [financesTab, setFinancesTab] = useState('overview');
  const [reportPeriod, setReportPeriod] = useState('monthly'); // monthly, quarterly, yearly
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Establecer el año por defecto al año más reciente del CSV
  useEffect(() => {
    if (dashboardData.monthlyData && dashboardData.monthlyData.length > 0) {
      const years = new Set<number>();
      dashboardData.monthlyData.forEach((data: any) => {
        const match = data.month.match(/^(\d{4})M/);
        if (match) {
          years.add(parseInt(match[1]));
        }
      });
      if (years.size > 0) {
        const maxYear = Math.max(...Array.from(years));
        setReportYear(maxYear);
      }
    }
  }, [dashboardData.monthlyData]);

  // Cargar contratos reales y royalties desde localStorage
  const realContracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  const royaltiesData = JSON.parse(localStorage.getItem('royaltiesData') || '[]');
  
  // Enriquecer artistas con sus ingresos del CSV
  const artistsWithRevenue = artists.map((artist) => {
    const artistRoyalty = royaltiesData.find((r: any) => r.artistName === artist.name);
    return {
      ...artist,
      totalRevenue: artistRoyalty?.totalRevenue || 0
    };
  });
  
  // Mapear contratos a formato compatible con el código existente
  const contracts = artistsWithRevenue.map((artist) => {
    const artistContract = realContracts.find((c: any) => 
      c.artistName === artist.name && c.status === 'active'
    );
    
    return {
      id: artist.id,
      artistId: artist.id,
      percentage: artistContract?.royaltyPercentage || 50,
    };
  });

  // Filtrar solicitudes pendientes
  const pendingRequests = normalizedPaymentRequests.filter(req => req.status === 'pending');

  // Calcular totales reales para reportes
  const totalArtistRevenue = artistsWithRevenue.reduce((sum, artist) => {
    const contract = realContracts.find((c: any) => c.artistName === artist.name && c.status === 'active');
    const percentage = contract?.royaltyPercentage || 70;
    return sum + (artist.totalRevenue * (percentage / 100));
  }, 0);

  const totalLabelShare = artistsWithRevenue.reduce((sum, artist) => {
    const contract = realContracts.find((c: any) => c.artistName === artist.name && c.status === 'active');
    const percentage = contract?.royaltyPercentage || 70;
    return sum + (artist.totalRevenue * ((100 - percentage) / 100));
  }, 0);

  // Cargar gastos reales
  const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);

  // Extraer años disponibles desde los datos del CSV
  const availableYears = new Set<number>();
  if (dashboardData.monthlyData && dashboardData.monthlyData.length > 0) {
    dashboardData.monthlyData.forEach((data: any) => {
      // Parsear el formato "2017M01", "2018M06", etc.
      const match = data.month.match(/^(\d{4})M/);
      if (match) {
        availableYears.add(parseInt(match[1]));
      }
    });
  }
  // Si no hay datos, agregar año actual
  if (availableYears.size === 0) {
    availableYears.add(new Date().getFullYear());
  }
  const sortedYears = Array.from(availableYears).sort((a, b) => b - a); // Descendente

  // Datos para gráfico lineal - Periodos reales del CSV
  const csvLineData = dashboardData.monthlyData.length > 0 
    ? dashboardData.monthlyData.map((data: any) => ({
        mes: data.month,
        revenue: data.revenue,
        streams: data.streams
      }))
    : [];

  return (
    <div style={{ paddingLeft: isMobile ? '16px' : '24px', paddingRight: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
        <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
          Finanzas y Reportes
        </h1>
        <p style={{ fontSize: isMobile ? '13px' : '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
          Gestiona y analiza los ingresos, gastos y reportes financieros
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        marginBottom: isMobile ? '24px' : '36px',
        borderBottom: '2px solid rgba(201, 165, 116, 0.2)',
        paddingBottom: '0',
        flexWrap: 'wrap',
        overflowX: isMobile ? 'auto' : 'visible'
      }}>
        {[
          { id: 'overview', label: 'Resumen General', icon: Wallet },
          { id: 'income', label: 'Ingresos', icon: ArrowUpRight },
          { id: 'expenses', label: 'Gastos', icon: ArrowDownRight },
          { id: 'physical', label: 'Ventas Físico', icon: Package },
          { id: 'requests', label: 'Solicitudes', icon: DollarSign, badge: pendingRequests.length },
          { id: 'reports', label: 'Reportes', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = financesTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFinancesTab(tab.id)}
              style={{
                padding: isMobile ? '10px 14px' : '12px 20px',
                background: isActive ? 'rgba(201, 165, 116, 0.1)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #c9a574' : '2px solid transparent',
                color: isActive ? '#c9a574' : '#AFB3B7',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '6px' : '8px',
                transition: 'all 0.3s ease',
                marginBottom: '-2px',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = '#AFB3B7';
              }}
            >
              <Icon size={isMobile ? 14 : 16} />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <>
                  <style>
                    {`
                      @keyframes badgePulse {
                        0%, 100% {
                          box-shadow: 0 0 10px rgba(201, 165, 116, 0.4);
                          transform: scale(1);
                        }
                        50% {
                          box-shadow: 0 0 20px rgba(201, 165, 116, 0.8);
                          transform: scale(1.05);
                        }
                      }
                    `}
                  </style>
                  <span style={{
                    background: '#c9a574',
                    color: '#2a3f3f',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center',
                    animation: 'badgePulse 2s ease-in-out infinite'
                  }}>
                    {tab.badge}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ padding: '0' }}>
        {/* Overview Tab Content */}
        {financesTab === 'overview' && (
          <>
        {/* Header Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '430px 1fr',
          gap: isMobile ? '12px' : '16px',
          marginBottom: isMobile ? '20px' : '32px',
          padding: '0',
          width: '100%'
        }}>
          {/* Main Welcome Card */}
          <div style={{
            background: 'rgba(42, 63, 63, 0.3)',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '20px 24px' : '28px 32px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(201, 165, 116, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              lineHeight: '1.3'
            }}>
              Hola, aquí está el resumen
              <br />
              de tus royalties.
            </h2>
            
            {/* Mini bar chart */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
              height: isMobile ? '50px' : '60px',
              marginTop: isMobile ? '16px' : '20px',
              marginBottom: isMobile ? '16px' : '24px'
            }}>
              {csvLineData.slice(-6).map((data: any, index: number) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '100%',
                    backgroundColor: index === csvLineData.slice(-6).length - 1 ? '#c9a574' : 'rgba(201, 165, 116, 0.3)',
                    height: `${Math.max(20, (data.revenue / Math.max(...csvLineData.map((d: any) => d.revenue))) * (isMobile ? 50 : 60))}px`,
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{
                    fontSize: isMobile ? '9px' : '10px',
                    color: index === csvLineData.slice(-6).length - 1 ? '#c9a574' : 'rgba(255, 255, 255, 0.5)',
                    fontWeight: index === csvLineData.slice(-6).length - 1 ? '600' : '400'
                  }}>
                    {data.mes.substring(0, 3)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: isMobile ? '12px' : '16px' }}>
              <p style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '8px' }}>
                Este mes tus artistas han generado
              </p>
              <div style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: '700', color: '#c9a574' }}>
                €{dashboardData.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Stats Card with Multiple Metrics */}
          <div style={{
            background: 'rgba(42, 63, 63, 0.6)',
            borderRadius: isMobile ? '12px' : '20px',
            padding: isMobile ? '20px 24px' : '32px',
            border: '1px solid rgba(201, 165, 116, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '20px' : '28px',
            height: isMobile ? 'auto' : '427px'
          }}>
            {/* Average Revenue per Artist - Más oscuro arriba */}
            <div style={{ position: 'relative', zIndex: 1, minHeight: isMobile ? '80px' : '100px' }}>
              {/* Gráfico de barras difuminado dentro de Beneficios de BAM */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.25,
                pointerEvents: 'none',
                zIndex: 0,
                minHeight: isMobile ? '80px' : '100px'
              }}>
                <ResponsiveContainer width="100%" height={isMobile ? 80 : 100}>
                  <BarChart
                    data={[
                      { value: 45 },
                      { value: 52 },
                      { value: 38 },
                      { value: 65 },
                      { value: 48 },
                      { value: 72 },
                      { value: 58 },
                      { value: 68 }
                    ]}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Bar 
                      dataKey="value" 
                      fill="url(#bamBarGradientFinances)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="bamBarGradientFinances" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a574" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#c9a574" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '8px', fontWeight: '600', position: 'relative', zIndex: 2 }}>
                Beneficios de Bam
              </p>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#c9a574', marginBottom: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.3)', position: 'relative', zIndex: 2 }}>
                €{artistsWithRevenue.reduce((sum, artist) => {
                  const contract = contracts.find(c => c.artistId === artist.id);
                  const bamPercentage = contract ? (100 - contract.percentage) / 100 : 0.30;
                  return sum + ((artist.totalRevenue || 0) * bamPercentage);
                }, 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(201, 165, 116, 0.15)', position: 'relative', zIndex: 1 }} />

            {/* Total Streams - Más gris abajo */}
            <div style={{ position: 'relative', zIndex: 1, minHeight: isMobile ? '80px' : '100px' }}>
              {/* Gráfico de barras difuminado dentro de Beneficios de Artistas */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.15,
                pointerEvents: 'none',
                zIndex: 0,
                minHeight: isMobile ? '80px' : '100px'
              }}>
                <ResponsiveContainer width="100%" height={isMobile ? 80 : 100}>
                  <BarChart
                    data={[
                      { value: 35 },
                      { value: 42 },
                      { value: 28 },
                      { value: 55 },
                      { value: 38 },
                      { value: 62 },
                      { value: 48 },
                      { value: 58 }
                    ]}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Bar 
                      dataKey="value" 
                      fill="url(#artistBarGradientFinances)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="artistBarGradientFinances" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontWeight: '400', position: 'relative', zIndex: 2 }}>
                Beneficio de Artistas
              </p>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: 'rgba(201, 165, 116, 0.7)', marginBottom: '4px', position: 'relative', zIndex: 2 }}>
                €{artistsWithRevenue.reduce((sum, artist) => {
                  const contract = contracts.find(c => c.artistId === artist.id);
                  const artistPercentage = contract ? contract.percentage / 100 : 0.70;
                  return sum + ((artist.totalRevenue || 0) * artistPercentage);
                }, 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fila */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 380px 295px',
          gap: isMobile ? '12px' : '16px',
          width: '100%'
        }}>
          {/* Columna izquierda: Información Adicional y Nueva Sección */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '8px'
          }}>
            {/* Caja de Información Adicional */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px 20px' : '20px 32px',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              backdropFilter: 'blur(10px)',
              width: '100%',
              height: isMobile ? 'auto' : '205px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: isMobile ? '12px' : '16px'
              }}>
                Artistas Pendientes de Solicitud
              </h3>
              {pendingRequests.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '10px' : '8px',
                  overflowY: 'auto',
                  maxHeight: isMobile ? '300px' : '140px'
                }}>
                  {pendingRequests.map((request: any) => (
                    <div key={request.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: isMobile ? '10px' : '8px 12px',
                      background: 'rgba(201, 165, 116, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(201, 165, 116, 0.15)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: isMobile ? '36px' : '32px',
                          height: isMobile ? '36px' : '32px',
                          borderRadius: '50%',
                          background: request.artistPhoto ? `url(${request.artistPhoto})` : '#c9a574',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#2a3f3f'
                        }}>
                          {!request.artistPhoto && request.artistName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{
                          fontSize: isMobile ? '15px' : '14px',
                          fontWeight: '500',
                          color: '#ffffff'
                        }}>
                          {request.artistName}
                        </span>
                      </div>
                      <span style={{
                        fontSize: isMobile ? '15px' : '14px',
                        fontWeight: '600',
                        color: '#c9a574'
                      }}>
                        €{request.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{
                  fontSize: isMobile ? '13px' : '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textAlign: 'center',
                  marginTop: isMobile ? '20px' : '32px'
                }}>
                  No hay solicitudes pendientes
                </p>
              )}
            </div>

            {/* Nueva Sección - Ventas del Último Año */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px 20px' : '20px 32px',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              backdropFilter: 'blur(10px)',
              width: '100%',
              height: isMobile ? 'auto' : '418px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              minHeight: isMobile ? '200px' : '418px'
            }}>
              <TrendingUp size={isMobile ? 48 : 64} color="#c9a574" style={{ opacity: 0.3, marginBottom: isMobile ? '12px' : '16px' }} />
              <h3 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: isMobile ? '6px' : '8px'
              }}>
                Ventas del Último Año
              </h3>
              <p style={{
                fontSize: isMobile ? '13px' : '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: '300px'
              }}>
                No hay datos disponibles para mostrar
              </p>
            </div>
          </div>

          {/* Columna central: Caja 1, Caja 2 y Caja 3 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Caja 1 - Solicitudes de Royalties */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '16px 20px',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              backdropFilter: 'blur(10px)',
              width: '100%',
              height: isMobile ? 'auto' : '205px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h4 style={{
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '10px'
              }}>
                Solicitudes de Royalties
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '10px' : '8px',
                overflowY: 'auto',
                flex: 1
              }}>
                {pendingRequests.length > 0 ? (
                  pendingRequests.slice(0, 3).map((request: any) => {
                    let timeAgo = 'Hace un momento';
                    try {
                      const requestDate = new Date(request.date);
                      if (!isNaN(requestDate.getTime())) {
                        const now = new Date();
                        const diffHours = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60));
                        timeAgo = diffHours < 1 ? 'Hace un momento' : diffHours < 24 ? `Hace ${diffHours}h` : `Hace ${Math.floor(diffHours / 24)}d`;
                      }
                    } catch (error) {
                      // Mantener el valor por defecto
                    }
                    
                    return (
                      <div key={request.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: isMobile ? '12px' : '10px 12px',
                        background: 'rgba(201, 165, 116, 0.1)',
                        borderRadius: '10px',
                        border: '1px solid rgba(201, 165, 116, 0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <div style={{
                            width: isMobile ? '38px' : '34px',
                            height: isMobile ? '38px' : '34px',
                            borderRadius: '50%',
                            background: request.artistPhoto ? `url(${request.artistPhoto})` : '#c9a574',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#2a3f3f',
                            flexShrink: 0
                          }}>
                            {!request.artistPhoto && request.artistName.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: isMobile ? '15px' : '14px',
                              fontWeight: '600',
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {request.artistName}
                            </div>
                            <div style={{
                              fontSize: isMobile ? '12px' : '11px',
                              color: 'rgba(255, 255, 255, 0.5)',
                              marginTop: '2px'
                            }}>
                              {timeAgo}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          fontSize: isMobile ? '14px' : '13px',
                          fontWeight: '700',
                          color: '#c9a574',
                          whiteSpace: 'nowrap',
                          marginLeft: '12px'
                        }}>
                          €{request.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: isMobile ? '12px' : '13px',
                    textAlign: 'center',
                    minHeight: isMobile ? '80px' : 'auto'
                  }}>
                    No hay solicitudes
                  </div>
                )}
              </div>
            </div>

            {/* Caja 2 - Transferencias */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              backdropFilter: 'blur(10px)',
              width: '100%',
              height: isMobile ? 'auto' : '205px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px'
              }}>
                {/* Icono */}
                <div style={{
                  width: isMobile ? '44px' : '50px',
                  height: isMobile ? '44px' : '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.2), rgba(201, 165, 116, 0.1))',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ArrowUpRight style={{
                    width: isMobile ? '22px' : '26px',
                    height: isMobile ? '22px' : '26px',
                    color: '#c9a574'
                  }} />
                </div>

                {/* Contenido */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flex: 1
                }}>
                  <h4 style={{
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Transferencias Realizadas
                  </h4>
                  <div style={{
                    fontSize: isMobile ? '28px' : '32px',
                    fontWeight: '700',
                    color: '#ffffff',
                    lineHeight: '1',
                    marginTop: '2px'
                  }}>
                    {paymentRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <p style={{
                    fontSize: isMobile ? '10px' : '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: '2px'
                  }}>
                    Solicitudes completadas
                  </p>
                </div>
              </div>
            </div>

            {/* Caja 3 - Royalties Pendientes */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              backdropFilter: 'blur(10px)',
              width: '100%',
              height: isMobile ? 'auto' : '205px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px'
              }}>
                {/* Icono */}
                <div style={{
                  width: isMobile ? '44px' : '50px',
                  height: isMobile ? '44px' : '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1))',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock style={{
                    width: isMobile ? '22px' : '26px',
                    height: isMobile ? '22px' : '26px',
                    color: '#fbbf24'
                  }} />
                </div>

                {/* Contenido */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flex: 1
                }}>
                  <h4 style={{
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Royalties Pendientes
                  </h4>
                  <div style={{
                    fontSize: isMobile ? '28px' : '32px',
                    fontWeight: '700',
                    color: '#ffffff',
                    lineHeight: '1',
                    marginTop: '2px'
                  }}>
                    €{pendingRequests.reduce((sum, req) => sum + req.amount, 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p style={{
                    fontSize: isMobile ? '10px' : '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: '2px'
                  }}>
                    Solicitudes pendientes de pago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Caja 4 - Gross Profit */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '12px' : '8px'
          }}>
            {/* Caja 4 - Gross Profit (Tarjeta Vertical) */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '20px',
              border: '2px solid rgba(42, 63, 63, 0.6)',
              width: '100%',
              height: isMobile ? 'auto' : '427px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(42, 63, 63, 0.3)'
            }}>
              {/* Decoración de fondo */}
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                right: '-30px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.05)',
                pointerEvents: 'none'
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Icono */}
                <div style={{
                  width: isMobile ? '44px' : '48px',
                  height: isMobile ? '44px' : '48px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <TrendingUp style={{
                    width: isMobile ? '20px' : '24px',
                    height: isMobile ? '20px' : '24px',
                    color: '#5a8a8a'
                  }} />
                </div>

                {/* Contenido */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flex: 1
                }}>
                  <h4 style={{
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Gross Profit
                  </h4>
                  <div style={{
                    fontSize: isMobile ? '28px' : '32px',
                    fontWeight: '700',
                    color: '#c9a574',
                    lineHeight: '1',
                    marginTop: '2px'
                  }}>
                    €{artistsWithRevenue.reduce((sum, artist) => {
                      const contract = contracts.find(c => c.artistId === artist.id);
                      const bamPercentage = contract ? (100 - contract.percentage) / 100 : 0.30;
                      return sum + ((artist.totalRevenue || 0) * bamPercentage);
                    }, 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p style={{
                    fontSize: isMobile ? '10px' : '11px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginTop: '2px'
                  }}>
                    Ingresos BAM según contratos
                  </p>
                </div>
              </div>
            </div>

            {/* Caja 5 - Net Profit */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '20px',
              border: '2px solid rgba(42, 63, 63, 0.6)',
              width: '100%',
              height: isMobile ? 'auto' : '205px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(42, 63, 63, 0.3)'
            }}>
              {/* Decoración de fondo */}
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                right: '-30px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.05)',
                pointerEvents: 'none'
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '12px' : '16px',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Icono */}
                <div style={{
                  width: isMobile ? '44px' : '48px',
                  height: isMobile ? '44px' : '48px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <DollarSign style={{
                    width: isMobile ? '20px' : '24px',
                    height: isMobile ? '20px' : '24px',
                    color: '#5a8a8a'
                  }} />
                </div>

                {/* Contenido */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flex: 1
                }}>
                  <h4 style={{
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Net Profit
                  </h4>
                  <div style={{
                    fontSize: isMobile ? '28px' : '32px',
                    fontWeight: '700',
                    color: '#c9a574',
                    lineHeight: '1',
                    marginTop: '2px'
                  }}>
                    €{(artistsWithRevenue.reduce((sum, artist) => {
                      const contract = contracts.find(c => c.artistId === artist.id);
                      const bamPercentage = contract ? (100 - contract.percentage) / 100 : 0.30;
                      return sum + ((artist.totalRevenue || 0) * bamPercentage);
                    }, 0) * 0.85).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p style={{
                    fontSize: isMobile ? '10px' : '11px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginTop: '2px'
                  }}>
                    Después de gastos operativos (15%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {/* Income Tab Content */}
        {financesTab === 'income' && (
          <IncomeSection dashboardData={dashboardData} artists={artistsWithRevenue} isMobile={isMobile} />
        )}

        {/* Expenses Tab Content */}
        {financesTab === 'expenses' && (
          <ExpensesSection dashboardData={dashboardData} artists={artistsWithRevenue} isMobile={isMobile} />
        )}

        {/* Physical Sales Tab Content */}
        {financesTab === 'physical' && (
          <PhysicalSalesSection artists={artistsWithRevenue} isMobile={isMobile} />
        )}

        {/* Reports Tab Content */}
        {financesTab === 'reports' && (
          <div style={{ padding: '0' }}>
            {/* Filtros y Header */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              marginBottom: isMobile ? '16px' : '24px',
              gap: isMobile ? '12px' : '16px'
            }}>
              {/* Filtros de Período */}
              <div style={{
                display: 'flex',
                gap: isMobile ? '8px' : '12px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '8px',
                  padding: isMobile ? '8px 12px' : '10px 16px',
                  background: 'rgba(42, 63, 63, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.2)'
                }}>
                  <Filter size={isMobile ? 14 : 16} color="#c9a574" />
                  <span style={{ fontSize: isMobile ? '12px' : '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
                    Período:
                  </span>
                  <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#c9a574',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="monthly" style={{ background: '#2a3f3f' }}>Mensual</option>
                    <option value="quarterly" style={{ background: '#2a3f3f' }}>Trimestral</option>
                    <option value="yearly" style={{ background: '#2a3f3f' }}>Anual</option>
                  </select>
                  <ChevronDown size={isMobile ? 12 : 14} color="#c9a574" />
                </div>

                {reportPeriod === 'monthly' && (
                  <div style={{
                    display: 'flex',
                    gap: isMobile ? '6px' : '8px'
                  }}>
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(Number(e.target.value))}
                      style={{
                        padding: isMobile ? '8px 10px' : '10px 14px',
                        background: 'rgba(42, 63, 63, 0.4)',
                        border: '1px solid rgba(201, 165, 116, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => (
                        <option key={idx} value={idx} style={{ background: '#2a3f3f' }}>{month}</option>
                      ))}
                    </select>
                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(Number(e.target.value))}
                      style={{
                        padding: isMobile ? '8px 10px' : '10px 14px',
                        background: 'rgba(42, 63, 63, 0.4)',
                        border: '1px solid rgba(201, 165, 116, 0.2)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: isMobile ? '12px' : '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {sortedYears.map(year => (
                        <option key={year} value={year} style={{ background: '#2a3f3f' }}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Botón de Generar Reporte */}
              <button
                onClick={() => {
                  alert('Reporte generado exitosamente. En producción se descargaría un PDF.');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isMobile ? '6px' : '8px',
                  padding: isMobile ? '10px 18px' : '12px 24px',
                  background: 'linear-gradient(135deg, #c9a574 0%, #b8935d 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#2a3f3f',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 165, 116, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.3)';
                }}
              >
                <Download size={isMobile ? 16 : 18} />
                Descargar Reporte
              </button>
            </div>

            {/* Tarjetas de Resumen */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: isMobile ? '12px' : '16px',
              marginBottom: isMobile ? '20px' : '32px'
            }}>
              {/* Card 1: Ingresos del Período */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '18px' : '24px',
                border: '1px solid rgba(201, 165, 116, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '36px' : '40px',
                    height: isMobile ? '36px' : '40px',
                    borderRadius: '12px',
                    background: 'rgba(201, 165, 116, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp size={isMobile ? 18 : 20} color="#c9a574" />
                  </div>
                  <span style={{
                    fontSize: isMobile ? '11px' : '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Ingresos
                  </span>
                </div>
                <div style={{
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: '700',
                  color: '#c9a574',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  €{dashboardData.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Total de ingresos generados
                </div>
              </div>

              {/* Card 2: BAM Comisión */}
              <div style={{
                background: 'rgba(42, 63, 63, 0.4)',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '18px' : '24px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '36px' : '40px',
                    height: isMobile ? '36px' : '40px',
                    borderRadius: '12px',
                    background: 'rgba(201, 165, 116, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DollarSign size={isMobile ? 18 : 20} color="#c9a574" />
                  </div>
                  <span style={{
                    fontSize: isMobile ? '11px' : '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    BAM Share
                  </span>
                </div>
                <div style={{
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  €{totalLabelShare.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Comisión de gestión
                </div>
              </div>

              {/* Card 3: Artistas Pagos */}
              <div style={{
                background: 'rgba(42, 63, 63, 0.4)',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '18px' : '24px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '36px' : '40px',
                    height: isMobile ? '36px' : '40px',
                    borderRadius: '12px',
                    background: 'rgba(201, 165, 116, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ArrowUpRight size={isMobile ? 18 : 20} color="#c9a574" />
                  </div>
                  <span style={{
                    fontSize: isMobile ? '11px' : '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Artistas Share
                  </span>
                </div>
                <div style={{
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  €{totalArtistRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Total pagado a artistas
                </div>
              </div>

              {/* Card 4: Gastos */}
              <div style={{
                background: 'rgba(42, 63, 63, 0.4)',
                borderRadius: isMobile ? '12px' : '16px',
                padding: isMobile ? '18px' : '24px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '12px',
                  marginBottom: isMobile ? '12px' : '16px'
                }}>
                  <div style={{
                    width: isMobile ? '36px' : '40px',
                    height: isMobile ? '36px' : '40px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ArrowDownRight size={isMobile ? 18 : 20} color="#ef4444" />
                  </div>
                  <span style={{
                    fontSize: isMobile ? '11px' : '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Gastos
                  </span>
                </div>
                <div style={{
                  fontSize: isMobile ? '24px' : '28px',
                  fontWeight: '700',
                  color: '#ef4444',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  €{totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  Operativos y distribución
                </div>
              </div>
            </div>

            {/* Gráfico Comparativo */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '28px',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              marginBottom: isMobile ? '20px' : '32px'
            }}>
              <h3 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: isMobile ? '16px' : '24px'
              }}>
                Comparativa Ingresos vs Gastos
              </h3>
              {dashboardData.totalRevenue > 0 || totalExpenses > 0 ? (
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <BarChart data={[
                    { 
                      name: 'Financiero', 
                      Ingresos: dashboardData.totalRevenue, 
                      Gastos: totalExpenses,
                      BAMShare: totalLabelShare,
                      ArtistasShare: totalArtistRevenue
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="#AFB3B7" />
                    <YAxis stroke="#AFB3B7" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(42, 63, 63, 0.95)', 
                        border: '1px solid rgba(201, 165, 116, 0.3)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => `€${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                    />
                    <Bar dataKey="Ingresos" fill="#c9a574" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="BAMShare" fill="#8b7355" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="ArtistasShare" fill="#a68968" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Gastos" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  padding: isMobile ? '40px 16px' : '60px 24px', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isMobile ? '200px' : '250px'
                }}>
                  <TrendingUp size={isMobile ? 48 : 64} color="#c9a574" style={{ opacity: 0.3, marginBottom: '16px' }} />
                  <h4 style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    No hay datos disponibles
                  </h4>
                  <p style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    La comparativa se mostrará cuando haya datos de ingresos y gastos registrados
                  </p>
                </div>
              )}
            </div>

            {/* Lista de Reportes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '20px' : '24px'
            }}>
              {/* Reportes de Digital */}
              <div style={{
                background: 'rgba(42, 63, 63, 0.3)',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: isMobile ? '16px' : '24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: 0
                  }}>
                    Reportes de Digital
                  </h3>
                </div>
                {dashboardData.totalRevenue > 0 ? (
                  <div style={{ padding: isMobile ? '16px' : '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: isMobile ? '10px' : '12px',
                        background: 'rgba(201, 165, 116, 0.1)',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7' }}>Total Streams</span>
                        <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#c9a574' }}>
                          {dashboardData.totalStreams.toLocaleString('es-ES')}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: isMobile ? '10px' : '12px',
                        background: 'rgba(201, 165, 116, 0.1)',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7' }}>Ingresos Digitales</span>
                        <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#22c55e' }}>
                          €{dashboardData.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: isMobile ? '10px' : '12px',
                        background: 'rgba(201, 165, 116, 0.1)',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7' }}>Plataformas Activas</span>
                        <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#ffffff' }}>
                          {Object.keys(dashboardData.platformRevenue || {}).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: isMobile ? '40px 16px' : '60px 24px', textAlign: 'center' }}>
                    <FileText size={isMobile ? 48 : 64} color="#c9a574" style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                    <h3 style={{
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      No hay reportes de digital
                    </h3>
                    <p style={{
                      fontSize: isMobile ? '13px' : '14px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      maxWidth: '300px',
                      margin: '0 auto'
                    }}>
                      Los reportes de streaming y plataformas digitales aparecerán aquí
                    </p>
                  </div>
                )}
              </div>

              {/* Ventas de Físico */}
              <div style={{
                background: 'rgba(42, 63, 63, 0.3)',
                borderRadius: isMobile ? '12px' : '16px',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: isMobile ? '16px' : '24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: 0
                  }}>
                    Ventas de Físico
                  </h3>
                </div>
                {(() => {
                  const physicalSales = JSON.parse(localStorage.getItem('physicalSales') || '[]');
                  const totalPhysical = physicalSales.reduce((sum: number, sale: any) => sum + (sale.totalRevenue || 0), 0);
                  const totalUnits = physicalSales.reduce((sum: number, sale: any) => sum + (sale.unitsSold || 0), 0);
                  
                  return totalPhysical > 0 ? (
                    <div style={{ padding: isMobile ? '16px' : '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: isMobile ? '10px' : '12px',
                          background: 'rgba(201, 165, 116, 0.1)',
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7' }}>Total Unidades</span>
                          <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#c9a574' }}>
                            {totalUnits.toLocaleString('es-ES')}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: isMobile ? '10px' : '12px',
                          background: 'rgba(201, 165, 116, 0.1)',
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7' }}>Ingresos por Físico</span>
                          <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#22c55e' }}>
                            €{totalPhysical.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: isMobile ? '10px' : '12px',
                          background: 'rgba(201, 165, 116, 0.1)',
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7' }}>Productos</span>
                          <span style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', color: '#ffffff' }}>
                            {physicalSales.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: isMobile ? '40px 16px' : '60px 24px', textAlign: 'center' }}>
                      <FileText size={isMobile ? 48 : 64} color="#c9a574" style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                      <h3 style={{
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '8px'
                      }}>
                        No hay ventas de físico
                      </h3>
                      <p style={{
                        fontSize: isMobile ? '13px' : '14px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxWidth: '300px',
                        margin: '0 auto'
                      }}>
                        Las ventas de CDs, vinilos y merchandising aparecerán aquí
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Solicitudes Tab Content */}
        {financesTab === 'requests' && (
          <div>
            {/* Header */}
            <div style={{
              background: 'rgba(42, 63, 63, 0.3)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '24px',
              border: '1px solid rgba(201, 165, 116, 0.2)',
              marginBottom: isMobile ? '16px' : '24px'
            }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '16px' : '0' }}>
                <div>
                  <h2 style={{
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    Solicitudes de Pago
                  </h2>
                  <p style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    Gestiona las solicitudes de royalties de tus artistas
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: isMobile ? '12px' : '16px',
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '10px 16px' : '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    flex: isMobile ? 1 : 'initial'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '700',
                      color: '#ffffff'
                    }}>
                      {pendingRequests.length}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginTop: '4px'
                    }}>
                      Pendientes
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: isMobile ? '10px 16px' : '12px 24px',
                    background: 'rgba(201, 165, 116, 0.15)',
                    borderRadius: '12px',
                    border: '1px solid rgba(201, 165, 116, 0.3)',
                    flex: isMobile ? 1 : 'initial'
                  }}>
                    <div style={{
                      fontSize: isMobile ? '20px' : '24px',
                      fontWeight: '700',
                      color: '#c9a574'
                    }}>
                      {paymentRequests.filter(r => r.status === 'completed').length}
                    </div>
                    <div style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginTop: '4px'
                    }}>
                      Completadas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solicitudes List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '12px' : '16px'
            }}>
              {normalizedPaymentRequests.length === 0 ? (
                <div style={{
                  background: 'rgba(42, 63, 63, 0.3)',
                  borderRadius: isMobile ? '12px' : '16px',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  padding: isMobile ? '48px 24px' : '64px',
                  textAlign: 'center'
                }}>
                  <DollarSign size={isMobile ? 40 : 48} style={{ margin: '0 auto 16px', opacity: 0.3, color: '#c9a574' }} />
                  <p style={{
                    fontSize: isMobile ? '14px' : '16px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '8px'
                  }}>
                    No hay solicitudes de pago
                  </p>
                  <p style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: 'rgba(255, 255, 255, 0.4)'
                  }}>
                    Las solicitudes de los artistas aparecerán aquí
                  </p>
                </div>
              ) : (
                <>
                  {normalizedPaymentRequests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        background: 'rgba(42, 63, 63, 0.4)',
                        borderRadius: isMobile ? '12px' : '16px',
                        border: '1px solid rgba(201, 165, 116, 0.2)',
                        padding: isMobile ? '16px' : '28px 32px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.background = 'rgba(42, 63, 63, 0.5)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(201, 165, 116, 0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.background = 'rgba(42, 63, 63, 0.4)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                        }
                      }}
                    >
                      {/* Header Row: ID + Estado + Acciones */}
                      <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        marginBottom: isMobile ? '12px' : '20px',
                        paddingBottom: isMobile ? '12px' : '16px',
                        borderBottom: '1px solid rgba(201, 165, 116, 0.15)',
                        gap: isMobile ? '12px' : '0'
                      }}>
                        <div style={{
                          fontSize: isMobile ? '11px' : '12px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontWeight: '600',
                          letterSpacing: '0.5px'
                        }}>
                          ID #{request.id.toString().slice(-4)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                          {/* Estado */}
                          <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: isMobile ? '6px 12px' : '8px 14px',
                          borderRadius: '12px',
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: request.status === 'pending' 
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(175, 179, 183, 0.1) 100%)' 
                            : request.status === 'completed'
                            ? 'linear-gradient(135deg, rgba(201, 165, 116, 0.25) 0%, rgba(181, 145, 96, 0.15) 100%)'
                            : 'linear-gradient(135deg, rgba(42, 63, 63, 0.3) 0%, rgba(62, 83, 83, 0.2) 100%)',
                          color: request.status === 'pending'
                            ? '#ffffff'
                            : request.status === 'completed'
                            ? '#e5c590'
                            : '#AFB3B7',
                          border: `1.5px solid ${
                            request.status === 'pending'
                              ? 'rgba(255, 255, 255, 0.3)'
                              : request.status === 'completed'
                              ? 'rgba(201, 165, 116, 0.5)'
                              : 'rgba(42, 63, 63, 0.4)'
                          }`,
                          boxShadow: request.status === 'pending'
                            ? '0 0 20px rgba(255, 255, 255, 0.1)'
                            : request.status === 'completed'
                            ? '0 0 20px rgba(201, 165, 116, 0.25)'
                            : '0 0 20px rgba(42, 63, 63, 0.2)'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: request.status === 'pending'
                              ? '#ffffff'
                              : request.status === 'completed'
                              ? '#c9a574'
                              : '#AFB3B7',
                            boxShadow: `0 0 8px ${
                              request.status === 'pending'
                                ? '#ffffff'
                                : request.status === 'completed'
                                ? '#c9a574'
                                : '#AFB3B7'
                            }`
                          }} />
                          {request.status === 'pending' ? 'Pendiente' : request.status === 'completed' ? 'Completada' : 'En Proceso'}
                        </div>

                        {/* Acciones */}
                        {request.status === 'pending' && (
                          <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', width: isMobile ? '100%' : 'auto' }}>
                            <button
                              onClick={() => {
                                if (setPaymentRequests) {
                                  const updatedRequests = normalizedPaymentRequests.map(r => 
                                    r.id === request.id 
                                      ? { ...r, status: 'completed' }
                                      : r
                                  );
                                  setPaymentRequests(updatedRequests);
                                  
                                  // Actualizar localStorage
                                  localStorage.setItem('paymentRequests', JSON.stringify(updatedRequests));
                                  if (setNotifications) {
                                    setNotifications([{
                                      id: Date.now(),
                                      type: 'success',
                                      title: 'Pago Aprobado',
                                      message: `Pago de €${request.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} a ${request.artistName} aprobado`,
                                      time: 'Ahora',
                                      read: false
                                    }]);
                                  }
                                  
                                  // Mostrar toast de confirmación
                                  toast.success('Pago Aprobado', {
                                    description: `El pago de €${request.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} a ${request.artistName} ha sido aprobado exitosamente.`,
                                    duration: 5000,
                                  });
                                }
                              }}
                              style={{
                                flex: isMobile ? 1 : 'initial',
                                padding: isMobile ? '8px 14px' : '10px 18px',
                                background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.25) 0%, rgba(181, 145, 96, 0.2) 100%)',
                                border: '1.5px solid rgba(201, 165, 116, 0.5)',
                                borderRadius: '10px',
                                color: '#e5c590',
                                fontSize: isMobile ? '11px' : '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(201, 165, 116, 0.15)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201, 165, 116, 0.35) 0%, rgba(181, 145, 96, 0.3) 100%)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 165, 116, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(201, 165, 116, 0.25) 0%, rgba(181, 145, 96, 0.2) 100%)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.15)';
                              }}
                            >
                              <Check size={isMobile ? 14 : 16} strokeWidth={3} />
                              Aprobar
                            </button>
                            <button
                              onClick={() => {
                                if (setPaymentRequests && confirm('¿Estás seguro de rechazar esta solicitud?')) {
                                  // ✅ Eliminar la solicitud
                                  setPaymentRequests(
                                    paymentRequests.filter(r => r.id !== request.id)
                                  );
                                  
                                  // ✅ Actualizar localStorage de solicitudes
                                  const updatedRequests = paymentRequests.filter(r => r.id !== request.id);
                                  localStorage.setItem('paymentRequests', JSON.stringify(updatedRequests));
                                  
                                  // ✅ Notificación para el admin
                                  if (setNotifications) {
                                    setNotifications([{
                                      id: Date.now(),
                                      type: 'error',
                                      title: 'Pago Rechazado',
                                      message: `Solicitud de ${request.artistName} rechazada`,
                                      time: 'Ahora',
                                      read: false
                                    }]);
                                  }
                                  
                                  // ✅ Crear notificación para el artista
                                  const artistNotificationKey = `artistNotifications_${request.artistId}`;
                                  const existingArtistNotifications = JSON.parse(localStorage.getItem(artistNotificationKey) || '[]');
                                  
                                  const artistNotification = {
                                    id: Date.now(),
                                    type: 'error',
                                    title: 'Solicitud de Pago Rechazada',
                                    message: `Tu solicitud de pago de €${request.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ha sido rechazada. Por favor, ponte en contacto con el equipo de BIGARTIST ROYALTIES para más información.`,
                                    time: 'Ahora',
                                    date: new Date().toISOString(),
                                    read: false
                                  };
                                  
                                  existingArtistNotifications.unshift(artistNotification);
                                  localStorage.setItem(artistNotificationKey, JSON.stringify(existingArtistNotifications));
                                  
                                  // ✅ Disparar evento para que el portal del artista se actualice
                                  window.dispatchEvent(new CustomEvent('artistNotificationReceived', {
                                    detail: { artistId: request.artistId }
                                  }));
                                  
                                  // Mostrar toast de confirmación
                                  toast.success('Solicitud Rechazada', {
                                    description: `Se ha notificado a ${request.artistName} sobre el rechazo.`,
                                    duration: 5000,
                                  });
                                }
                              }}
                              style={{
                                flex: isMobile ? 1 : 'initial',
                                padding: isMobile ? '8px 14px' : '10px 18px',
                                background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.3) 0%, rgba(62, 83, 83, 0.2) 100%)',
                                border: '1.5px solid rgba(175, 179, 183, 0.4)',
                                borderRadius: '10px',
                                color: '#AFB3B7',
                                fontSize: isMobile ? '11px' : '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(42, 63, 63, 0.2)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(62, 83, 83, 0.3) 100%)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(42, 63, 63, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(42, 63, 63, 0.3) 0%, rgba(62, 83, 83, 0.2) 100%)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 63, 63, 0.2)';
                              }}
                            >
                              <X size={isMobile ? 14 : 16} strokeWidth={3} />
                              Rechazar
                            </button>
                          </div>
                        )}
                        {request.status === 'completed' && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: isMobile ? '8px 14px' : '10px 18px',
                            background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.2) 0%, rgba(181, 145, 96, 0.15) 100%)',
                            borderRadius: '10px',
                            border: '1.5px solid rgba(201, 165, 116, 0.4)',
                            boxShadow: '0 0 15px rgba(201, 165, 116, 0.2)'
                          }}>
                            <Check size={isMobile ? 14 : 16} color="#c9a574" strokeWidth={3} />
                            <span style={{
                              fontSize: isMobile ? '11px' : '12px',
                              fontWeight: '700',
                              color: '#c9a574',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Pagado
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                      {/* Content Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto auto',
                      gap: isMobile ? '16px' : '32px',
                      alignItems: 'center'
                    }}>
                      {/* Artista */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
                        <div style={{
                          width: isMobile ? '48px' : '56px',
                          height: isMobile ? '48px' : '56px',
                          borderRadius: '50%',
                          background: request.artistPhoto ? `url(${request.artistPhoto})` : '#c9a574',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isMobile ? '18px' : '20px',
                          fontWeight: '700',
                          color: '#2a3f3f',
                          flexShrink: 0,
                          border: '2px solid rgba(201, 165, 116, 0.3)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                        }}>
                          {!request.artistPhoto && request.artistName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '4px'
                          }}>
                            {request.artistName}
                          </div>
                          <div style={{
                            fontSize: isMobile ? '11px' : '12px',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }}>
                            Artista
                          </div>
                        </div>
                      </div>

                      {/* Beneficiario */}
                      <div>
                        <div style={{
                          fontSize: isMobile ? '10px' : '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '6px'
                        }}>
                          Beneficiario
                        </div>
                        <div style={{
                          fontSize: isMobile ? '14px' : '15px',
                          color: '#ffffff',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {request.firstName} {request.lastName}
                        </div>
                        <div style={{
                          fontSize: isMobile ? '11px' : '12px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {request.accountNumber}
                        </div>
                      </div>

                      {/* Monto */}
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <div style={{
                          fontSize: isMobile ? '10px' : '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '6px'
                        }}>
                          Monto
                        </div>
                        <div style={{
                          fontSize: isMobile ? '20px' : '24px',
                          fontWeight: '700',
                          color: '#c9a574',
                          letterSpacing: '-0.5px'
                        }}>
                          €{request.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Fecha */}
                      <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <div style={{
                          fontSize: isMobile ? '10px' : '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '6px'
                        }}>
                          Fecha Solicitud
                        </div>
                        <div style={{
                          fontSize: isMobile ? '13px' : '14px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: '600'
                        }}>
                          {(() => {
                            try {
                              const date = new Date(request.date);
                              // Verificar si la fecha es válida
                              if (isNaN(date.getTime())) {
                                return 'Fecha no disponible';
                              }
                              return date.toLocaleDateString('es-ES', { 
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              });
                            } catch (error) {
                              return 'Fecha no disponible';
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
