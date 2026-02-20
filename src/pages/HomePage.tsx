import { LayoutDashboard, TrendingUp, DollarSign, Users, Music, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function HomePage() {
  const [stats, setStats] = useState<any>(null);
  const [royalties, setRoyalties] = useState<any[]>([]);

  // 🔄 Función para cargar datos desde localStorage
  const loadData = () => {
    const dashboardStats = localStorage.getItem('dashboardStats');
    const royaltiesData = localStorage.getItem('royaltiesData');
    
    console.log('🔄 HomePage: Cargando datos desde localStorage...');
    console.log('📊 dashboardStats:', dashboardStats ? 'ENCONTRADO' : 'NO ENCONTRADO');
    console.log('💰 royaltiesData:', royaltiesData ? 'ENCONTRADO' : 'NO ENCONTRADO');
    
    if (dashboardStats) {
      const parsedStats = JSON.parse(dashboardStats);
      console.log('✅ Stats parseados:', parsedStats);
      setStats(parsedStats);
    } else {
      setStats(null);
    }
    
    if (royaltiesData) {
      setRoyalties(JSON.parse(royaltiesData));
    } else {
      setRoyalties([]);
    }
  };

  useEffect(() => {
    // Cargar datos al montar
    loadData();

    // 🔄 Escuchar cambios en localStorage (cuando se sube un CSV)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardStats' || e.key === 'royaltiesData') {
        console.log('🔔 Detectado cambio en localStorage:', e.key);
        loadData();
      }
    };

    // 🔄 También escuchar evento personalizado para actualizaciones en la misma pestaña
    const handleCustomUpdate = () => {
      console.log('🔔 Detectado evento de actualización CSV');
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('csvUploaded', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('csvUploaded', handleCustomUpdate);
    };
  }, []);

  if (!stats) {
    return (
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#ffffff',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <LayoutDashboard size={32} color="#c9a574" />
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
            Resumen general de BIGARTIST ROYALTIES
          </p>
        </div>

        {/* Empty State */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(201, 165, 116, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <LayoutDashboard size={40} color="#c9a574" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
            No hay datos disponibles
          </h2>
          <p style={{ fontSize: '16px', color: '#AFB3B7', marginBottom: '24px' }}>
            Sube tu primer archivo CSV de The Orchard para ver las estadísticas
          </p>
          <a
            href="/upload"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Subir CSV
          </a>
        </div>
      </div>
    );
  }

  // Calcular métricas basadas en los contratos reales de cada artista
  const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
  const royaltiesData = JSON.parse(localStorage.getItem('royaltiesData') || '[]');
  
  // Calcular el total de royalties por artista según su contrato
  let totalArtista = 0;
  let totalBAM = 0;
  
  royaltiesData.forEach((royalty: any) => {
    // Buscar el contrato activo del artista
    const artistContract = contracts.find((c: any) => 
      c.artistName === royalty.artistName && c.status === 'active'
    );
    
    // Si tiene contrato, usar su porcentaje; si no, usar 50% por defecto
    const artistPercentage = artistContract?.royaltyPercentage || 50;
    const artistShare = royalty.totalRevenue * (artistPercentage / 100);
    const labelShare = royalty.totalRevenue * ((100 - artistPercentage) / 100);
    
    totalArtista += artistShare;
    totalBAM += labelShare;
  });
  
  const totalRoyalties = stats.totalRevenue;
  
  // Calcular total facturado por otros trabajos
  const totalWorkBilling = contracts.reduce((sum: number, contract: any) => {
    const workBilling = parseFloat(contract.workBilling) || 0;
    return sum + workBilling;
  }, 0);

  // Stats cards - Las mismas 4 métricas que en el Portal del Artista y Panel de Finanzas
  const statsCards = [
    {
      title: 'Total Royalties',
      value: `${totalRoyalties.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`,
      icon: DollarSign,
      color: '#c9a574',
      bgColor: 'rgba(42, 63, 63, 0.3)',
      subtitle: 'Ingresos totales del CSV'
    },
    {
      title: 'Total Artista',
      value: `${totalArtista.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`,
      icon: TrendingUp,
      color: '#c9a574',
      bgColor: 'rgba(42, 63, 63, 0.3)',
      subtitle: 'Según contratos individuales'
    },
    {
      title: 'Total BAM',
      value: `${totalBAM.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`,
      icon: Calendar,
      color: '#c9a574',
      bgColor: 'rgba(42, 63, 63, 0.3)',
      subtitle: 'Parte de la compañía'
    },
    {
      title: 'Otros Trabajos',
      value: `${totalWorkBilling.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`,
      icon: Users,
      color: '#c9a574',
      bgColor: 'rgba(42, 63, 63, 0.3)',
      subtitle: 'Facturación aparte'
    }
  ];

  // Colores para gráficos
  const COLORS = ['#1DB954', '#FA2D48', '#FF0000', '#c9a574', '#3b82f6', '#a855f7', '#22c55e', '#f59e0b'];

  // Top 5 plataformas
  const topPlatforms = stats.platforms.slice(0, 5);

  // Top 5 territorios
  const topTerritories = stats.territories.slice(0, 5);

  // Datos para gráfico de períodos (evolución temporal)
  const periodsData = stats.periods.map((p: any) => ({
    period: p.period,
    revenue: p.revenue
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#ffffff',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <LayoutDashboard size={32} color="#c9a574" />
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
          Resumen general de BIGARTIST ROYALTIES
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {statsCards.map((card, index) => (
          <div
            key={index}
            style={{
              background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
              border: '1px solid rgba(201, 165, 116, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#AFB3B7', marginBottom: '8px' }}>
                  {card.title}
                </p>
                <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                  {card.value}
                </h3>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <card.icon size={24} color={card.color} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                {card.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Gráfico de Plataformas */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
            Ingresos por Plataforma
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topPlatforms}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}: $${entry.revenue.toFixed(2)}`}
              >
                {topPlatforms.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#2a3f3f',
                  border: '1px solid #c9a574',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lista de Territorios */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
            Top 5 Territorios
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topTerritories.map((territory, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(42, 63, 63, 0.5)',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: index === 0 ? 'rgba(201, 165, 116, 0.2)' : 'rgba(201, 165, 116, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#c9a574'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                      {territory.name}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#c9a574' }}>
                    €{territory.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evolución Temporal */}
      {periodsData.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Calendar size={24} color="#c9a574" />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Evolución de Ingresos por Período
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={periodsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201, 165, 116, 0.1)" />
              <XAxis dataKey="period" stroke="#AFB3B7" />
              <YAxis stroke="#AFB3B7" />
              <Tooltip
                contentStyle={{
                  background: '#2a3f3f',
                  border: '1px solid #c9a574',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#c9a574" 
                strokeWidth={2}
                dot={{ fill: '#c9a574', r: 5 }}
                activeDot={{ r: 7 }}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Artistas */}
      {stats.topArtists && stats.topArtists.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '20px' }}>
            Top 10 Artistas por Ingresos
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{
                    padding: '12px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'left'
                  }}>
                    Artista
                  </th>
                  <th style={{
                    padding: '12px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'right'
                  }}>
                    Ingresos
                  </th>
                  <th style={{
                    padding: '12px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'right'
                  }}>
                    Streams
                  </th>
                  <th style={{
                    padding: '12px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'right'
                  }}>
                    Canciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topArtists.map((artist: any, index: number) => (
                  <tr key={index}>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                      fontSize: '14px',
                      color: '#ffffff'
                    }}>
                      {artist.name}
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                      fontSize: '14px',
                      color: '#22c55e',
                      fontWeight: '600',
                      textAlign: 'right'
                    }}>
                      ${artist.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                      fontSize: '14px',
                      color: '#AFB3B7',
                      textAlign: 'right'
                    }}>
                      {artist.totalStreams.toLocaleString('es-ES')}
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                      fontSize: '14px',
                      color: '#AFB3B7',
                      textAlign: 'right'
                    }}>
                      {artist.tracks.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}