import { Upload, FileText, Check, X, AlertCircle, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CSVRow {
  [key: string]: string;
}

export function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true); // ✅ Track si el componente está montado

  // Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false; // ✅ Marcar como desmontado
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      processFile(droppedFile);
    } else {
      setErrorMessage('Por favor, sube solo archivos CSV (.csv)');
      setUploadStatus('error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setUploadStatus('idle');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    console.log('🔍 PARSEANDO CSV...');
    console.log('📄 Primeros 500 caracteres:', text.substring(0, 500));
    
    // Detectar el separador (puede ser coma, tabulación o punto y coma)
    const firstLine = text.split('\n')[0];
    let separator = ',';
    if (firstLine.includes('\t')) {
      separator = '\t';
      console.log('✅ Separador detectado: TABULACIÓN');
    } else if (firstLine.includes(';')) {
      separator = ';';
      console.log('✅ Separador detectado: PUNTO Y COMA');
    } else {
      console.log('✅ Separador detectado: COMA');
    }
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    console.log('📊 Total de líneas:', lines.length);
    
    if (lines.length === 0) {
      setErrorMessage('El archivo CSV está vacío');
      setUploadStatus('error');
      return;
    }

    // Obtener headers
    const headerLine = lines[0];
    const parsedHeaders = headerLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
    console.log('📋 Headers encontrados:', parsedHeaders);
    setHeaders(parsedHeaders);

    // Parsear datos
    const data: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue; // Saltar líneas vacías
      
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      // Parser avanzado para manejar campos con comas dentro de comillas
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === separator && !insideQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, '')); // Último valor

      const row: CSVRow = {};
      parsedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
      
      // Log de las primeras 2 filas
      if (i <= 2) {
        console.log(`🔍 Fila ${i}:`, row);
      }
    }

    console.log('✅ CSV Parseado:', data.length, 'filas de datos');
    setCsvData(data);
  };

  const handleUpload = async () => {
    if (!file || csvData.length === 0) return;

    setIsProcessing(true);

    // Limpiar timeout anterior si existe
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Simular procesamiento (en producción, aquí harías la llamada a la API)
    processingTimeoutRef.current = setTimeout(() => {
      // ✅ Verificar que el componente sigue montado antes de actualizar estado
      if (!isMountedRef.current) {
        console.log('⚠️ Componente desmontado, cancelando actualización de estado');
        return;
      }

      // ✅ LEER DATOS ANTERIORES PARA ACUMULAR
      console.log('📥 Leyendo datos anteriores para acumular...');
      const previousStats = JSON.parse(localStorage.getItem('dashboardStats') || 'null');
      const previousRoyalties = JSON.parse(localStorage.getItem('royaltiesData') || '[]');
      const previousArtists = JSON.parse(localStorage.getItem('artists') || '[]');
      const previousCSVs = JSON.parse(localStorage.getItem('uploadedCSVs') || '[]');
      
      // Procesar datos de The Orchard del nuevo CSV
      const processedData = processTheOrchardData(csvData, releaseDate);
      
      // 🔄 COMBINAR CON DATOS ANTERIORES
      let combinedStats = processedData.stats;
      let combinedRoyalties = processedData.royalties;
      let combinedArtists = processedData.artists;
      
      if (previousStats) {
        console.log('🔄 Combinando con datos anteriores...');
        console.log('📊 Stats anteriores:', previousStats.totalRevenue);
        console.log('📊 Stats nuevas:', processedData.stats.totalRevenue);
        
        // Combinar totales
        combinedStats = {
          totalRevenue: (previousStats.totalRevenue || 0) + processedData.stats.totalRevenue,
          totalStreams: (previousStats.totalStreams || 0) + processedData.stats.totalStreams,
          totalArtists: 0, // Se calculará después
          totalTracks: 0, // Se calculará después
          platforms: [],
          territories: [],
          periods: [],
          topArtists: []
        };
        
        // Combinar plataformas
        const platformsMap = new Map();
        [...(previousStats.platforms || []), ...processedData.stats.platforms].forEach((p: any) => {
          platformsMap.set(p.name, (platformsMap.get(p.name) || 0) + p.revenue);
        });
        combinedStats.platforms = Array.from(platformsMap.entries())
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue);
        
        // Combinar territorios
        const territoriesMap = new Map();
        [...(previousStats.territories || []), ...processedData.stats.territories].forEach((t: any) => {
          territoriesMap.set(t.name, (territoriesMap.get(t.name) || 0) + t.revenue);
        });
        combinedStats.territories = Array.from(territoriesMap.entries())
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue);
        
        // Combinar períodos
        const periodsMap = new Map();
        [...(previousStats.periods || []), ...processedData.stats.periods].forEach((p: any) => {
          periodsMap.set(p.period, (periodsMap.get(p.period) || 0) + p.revenue);
        });
        combinedStats.periods = Array.from(periodsMap.entries())
          .map(([period, revenue]) => ({ period, revenue }))
          .sort((a, b) => a.period.localeCompare(b.period));
        
        // Combinar artistas por nombre
        const artistsMap = new Map();
        
        // Agregar artistas anteriores con todos sus datos
        previousRoyalties.forEach((royalty: any) => {
          // Buscar el artista completo en previousArtists
          const fullArtistData = previousArtists.find((a: any) => a.name === royalty.artistName);
          
          artistsMap.set(royalty.artistName, {
            name: royalty.artistName,
            totalRevenue: royalty.totalRevenue,
            totalStreams: royalty.totalStreams,
            tracks: fullArtistData?.csvData?.tracks || [],
            platforms: fullArtistData?.csvData?.platforms || [],
            territories: fullArtistData?.csvData?.territories || [],
            periods: fullArtistData?.csvData?.periods || []
          });
        });
        
        // Agregar/combinar artistas nuevos
        processedData.artists.forEach((artist: any) => {
          if (artistsMap.has(artist.name)) {
            const existing = artistsMap.get(artist.name);
            existing.totalRevenue += artist.totalRevenue;
            existing.totalStreams += artist.totalStreams;
            
            // 🔄 COMBINAR TRACKS (sin duplicados por nombre)
            const tracksMap = new Map();
            existing.tracks.forEach((t: any) => tracksMap.set(t.name, t));
            artist.tracks.forEach((t: any) => {
              if (tracksMap.has(t.name)) {
                // Si ya existe, sumar revenue y streams
                const existingTrack = tracksMap.get(t.name);
                existingTrack.revenue += t.revenue;
                existingTrack.streams += t.streams;
                // Combinar plataformas del track
                const platformsMap = new Map();
                existingTrack.platforms.forEach((p: any) => platformsMap.set(p.name, p));
                t.platforms.forEach((p: any) => {
                  if (platformsMap.has(p.name)) {
                    const existingPlatform = platformsMap.get(p.name);
                    existingPlatform.revenue += p.revenue;
                    existingPlatform.streams += p.streams;
                    existingPlatform.details = [...(existingPlatform.details || []), ...(p.details || [])];
                  } else {
                    platformsMap.set(p.name, p);
                  }
                });
                existingTrack.platforms = Array.from(platformsMap.values());
              } else {
                tracksMap.set(t.name, t);
              }
            });
            existing.tracks = Array.from(tracksMap.values());
            
            // 🔄 COMBINAR PLATAFORMAS
            const platformsMap = new Map();
            existing.platforms.forEach((p: any) => platformsMap.set(p.name, { name: p.name, revenue: p.revenue }));
            artist.platforms.forEach((p: any) => {
              if (platformsMap.has(p.name)) {
                platformsMap.get(p.name).revenue += p.revenue;
              } else {
                platformsMap.set(p.name, { name: p.name, revenue: p.revenue });
              }
            });
            existing.platforms = Array.from(platformsMap.values());
            
            // 🔄 COMBINAR TERRITORIOS
            const territoriesMap = new Map();
            existing.territories.forEach((t: any) => territoriesMap.set(t.name, { name: t.name, revenue: t.revenue }));
            artist.territories.forEach((t: any) => {
              if (territoriesMap.has(t.name)) {
                territoriesMap.get(t.name).revenue += t.revenue;
              } else {
                territoriesMap.set(t.name, { name: t.name, revenue: t.revenue });
              }
            });
            existing.territories = Array.from(territoriesMap.values());
            
            // 🔄 COMBINAR PERÍODOS
            const periodsMap = new Map();
            existing.periods.forEach((p: any) => periodsMap.set(p.period, { period: p.period, revenue: p.revenue }));
            artist.periods.forEach((p: any) => {
              if (periodsMap.has(p.period)) {
                periodsMap.get(p.period).revenue += p.revenue;
              } else {
                periodsMap.set(p.period, { period: p.period, revenue: p.revenue });
              }
            });
            existing.periods = Array.from(periodsMap.values());
          } else {
            artistsMap.set(artist.name, {
              name: artist.name,
              totalRevenue: artist.totalRevenue,
              totalStreams: artist.totalStreams,
              tracks: artist.tracks || [],
              platforms: artist.platforms || [],
              territories: artist.territories || [],
              periods: artist.periods || []
            });
          }
        });
        
        combinedArtists = Array.from(artistsMap.values());
        
        // Recalcular royalties
        combinedRoyalties = combinedArtists.map(artist => {
          const royaltyPercentage = 0.50;
          const artistRoyalty = artist.totalRevenue * royaltyPercentage;
          const labelShare = artist.totalRevenue * (1 - royaltyPercentage);
          
          return {
            artistName: artist.name,
            totalRevenue: artist.totalRevenue,
            totalStreams: artist.totalStreams,
            royaltyPercentage: royaltyPercentage * 100,
            artistRoyalty: artistRoyalty,
            labelShare: labelShare,
            trackCount: artist.tracks.length,
            topTrack: artist.tracks.length > 0 
              ? [...artist.tracks].sort((a, b) => b.revenue - a.revenue)[0] 
              : null,
            platforms: artist.platforms,
            periods: artist.periods
          };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        // Actualizar topArtists
        combinedStats.topArtists = [...combinedArtists]
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 10);
        
        combinedStats.totalArtists = combinedArtists.length;
        combinedStats.totalTracks = combinedArtists.reduce((sum, a) => sum + (a.tracks?.length || 0), 0);
        
        console.log('✅ Datos combinados:');
        console.log('💰 Total Revenue:', combinedStats.totalRevenue);
        console.log('👥 Total Artistas:', combinedStats.totalArtists);
      }
      
      // Guardar el CSV procesado
      const uploadedFile = {
        id: Date.now(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        rowCount: csvData.length,
        headers: headers,
        data: csvData,
        processedData: processedData,
        status: 'processed'
      };

      // ✅ AGREGAR a la lista de CSVs (no reemplazar)
      const allCSVs = [...previousCSVs, uploadedFile];
      localStorage.setItem('uploadedCSVs', JSON.stringify(allCSVs));

      // Guardar estadísticas combinadas para el dashboard
      localStorage.setItem('dashboardStats', JSON.stringify(combinedStats));
      localStorage.setItem('royaltiesData', JSON.stringify(combinedRoyalties));

      // ✅ ACTUALIZAR ARTISTAS con datos combinados
      const updatedArtists = combinedArtists.map((csvArtist, index) => {
        // Buscar si el artista ya existe
        const existingArtist = previousArtists.find((a: any) => a.name === csvArtist.name);
        
        const artistData = {
          id: existingArtist?.id || (previousArtists.length + index + 1),
          name: csvArtist.name,
          email: existingArtist?.email || `${csvArtist.name.toLowerCase().replace(/\s+/g, '.')}@artist.com`,
          phone: existingArtist?.phone || '+34 600 000 000',
          photo: existingArtist?.photo || '',
          contractType: existingArtist?.contractType || '360',
          contractPercentage: existingArtist?.contractPercentage || 50,
          status: existingArtist?.status || 'active',
          joinDate: existingArtist?.joinDate || new Date().toISOString(),
          // ✅ DATOS ACUMULADOS
          totalRevenue: csvArtist.totalRevenue,
          totalStreams: csvArtist.totalStreams,
          csvData: {
            name: csvArtist.name,
            totalRevenue: csvArtist.totalRevenue,
            totalStreams: csvArtist.totalStreams,
            tracks: csvArtist.tracks || [],
            platforms: csvArtist.platforms || [],
            territories: csvArtist.territories || [],
            periods: csvArtist.periods || []
          }
        };
        
        // Log detallado del primer artista
        if (index === 0) {
          console.log('🔍 DEBUG - Primer artista guardado:', {
            name: artistData.name,
            totalRevenue: artistData.totalRevenue,
            totalStreams: artistData.totalStreams,
            tracks: artistData.csvData.tracks.length,
            platforms: artistData.csvData.platforms.length,
            territories: artistData.csvData.territories.length,
            periods: artistData.csvData.periods.length
          });
        }
        
        return artistData;
      });
      
      localStorage.setItem('artists', JSON.stringify(updatedArtists));
      console.log('✅ Artistas actualizados:', updatedArtists.length);
      console.log('📊 Resumen por artista:');
      updatedArtists.forEach((a: any) => {
        console.log(`  - ${a.name}: €${a.totalRevenue.toFixed(2)}, ${a.csvData.tracks.length} tracks`);
      });
      console.log('💰 CSVs acumulados:', allCSVs.length);

      // 🔔 Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new Event('csvUploaded'));
      console.log('🔔 Evento csvUploaded disparado');

      // ✅ SOLO actualizar estado si el componente sigue montado
      if (isMountedRef.current) {
        setIsProcessing(false);
        setUploadStatus('success');
      }
    }, 2000);
  };

  const processTheOrchardData = (data: CSVRow[], releaseDate: string) => {
    console.log('🔍 PROCESANDO CSV - Primera fila para debug:', data[0]);
    console.log('🔍 Columnas disponibles:', Object.keys(data[0]));
    
    // Función para parsear números europeos (con comas como decimales)
    const parseEuropeanNumber = (value: string): number => {
      if (!value || value.trim() === '') return 0;
      
      // Eliminar símbolos de moneda y espacios
      let cleaned = value.replace(/[€$£\s]/g, '').trim();
      
      // Si tiene punto Y coma, asumir que punto es miles y coma es decimal (formato europeo)
      if (cleaned.includes('.') && cleaned.includes(',')) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      }
      // Si solo tiene coma, asumir que es decimal europeo
      else if (cleaned.includes(',') && !cleaned.includes('.')) {
        cleaned = cleaned.replace(',', '.');
      }
      // Si solo tiene punto, ya está en formato correcto
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };
    
    // Agrupar por artista
    const artistsMap = new Map<string, any>();
    const platformsMap = new Map<string, number>();
    const territoriesMap = new Map<string, number>();
    const periodsMap = new Map<string, number>();
    
    let totalRevenue = 0;
    let totalStreams = 0;

    // Función helper para buscar valores - MUY FLEXIBLE
    const getValue = (row: CSVRow, possibleNames: string[]): string => {
      // Crear mapa de columnas normalizadas
      const columnMap = new Map<string, string>();
      Object.keys(row).forEach(key => {
        const normalized = key.toLowerCase().trim().replace(/\s+/g, ' ');
        columnMap.set(normalized, key);
      });
      
      // Buscar entre todos los nombres posibles
      for (const name of possibleNames) {
        const normalized = name.toLowerCase().trim().replace(/\s+/g, ' ');
        const actualKey = columnMap.get(normalized);
        if (actualKey && row[actualKey] !== undefined && row[actualKey] !== '') {
          return String(row[actualKey]).trim();
        }
      }
      
      return '';
    };

    data.forEach((row, index) => {
      // Usar nombres flexibles para las columnas
      const artistName = getValue(row, [
        'Artist Name', 'Artist', 'artist name', 'artist', 'ARTIST NAME', 'ARTIST',
        'Nombre Artista', 'Artista'
      ]);
      
      const trackName = getValue(row, [
        'Track Name', 'Track', 'Song', 'track name', 'song', 'TRACK NAME', 'TRACK',
        'Nombre Canción', 'Canción'
      ]);
      
      const platform = getValue(row, [
        'DMS', 'Platform', 'Store', 'dms', 'platform', 'store'
      ]);
      
      const territory = getValue(row, [
        'Territory', 'Country', 'territory', 'country', 'TERRITORY', 'COUNTRY',
        'Territorio', 'País'
      ]);
      
      const period = getValue(row, [
        'Period', 'Activity Period', 'Date', 'period', 'activity period', 'date', 'PERIOD',
        'Período', 'Periodo', 'Fecha'
      ]);
      
      const quantityStr = getValue(row, [
        'Quantity', 'Streams', 'Units', 'quantity', 'streams', 'units', 'QUANTITY',
        'Cantidad', 'Reproducciones'
      ]);
      
      const revenueStr = getValue(row, [
        'Label Share Net Receipts', 'Revenue', 'Amount', 'Net Receipts', 
        'label share net receipts', 'revenue', 'amount', 'net receipts',
        'LABEL SHARE NET RECEIPTS', 'REVENUE', 'Ingresos', 'Importe'
      ]);
      
      const releaseName = getValue(row, [
        'Release Name', 'Album', 'Release', 'release name', 'album', 'RELEASE NAME', 'ALBUM',
        'Nombre Release', 'Álbum'
      ]);
      
      const isrc = getValue(row, [
        'ISRC', 'isrc'
      ]);
      
      const transType = getValue(row, [
        'Trans Type', 'Transaction Type', 'Type', 'trans type', 'TRANS TYPE',
        'Tipo Transacción', 'Tipo'
      ]);
      
      const currency = getValue(row, [
        'Preferred Currency', 'Currency', 'preferred currency', 'currency', 'CURRENCY',
        'Moneda'
      ]);

      // Solo procesar si tenemos al menos artista
      if (!artistName) {
        if (index < 5) console.warn(`⚠️ Fila ${index} sin nombre de artista, ignorando...`);
        return;
      }

      // PARSEAR NÚMEROS EN FORMATO EUROPEO
      const quantity = parseEuropeanNumber(quantityStr);
      const revenue = parseEuropeanNumber(revenueStr);

      // Log para las primeras 3 filas
      if (index < 3) {
        console.log(`📊 Fila ${index}:`, {
          artistName,
          trackName,
          platform,
          territory,
          period,
          quantityStr,
          quantity,
          revenueStr,
          revenue: revenue.toFixed(2)
        });
      }

      // Acumular totales globales
      totalRevenue += revenue;
      totalStreams += quantity;

      // Agrupar por plataforma
      platformsMap.set(platform || 'Otras', (platformsMap.get(platform || 'Otras') || 0) + revenue);

      // Agrupar por territorio
      territoriesMap.set(territory || 'Otros', (territoriesMap.get(territory || 'Otros') || 0) + revenue);

      // Agrupar por período
      periodsMap.set(period || 'Sin Fecha', (periodsMap.get(period || 'Sin Fecha') || 0) + revenue);

      // Agrupar por artista
      if (!artistsMap.has(artistName)) {
        artistsMap.set(artistName, {
          name: artistName,
          totalRevenue: 0,
          totalStreams: 0,
          tracks: new Map<string, any>(),
          platforms: new Map<string, number>(),
          territories: new Map<string, number>(),
          periods: new Map<string, number>()
        });
      }

      const artist = artistsMap.get(artistName);
      artist.totalRevenue += revenue;
      artist.totalStreams += quantity;

      // Agrupar por track dentro del artista
      const trackKey = trackName || 'Sin Título';
      if (!artist.tracks.has(trackKey)) {
        artist.tracks.set(trackKey, {
          name: trackKey,
          release: releaseName || 'Sin Release',
          isrc: isrc || '',
          releaseDate: releaseDate || '',
          revenue: 0,
          streams: 0,
          platforms: new Map<string, any>()
        });
      }

      const track = artist.tracks.get(trackKey);
      track.revenue += revenue;
      track.streams += quantity;

      // Datos por plataforma dentro del track
      const platformKey = platform || 'Otras';
      if (!track.platforms.has(platformKey)) {
        track.platforms.set(platformKey, {
          revenue: 0,
          streams: 0,
          details: []
        });
      }

      const trackPlatform = track.platforms.get(platformKey);
      trackPlatform.revenue += revenue;
      trackPlatform.streams += quantity;
      trackPlatform.details.push({
        period: period || 'Sin Fecha',
        territory: territory || 'Otros',
        quantity,
        revenue,
        transType,
        currency
      });

      // Plataformas del artista
      artist.platforms.set(platformKey, (artist.platforms.get(platformKey) || 0) + revenue);
      artist.territories.set(territory || 'Otros', (artist.territories.get(territory || 'Otros') || 0) + revenue);
      artist.periods.set(period || 'Sin Fecha', (artist.periods.get(period || 'Sin Fecha') || 0) + revenue);
    });

    console.log('✅ PROCESAMIENTO COMPLETADO');
    console.log('📊 Artistas encontrados:', Array.from(artistsMap.keys()));
    console.log('💰 Total Revenue:', totalRevenue.toFixed(2), '€');
    console.log('🎵 Total Streams:', totalStreams.toLocaleString('es-ES'));

    // Convertir Maps a Arrays
    const artists = Array.from(artistsMap.values()).map(artist => ({
      ...artist,
      tracks: Array.from(artist.tracks.values()).map(track => ({
        ...track,
        platforms: Array.from(track.platforms.entries()).map(([name, data]) => ({
          name,
          ...data
        }))
      })),
      platforms: Array.from(artist.platforms.entries()).map(([name, revenue]) => ({
        name,
        revenue
      })),
      territories: Array.from(artist.territories.entries()).map(([name, revenue]) => ({
        name,
        revenue
      })),
      periods: Array.from(artist.periods.entries()).map(([period, revenue]) => ({
        period,
        revenue
      }))
    }));

    const platforms = Array.from(platformsMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const territories = Array.from(territoriesMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const periods = Array.from(periodsMap.entries())
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Calcular royalties por artista (asumiendo 50% por defecto)
    const royalties = artists.map(artist => {
      const royaltyPercentage = 0.50; // 50% por defecto
      const artistRoyalty = artist.totalRevenue * royaltyPercentage;
      const labelShare = artist.totalRevenue * (1 - royaltyPercentage);

      return {
        artistName: artist.name,
        totalRevenue: artist.totalRevenue,
        totalStreams: artist.totalStreams,
        royaltyPercentage: royaltyPercentage * 100,
        artistRoyalty: artistRoyalty,
        labelShare: labelShare,
        trackCount: artist.tracks.length,
        topTrack: artist.tracks.sort((a, b) => b.revenue - a.revenue)[0],
        platforms: artist.platforms,
        periods: artist.periods
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    return {
      stats: {
        totalRevenue,
        totalStreams,
        totalArtists: artists.length,
        totalTracks: artists.reduce((sum, a) => sum + a.tracks.length, 0),
        platforms,
        territories,
        periods,
        topArtists: [...artists].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)
      },
      royalties,
      artists
    };
  };

  const handleReset = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Upload size={32} color="#c9a574" />
          Subir Archivo CSV
        </h1>
        <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
          Carga archivos CSV de The Orchard para procesar royalties automáticamente
        </p>
      </div>

      {/* Zona de carga */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: isDragging
            ? 'linear-gradient(135deg, rgba(201, 165, 116, 0.2) 0%, rgba(201, 165, 116, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
          border: isDragging
            ? '2px dashed #c9a574'
            : '2px dashed rgba(201, 165, 116, 0.3)',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '32px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(201, 165, 116, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Upload size={40} color="#c9a574" />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
          {file ? file.name : 'Arrastra tu archivo CSV aquí'}
        </h2>

        <p style={{ fontSize: '16px', color: '#AFB3B7', marginBottom: '16px' }}>
          {file
            ? `${formatFileSize(file.size)} • ${csvData.length} filas`
            : 'o haz clic para seleccionar un archivo'}
        </p>

        {!file && (
          <div
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '8px',
            }}
          >
            Seleccionar Archivo
          </div>
        )}
      </div>

      {/* Información del archivo */}
      {file && csvData.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
            border: '1px solid rgba(201, 165, 116, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <FileText size={24} color="#c9a574" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                Archivo cargado correctamente
              </h3>
              <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
                {csvData.length} registros encontrados • {headers.length} columnas
              </p>
            </div>
          </div>

          {/* Preview de columnas */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#c9a574', fontWeight: '600', marginBottom: '12px' }}>
              Columnas detectadas:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {headers.map((header, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    border: '1px solid rgba(201, 165, 116, 0.3)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ffffff',
                  }}
                >
                  {header}
                </div>
              ))}
            </div>
          </div>

          {/* Preview de datos */}
          <div>
            <p style={{ fontSize: '14px', color: '#c9a574', fontWeight: '600', marginBottom: '12px' }}>
              Vista previa (primeras 3 filas):
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        style={{
                          padding: '12px',
                          background: 'rgba(201, 165, 116, 0.1)',
                          borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#c9a574',
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 3).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                            fontSize: '13px',
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de estado */}
      {uploadStatus === 'success' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <Check size={24} color="#22c55e" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e', marginBottom: '2px' }}>
              Archivo procesado exitosamente
            </p>
            <p style={{ fontSize: '13px', color: '#AFB3B7' }}>
              Los royalties han sido calculados y están listos para revisión
            </p>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={24} color="#ef4444" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', marginBottom: '2px' }}>
              Error al procesar el archivo
            </p>
            <p style={{ fontSize: '13px', color: '#AFB3B7' }}>
              {errorMessage || 'Por favor, verifica el formato del archivo CSV'}
            </p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      {file && csvData.length > 0 && (
        <>
          {/* Campo de fecha de lanzamiento */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
            border: '1px solid rgba(201, 165, 116, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#c9a574',
              marginBottom: '12px'
            }}>
              Fecha de Lanzamiento del Release (opcional)
            </label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(42, 63, 63, 0.4)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#AFB3B7',
              marginTop: '8px',
              fontStyle: 'italic'
            }}>
              Esta fecha se asociará con todos los releases de este CSV
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={handleReset}
              disabled={isProcessing}
              style={{
                flex: '1',
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: 'rgba(201, 165, 116, 0.1)',
                border: '1px solid rgba(201, 165, 116, 0.3)',
                borderRadius: '12px',
                color: '#c9a574',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              <X size={20} />
              Cancelar
            </button>

            <button
              onClick={handleUpload}
              disabled={isProcessing || uploadStatus === 'success'}
              style={{
                flex: '1',
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                background:
                  isProcessing || uploadStatus === 'success'
                    ? 'rgba(201, 165, 116, 0.5)'
                    : 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isProcessing || uploadStatus === 'success' ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow:
                  isProcessing || uploadStatus === 'success'
                    ? 'none'
                    : '0 4px 12px rgba(201, 165, 116, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!isProcessing && uploadStatus !== 'success') {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 165, 116, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing && uploadStatus !== 'success') {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.3)';
                }
              }}
            >
              {isProcessing ? (
                <>Procesando...</>
              ) : uploadStatus === 'success' ? (
                <>
                  <Check size={20} />
                  Procesado
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Procesar y Subir
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Información adicional */}
      <div
        style={{
          marginTop: '32px',
          padding: '20px',
          background: 'rgba(42, 63, 63, 0.3)',
          border: '1px solid rgba(201, 165, 116, 0.2)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={20} color="#c9a574" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
              Formato del archivo CSV
            </p>
            <ul style={{ fontSize: '13px', color: '#AFB3B7', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '4px' }}>El archivo debe estar en formato CSV (separado por comas)</li>
              <li style={{ marginBottom: '4px' }}>La primera fila debe contener los nombres de las columnas</li>
              <li style={{ marginBottom: '4px' }}>Formato compatible con The Orchard</li>
              <li>Tamaño máximo recomendado: 10 MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}