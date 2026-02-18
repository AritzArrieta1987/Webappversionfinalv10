import { useState, useEffect } from 'react';
import { FinancesPanel } from '../components/admin/FinancesPanel';

export function FinancesPage() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalArtists: 0,
    totalSongs: 0,
    totalStreams: 0,
    monthlyData: []
  });
  const [artists, setArtists] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinanceData();
    
    // Escuchar eventos personalizados de nuevas solicitudes de pago
    const handlePaymentRequest = (event: any) => {
      console.log('🔔 Nueva solicitud de pago en Finanzas:', event.detail);
      
      const data = event.detail;
      // Agregar la nueva solicitud a la lista
      setPaymentRequests(prev => [{
        id: data.id,
        artist_id: data.artistId,
        artist_name: data.artistName,
        amount: data.amount,
        status: 'pending',
        created_at: data.createdAt,
        first_name: data.firstName,
        last_name: data.lastName,
        account_holder: data.accountHolder,
        iban: data.iban,
        reference: data.reference
      }, ...prev]);
    };
    
    window.addEventListener('paymentRequested', handlePaymentRequest);
    
    return () => {
      window.removeEventListener('paymentRequested', handlePaymentRequest);
    };
  }, []);

  const loadFinanceData = async () => {
    try {
      // Primero intentar cargar desde localStorage (datos del CSV)
      const dashboardStats = localStorage.getItem('dashboardStats');
      const localArtists = JSON.parse(localStorage.getItem('artists') || '[]');
      const royaltiesData = JSON.parse(localStorage.getItem('royaltiesData') || '[]');
      
      if (dashboardStats) {
        const stats = JSON.parse(dashboardStats);
        
        // Preparar monthlyData desde los períodos del CSV
        const monthlyData = stats.periods.map(period => ({
          month: period.period,
          revenue: period.revenue,
          streams: 0, // Se puede calcular si es necesario
          artists: royaltiesData.map(artist => ({
            id: artist.artistName,
            name: artist.artistName,
            revenue: artist.periods.find(p => p.period === period.period)?.revenue || 0
          }))
        }));
        
        setDashboardData({
          totalRevenue: stats.totalRevenue,
          totalArtists: stats.totalArtists,
          totalSongs: stats.totalTracks,
          totalStreams: stats.totalStreams,
          monthlyData: monthlyData
        });
        
        setArtists(localArtists);
        
        // Cargar solicitudes de pago desde localStorage
        const localPaymentRequests = JSON.parse(localStorage.getItem('paymentRequests') || '[]');
        const formattedRequests = localPaymentRequests.map((req: any) => ({
          id: req.id,
          artist_id: req.artistId,
          artist_name: req.artistName,
          amount: req.amount,
          status: req.status === 'Pendiente' ? 'pending' : req.status.toLowerCase(),
          created_at: req.createdAt || req.date,
          first_name: req.firstName,
          last_name: req.lastName,
          account_holder: req.accountHolder,
          iban: req.iban,
          reference: req.reference
        }));
        setPaymentRequests(formattedRequests);
      } else {
        // Si no hay datos del CSV, intentar cargar del backend
        const token = localStorage.getItem('token');
        
        if (token) {
          // Cargar resumen financiero desde el backend
          const overviewRes = await fetch('https://app.bigartist.es/api/finances/overview', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (overviewRes.ok) {
            const data = await overviewRes.json();
            setDashboardData({
              totalRevenue: data.data.totalRevenue || 0,
              totalArtists: data.data.totalArtists || 0,
              totalSongs: data.data.totalSongs || 0,
              totalStreams: data.data.totalStreams || 0,
              monthlyData: data.data.monthlyData || []
            });
          }

          // Cargar artistas desde el backend
          const artistsRes = await fetch('https://app.bigartist.es/api/artists', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (artistsRes.ok) {
            const artistsData = await artistsRes.json();
            setArtists(artistsData.artists || []);
          }

          // Cargar solicitudes de pago desde el backend
          const paymentsRes = await fetch('https://app.bigartist.es/api/payments/requests', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (paymentsRes.ok) {
            const paymentsData = await paymentsRes.json();
            setPaymentRequests(paymentsData.requests || []);
          }
        }
      }

    } catch (error) {
      console.error('Error cargando datos financieros:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#AFB3B7' }}>
        <p>Cargando datos financieros...</p>
      </div>
    );
  }

  return (
    <FinancesPanel
      dashboardData={dashboardData}
      artists={artists}
      paymentRequests={paymentRequests}
      setPaymentRequests={setPaymentRequests}
      notifications={notifications}
      setNotifications={setNotifications}
    />
  );
}