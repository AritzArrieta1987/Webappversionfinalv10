// Utilidad de debug para verificación básica del sistema

export const debugAPI = () => {
  // Debug info removida en producción - solo disponible en desarrollo local
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return;
  }
  
  console.group('🔍 Debug BigArtist API');
  
  // Verificar entorno
  console.log('📍 Hostname:', window.location.hostname);
  console.log('📍 Protocol:', window.location.protocol);
  
  // Verificar si es localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  console.log('🏠 Is Localhost:', isLocalhost);
  
  // Mostrar URL del API
  const apiBase = isLocalhost ? '' : 'https://app.bigartist.es';
  console.log('🌐 API Base URL:', apiBase || 'Proxy Vite (relativo)');
  
  // Verificar localStorage sin mostrar datos sensibles
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  console.log('🔐 Token almacenado:', token ? '✅ Sí' : '❌ No');
  console.log('👤 Usuario almacenado:', user ? '✅ Sí' : '❌ No');
  
  console.groupEnd();
};

// Probar conexión al API
export const testAPIConnection = async () => {
  // Debug info removida en producción - solo disponible en desarrollo local
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return;
  }
  
  console.group('🧪 Test de Conexión al API');
  
  try {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const apiBase = isLocalhost ? '' : 'https://app.bigartist.es';
    const endpoint = `${apiBase}/api/health`;
    
    console.log('📡 Probando endpoint:', endpoint);
    
    const response = await fetch(endpoint);
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Conectada');
    } else {
      console.error('❌ Respuesta con error');
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
  
  console.groupEnd();
};

// Exportar para usar en consola del navegador (solo en desarrollo local)
if (typeof window !== 'undefined') {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    (window as any).debugBigArtist = {
      info: debugAPI,
      testConnection: testAPIConnection,
      // ✅ NUEVA FUNCIÓN: Verificar datos del Artist Portal
      checkArtistData: (artistId: string | number) => {
        console.group('🎨 DEBUG: Artist Portal Data');
        
        const artists = JSON.parse(localStorage.getItem('artists') || '[]');
        const royaltiesData = JSON.parse(localStorage.getItem('royaltiesData') || '[]');
        const uploadedCSVs = JSON.parse(localStorage.getItem('uploadedCSVs') || '[]');
        
        console.log('📊 CSVs cargados:', uploadedCSVs.length);
        
        const artist = artists.find((a: any) => 
          a.id.toString() === artistId.toString() || a.name === artistId
        );
        
        if (artist) {
          console.log('✅ Artista encontrado:', artist.name);
          console.log('💰 Total Revenue:', artist.totalRevenue);
          console.log('🎵 Total Streams:', artist.totalStreams);
          console.log('📦 CSV Data:', artist.csvData);
          console.log('📈 Períodos:', artist.csvData?.periods);
          console.log('🎯 Plataformas:', artist.csvData?.platforms);
          console.log('🎵 Tracks:', artist.csvData?.tracks?.length);
          
          const royaltyData = royaltiesData.find((r: any) => r.artistName === artist.name);
          if (royaltyData) {
            console.log('💵 Royalty Data:', royaltyData);
          }
        } else {
          console.error('❌ Artista no encontrado:', artistId);
          console.log('👥 Artistas disponibles:', artists.map((a: any) => `${a.id}: ${a.name}`));
        }
        
        console.groupEnd();
      },
      // ✅ NUEVA FUNCIÓN: Listar todos los artistas
      listArtists: () => {
        const artists = JSON.parse(localStorage.getItem('artists') || '[]');
        console.table(artists.map((a: any) => ({
          id: a.id,
          name: a.name,
          totalRevenue: a.totalRevenue?.toFixed(2),
          totalStreams: a.totalStreams,
          tracks: a.csvData?.tracks?.length || 0
        })));
      },
      // ✅ NUEVA FUNCIÓN: Limpiar todo y empezar de cero
      clearAll: () => {
        if (confirm('¿Estás seguro de limpiar TODOS los datos?')) {
          localStorage.clear();
          location.reload();
          console.log('✅ Datos limpiados');
        }
      }
    };
    
    console.log('💡 Debug tools disponibles en desarrollo local');
    console.log('📝 Comandos disponibles:');
    console.log('  - debugBigArtist.checkArtistData(artistId)');
    console.log('  - debugBigArtist.listArtists()');
    console.log('  - debugBigArtist.clearAll()');
  }
}