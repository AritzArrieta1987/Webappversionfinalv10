import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import ArtistPortal from '../components/ArtistPortal';

export function ArtistPortalPage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [artistData, setArtistData] = useState<any>(null);

  // 🔄 Función para cargar datos del artista
  const fetchArtistData = async () => {
    setIsLoading(true);
    
    // Simular llamada a la API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ✅ CARGAR DATOS IGUAL QUE EL DASHBOARD
    const artists = JSON.parse(localStorage.getItem('artists') || '[]');
    const royaltiesData = JSON.parse(localStorage.getItem('royaltiesData') || '[]');
    const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
    const uploadedCSVs = JSON.parse(localStorage.getItem('uploadedCSVs') || '[]');
    
    console.log('🔄 ArtistPortalPage: Cargando datos del artista...');
    console.log('👥 Total artistas en localStorage:', artists.length);
    console.log('🔍 Buscando artistId:', artistId);
    console.log('📁 Total CSVs cargados:', uploadedCSVs.length);
    
    // Buscar el artista por ID o nombre
    const artist = artists.find(a => a.id.toString() === artistId || a.name === artistId);
    
    if (!artist) {
      console.log('❌ No se encontró el artista:', artistId);
      setIsLoading(false);
      return;
    }

    console.log('✅ Artista encontrado:', artist.name);
    
    // ✅ COPIAR LÓGICA EXACTA DEL DASHBOARD - SUMAR TODOS LOS ROYALTIES
    const artistRoyalties = royaltiesData.filter((r: any) => r.artistName === artist.name);
    
    console.log('📊 ROYALTIES ENCONTRADOS PARA', artist.name, ':', artistRoyalties.length);
    console.log('📋 Detalles:', artistRoyalties.map(r => ({
      period: r.period,
      totalRevenue: r.totalRevenue
    })));
    
    // Buscar el contrato activo del artista
    const artistContract = contracts.find((c: any) => 
      c.artistName === artist.name && c.status === 'active'
    );
    
    // Si tiene contrato, usar su porcentaje; si no, usar 50% por defecto
    const royaltyPercentage = artistContract?.royaltyPercentage || 50;
    
    // ✅ SUMAR TODOS LOS ROYALTIES (igual que Dashboard líneas 138-151)
    let totalRoyalties = 0;
    let totalArtistShare = 0;
    let totalLabelShare = 0;
    
    artistRoyalties.forEach((royalty: any) => {
      const artistShare = royalty.totalRevenue * (royaltyPercentage / 100);
      const labelShare = royalty.totalRevenue * ((100 - royaltyPercentage) / 100);
      
      totalRoyalties += royalty.totalRevenue;
      totalArtistShare += artistShare;
      totalLabelShare += labelShare;
    });
    
    console.log('💵 CÁLCULOS (SUMA DE TODOS LOS CSVs):');
    console.log('  - Total Royalties:', totalRoyalties);
    console.log('  - Artist Share:', totalArtistShare);
    console.log('  - Label Share:', totalLabelShare);
    
    // ✅ CREAR PUNTO POR CADA CSV (1 PUNTO = 1 CSV CON SU PERÍODO)
    const monthlyData: any[] = [];
    
    uploadedCSVs.forEach((csv: any, csvIndex: number) => {
      // Buscar este artista en el CSV procesado
      const artistInCSV = csv.processedData?.artists?.find((a: any) => a.name === artist.name);
      
      if (artistInCSV && artistInCSV.periods && artistInCSV.periods.length > 0) {
        // Tomar el PRIMER período del CSV (normalmente todos los registros de un CSV tienen el mismo período)
        const mainPeriod = artistInCSV.periods[0].period;
        const totalRevenueInCSV = artistInCSV.totalRevenue || 0;
        const totalStreamsInCSV = artistInCSV.totalStreams || 0;
        
        monthlyData.push({
          month: mainPeriod,
          revenue: totalRevenueInCSV,
          streams: totalStreamsInCSV,
          csvId: csv.id // Para debuggear
        });
        
        console.log(`📊 CSV ${csvIndex + 1} (${csv.fileName}):`, {
          period: mainPeriod,
          revenue: totalRevenueInCSV,
          streams: totalStreamsInCSV
        });
      }
    });
    
    // Ordenar por período
    monthlyData.sort((a, b) => a.month.localeCompare(b.month));
    
    console.log('📊 Monthly Data FINAL (1 punto por CSV):', monthlyData);
    
    // ✅ COMBINAR platformBreakdown de TODOS los royalties
    const platformBreakdown: { [key: string]: number } = {};
    
    artistRoyalties.forEach((royalty: any) => {
      if (royalty.platforms && Array.isArray(royalty.platforms)) {
        royalty.platforms.forEach((platform: any) => {
          if (platformBreakdown[platform.name]) {
            platformBreakdown[platform.name] += platform.revenue || 0;
          } else {
            platformBreakdown[platform.name] = platform.revenue || 0;
          }
        });
      }
    });
    
    console.log('🎵 Platform Breakdown combinado:', platformBreakdown);
    
    // ✅ COMBINAR tracks de TODOS los royalties (sin duplicar por ISRC)
    const tracksMap = new Map();
    
    artistRoyalties.forEach((royalty: any) => {
      if (royalty.tracks && Array.isArray(royalty.tracks)) {
        royalty.tracks.forEach((track: any) => {
          const key = track.isrc || `${track.title}-${track.artist}`;
          const existing = tracksMap.get(key);
          
          if (existing) {
            existing.revenue = (existing.revenue || 0) + (track.revenue || 0);
            existing.streams = (existing.streams || 0) + (track.streams || 0);
          } else {
            tracksMap.set(key, { ...track });
          }
        });
      }
    });
    
    // ✅ TAMBIÉN CARGAR TRACKS DIRECTAMENTE DE LOS CSVs (para cuando hay CSVs pero no royaltiesData)
    uploadedCSVs.forEach((csv: any) => {
      if (csv.processedData && csv.processedData.artists) {
        const artistInCSV = csv.processedData.artists.find((a: any) => a.name === artist.name);
        
        if (artistInCSV && artistInCSV.tracks) {
          artistInCSV.tracks.forEach((track: any) => {
            const key = track.isrc || `${track.name}-${artist.name}`;
            const existing = tracksMap.get(key);
            
            if (existing) {
              // Sumar si ya existe
              existing.revenue = (existing.revenue || 0) + (track.revenue || 0);
              existing.streams = (existing.streams || 0) + (track.streams || 0);
            } else {
              // Nuevo track
              tracksMap.set(key, {
                title: track.name,
                name: track.name,
                artist: artist.name,
                artistName: artist.name,
                release: track.release,
                isrc: track.isrc,
                revenue: track.revenue || 0,
                streams: track.streams || 0,
                platforms: track.platforms || {}
              });
            }
          });
        }
      }
    });
    
    const tracks = Array.from(tracksMap.values());
    
    console.log('🎵 Tracks combinados (royalties + CSVs):', tracks.length);
    
    // ✅ COMBINAR territories de TODOS los royalties
    const territoriesMap = new Map();
    
    artistRoyalties.forEach((royalty: any) => {
      if (royalty.territories && Array.isArray(royalty.territories)) {
        royalty.territories.forEach((territory: any) => {
          const existing = territoriesMap.get(territory.name);
          if (existing) {
            existing.revenue += territory.revenue || 0;
            existing.streams += territory.streams || 0;
          } else {
            territoriesMap.set(territory.name, { ...territory });
          }
        });
      }
    });
    
    const territories = Array.from(territoriesMap.values());
    
    // Construir datos del artista para el portal
    setArtistData({
      id: artist.id,
      name: artist.name,
      email: artist.email,
      photo: artist.photo || '',
      // ✅ VALORES COMBINADOS DE TODOS LOS CSVs
      totalRevenue: totalRoyalties,
      totalStreams: artist.totalStreams,
      tracks: tracks, // ✅ Tracks combinados
      monthlyData: monthlyData, // ✅ 1 PUNTO POR CSV
      platformBreakdown: platformBreakdown, // ✅ Plataformas combinadas
      royaltyPercentage: royaltyPercentage,
      artistRoyalty: totalArtistShare,
      labelShare: totalLabelShare,
      contractType: artist.contractType || '360',
      territories: territories // ✅ Territorios combinados
    });
    
    console.log('✅ Datos del artista preparados para el portal');
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (!artistId) {
      navigate('/');
      return;
    }
    
    // Cargar datos al montar
    fetchArtistData();

    // 🔄 Escuchar cambios cuando se sube un nuevo CSV
    const handleCustomUpdate = () => {
      console.log('🔔 ArtistPortalPage: Detectado evento de actualización CSV');
      fetchArtistData();
    };

    window.addEventListener('csvUploaded', handleCustomUpdate);

    return () => {
      window.removeEventListener('csvUploaded', handleCustomUpdate);
    };
  }, [artistId, navigate]);

  const handleLogout = () => {
    // Volver a la página de artistas
    navigate('/');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1414 0%, #1a2f2f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#c9a574',
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
          }}>
            Cargando portal del artista...
          </div>
        </div>
      </div>
    );
  }

  if (!artistData) {
    return null;
  }

  return <ArtistPortal onLogout={handleLogout} artistData={artistData} />;
}