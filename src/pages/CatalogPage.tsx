import { Music, Search, Disc, Play, Pause, Volume2, SkipBack, SkipForward, Upload, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState([]);
  const [filterArtist, setFilterArtist] = useState('all');
  const [artists, setArtists] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploadingTrackId, setUploadingTrackId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadTracksFromCSV();
    
    // 🔄 Escuchar cuando se sube un nuevo CSV
    const handleCSVUploaded = () => {
      console.log('🔔 CatalogPage: Detectado nuevo CSV, recargando tracks...');
      loadTracksFromCSV();
    };
    
    window.addEventListener('csvUploaded', handleCSVUploaded);
    
    return () => {
      window.removeEventListener('csvUploaded', handleCSVUploaded);
    };
  }, []);

  useEffect(() => {
    // Cargar audios desde localStorage
    const savedAudios = JSON.parse(localStorage.getItem('trackAudios') || '{}');
    setTracks(prevTracks => prevTracks.map(track => ({
      ...track,
      audioUrl: savedAudios[track.id] || null
    })));
  }, []);

  const loadTracksFromCSV = () => {
    // Cargar datos del CSV procesado
    const uploadedCSVs = JSON.parse(localStorage.getItem('uploadedCSVs') || '[]');
    const savedAudios = JSON.parse(localStorage.getItem('trackAudios') || '{}');
    
    console.log('🎵 Catálogo: Cargando tracks de', uploadedCSVs.length, 'CSVs');
    
    if (uploadedCSVs.length > 0) {
      // ✅ COMBINAR TRACKS DE TODOS LOS CSVs
      const allTracks = [];
      const artistNames = new Set();
      const tracksMap = new Map(); // Para evitar duplicados por ISRC
      
      uploadedCSVs.forEach((csv, csvIndex) => {
        if (csv.processedData && csv.processedData.artists) {
          console.log(`📁 CSV ${csvIndex + 1}: ${csv.fileName}, ${csv.processedData.artists.length} artistas`);
          
          csv.processedData.artists.forEach(artist => {
            artistNames.add(artist.name);
            
            artist.tracks.forEach(track => {
              const trackId = track.isrc || `${artist.name}-${track.name}`;
              
              // Si el track ya existe (mismo ISRC), combinar datos
              if (tracksMap.has(trackId)) {
                const existing = tracksMap.get(trackId);
                existing.revenue += track.revenue || 0;
                existing.streams += track.streams || 0;
                
                // Combinar plataformas
                if (track.platforms) {
                  Object.entries(track.platforms).forEach(([platform, data]) => {
                    if (existing.platforms[platform]) {
                      existing.platforms[platform].revenue += data.revenue || 0;
                      existing.platforms[platform].streams += data.streams || 0;
                    } else {
                      existing.platforms[platform] = { ...data };
                    }
                  });
                }
              } else {
                // Nuevo track
                tracksMap.set(trackId, {
                  id: trackId,
                  name: track.name,
                  artistName: artist.name,
                  release: track.release,
                  isrc: track.isrc,
                  revenue: track.revenue || 0,
                  streams: track.streams || 0,
                  platforms: track.platforms ? { ...track.platforms } : {},
                  audioUrl: savedAudios[trackId] || null
                });
              }
            });
          });
        }
      });
      
      // Convertir Map a array
      const combinedTracks = Array.from(tracksMap.values());
      
      console.log('✅ Total tracks combinados:', combinedTracks.length);
      console.log('👥 Artistas únicos:', artistNames.size);
      
      setTracks(combinedTracks);
      setArtists(['all', ...Array.from(artistNames)]);
    }
  };

  const handleAudioUpload = (trackId, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audioUrl = e.target.result;
        
        // Guardar en localStorage
        const savedAudios = JSON.parse(localStorage.getItem('trackAudios') || '{}');
        savedAudios[trackId] = audioUrl;
        localStorage.setItem('trackAudios', JSON.stringify(savedAudios));
        
        // 🔔 Disparar evento para notificar a otros componentes
        window.dispatchEvent(new Event('trackAudioUploaded'));
        console.log('🔔 Audio subido, evento disparado para trackId:', trackId);
        
        // Actualizar tracks
        setTracks(prevTracks => prevTracks.map(track => 
          track.id === trackId ? { ...track, audioUrl } : track
        ));
        
        setUploadingTrackId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const playTrack = (track) => {
    if (!track.audioUrl) {
      setUploadingTrackId(track.id);
      return;
    }

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
        }
      }, 100);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playNext = () => {
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < filteredTracks.length - 1) {
      const nextTrack = filteredTracks[currentIndex + 1];
      if (nextTrack.audioUrl) {
        playTrack(nextTrack);
      }
    }
  };

  const playPrevious = () => {
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      const prevTrack = filteredTracks[currentIndex - 1];
      if (prevTrack.audioUrl) {
        playTrack(prevTrack);
      }
    }
  };

  // Filtrar canciones
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = 
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.release.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.isrc.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArtist = filterArtist === 'all' || track.artistName === filterArtist;
    
    return matchesSearch && matchesArtist;
  });

  return (
    <div>
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
          <Music size={32} color="#c9a574" />
          Catálogo Musical
        </h1>
        <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
          Gestiona todas las canciones y álbumes de tus artistas
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}>
        {/* Búsqueda */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <div style={{
            position: 'relative',
            background: 'rgba(42, 63, 63, 0.4)',
            border: '1px solid rgba(201, 165, 116, 0.2)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <Search
              size={20}
              color="#c9a574"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
            <input
              type="text"
              placeholder="Buscar canciones, artistas, álbumes, ISRC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Filtro por artista */}
        <select
          value={filterArtist}
          onChange={(e) => setFilterArtist(e.target.value)}
          style={{
            padding: '14px 16px',
            background: 'rgba(42, 63, 63, 0.4)',
            border: '1px solid rgba(201, 165, 116, 0.2)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="all">Todos los artistas</option>
          {artists.filter(a => a !== 'all').map(artist => (
            <option key={artist} value={artist}>{artist}</option>
          ))}
        </select>
      </div>

      {/* Lista de canciones */}
      {filteredTracks.length > 0 ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          overflowX: 'auto'
        }}>
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
                  Canción
                </th>
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
                  textAlign: 'left'
                }}>
                  Álbum/Release
                </th>
                <th style={{
                  padding: '12px',
                  background: 'rgba(201, 165, 116, 0.1)',
                  borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#c9a574',
                  textAlign: 'left'
                }}>
                  ISRC
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
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map((track, index) => (
                <tr key={track.id || index} style={{
                  background: currentTrack?.id === track.id ? 'rgba(201, 165, 116, 0.1)' : 'transparent'
                }}>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                    fontSize: '14px',
                    color: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => playTrack(track)}
                        style={{
                          background: track.audioUrl ? 'rgba(201, 165, 116, 0.2)' : 'rgba(201, 165, 116, 0.1)',
                          border: '1px solid #c9a574',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(201, 165, 116, 0.4)'}
                        onMouseOut={(e) => e.currentTarget.style.background = track.audioUrl ? 'rgba(201, 165, 116, 0.2)' : 'rgba(201, 165, 116, 0.1)'}
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause size={16} color="#c9a574" />
                        ) : track.audioUrl ? (
                          <Play size={16} color="#c9a574" />
                        ) : (
                          <Upload size={16} color="#c9a574" />
                        )}
                      </button>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleAudioUpload(track.id, e)}
                        style={{ display: 'none' }}
                        id={`audio-upload-${track.id}`}
                      />
                      {track.name}
                      {!track.audioUrl && (
                        <label
                          htmlFor={`audio-upload-${track.id}`}
                          style={{ 
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#c9a574',
                            marginLeft: '8px',
                            padding: '2px 8px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            borderRadius: '4px',
                            border: '1px solid rgba(201, 165, 116, 0.3)'
                          }}
                        >
                          Cargar audio
                        </label>
                      )}
                    </div>
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                    fontSize: '14px',
                    color: '#AFB3B7'
                  }}>
                    {track.artistName}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                    fontSize: '14px',
                    color: '#AFB3B7'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Disc size={14} color="#c9a574" />
                      {track.release}
                    </div>
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                    fontSize: '12px',
                    color: '#c9a574',
                    fontFamily: 'monospace'
                  }}>
                    {track.isrc || 'N/A'}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                    fontSize: '14px',
                    color: '#AFB3B7',
                    textAlign: 'right'
                  }}>
                    {track.streams.toLocaleString('es-ES')}
                  </td>
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(201, 165, 116, 0.1)',
                    fontSize: '14px',
                    color: '#22c55e',
                    fontWeight: '600',
                    textAlign: 'right'
                  }}>
                    ${track.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.2)',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <Music size={64} color="#c9a574" style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>
            No se encontraron canciones
          </h2>
          <p style={{ fontSize: '16px', color: '#AFB3B7' }}>
            {tracks.length === 0 
              ? 'Sube un archivo CSV para ver el catálogo musical' 
              : 'Intenta con otros términos de búsqueda'}
          </p>
        </div>
      )}

      {/* Reproductor */}
      {currentTrack && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <SkipBack size={24} color="#c9a574" onClick={playPrevious} />
              {isPlaying ? (
                <Pause size={48} color="#c9a574" onClick={() => playTrack(currentTrack)} />
              ) : (
                <Play size={48} color="#c9a574" onClick={() => playTrack(currentTrack)} />
              )}
              <SkipForward size={24} color="#c9a574" onClick={playNext} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Volume2 size={24} color="#c9a574" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioRef.current ? audioRef.current.volume : 1}
                onChange={(e) => audioRef.current && (audioRef.current.volume = parseFloat(e.target.value))}
                style={{
                  width: '100px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ width: '100%', height: '4px', background: 'rgba(201, 165, 116, 0.1)' }}>
              <div
                style={{
                  width: `${(currentTime / duration) * 100}%`,
                  height: '100%',
                  background: '#c9a574',
                  cursor: 'pointer'
                }}
                onClick={handleSeek}
              />
            </div>
            <div style={{ marginLeft: '8px', fontSize: '12px', color: '#AFB3B7' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          <audio
            ref={audioRef}
            src={currentTrack.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            style={{ display: 'none' }}
          />
          {uploadingTrackId === currentTrack.id && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              padding: '16px',
              color: '#ffffff',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              <Upload size={24} color="#c9a574" style={{ marginBottom: '8px' }} />
              Subiendo audio...
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleAudioUpload(currentTrack.id, e)}
                style={{ display: 'none' }}
                ref={el => el && el.click()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}