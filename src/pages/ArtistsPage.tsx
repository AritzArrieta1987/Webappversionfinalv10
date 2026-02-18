import { Users, Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ArtistCard } from '../components/admin/ArtistCard';
import { AddArtistModal } from '../components/admin/AddArtistModal';

export function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Cargar artistas desde localStorage (del CSV procesado)
  useEffect(() => {
    loadArtistsFromCSV();
  }, []);

  const loadArtistsFromCSV = () => {
    // Cargar artistas existentes
    const existingArtists = JSON.parse(localStorage.getItem('artists') || '[]');
    
    // Cargar datos del CSV procesado
    const uploadedCSVs = JSON.parse(localStorage.getItem('uploadedCSVs') || '[]');
    
    if (uploadedCSVs.length > 0 && uploadedCSVs[0].processedData) {
      const processedData = uploadedCSVs[0].processedData;
      const csvArtists = processedData.artists || [];
      
      // Crear o actualizar artistas desde el CSV
      const artistsMap = new Map();
      
      // Agregar artistas existentes al mapa
      existingArtists.forEach(artist => {
        artistsMap.set(artist.name, artist);
      });
      
      // Agregar/actualizar artistas del CSV
      csvArtists.forEach(csvArtist => {
        if (!artistsMap.has(csvArtist.name)) {
          // Crear nuevo artista desde el CSV
          const newArtist = {
            id: Date.now() + Math.random(),
            name: csvArtist.name,
            email: `${csvArtist.name.toLowerCase().replace(/\s+/g, '.')}@artist.com`,
            phone: '+34 600 000 000',
            photo: '',
            bio: `Artista con ${csvArtist.tracks.length} canciones en el catálogo`,
            contractType: 'percentage',
            contractPercentage: 50,
            contractDetails: 'Contrato estándar - 50% royalties',
            joinDate: new Date().toISOString().split('T')[0],
            status: 'active',
            totalRevenue: csvArtist.totalRevenue,
            totalStreams: csvArtist.totalStreams,
            trackCount: csvArtist.tracks.length,
            csvData: csvArtist // Guardar datos completos del CSV
          };
          artistsMap.set(csvArtist.name, newArtist);
        } else {
          // Actualizar artista existente con datos del CSV
          const existingArtist = artistsMap.get(csvArtist.name);
          existingArtist.totalRevenue = csvArtist.totalRevenue;
          existingArtist.totalStreams = csvArtist.totalStreams;
          existingArtist.trackCount = csvArtist.tracks.length;
          existingArtist.csvData = csvArtist;
        }
      });
      
      const updatedArtists = Array.from(artistsMap.values());
      setArtists(updatedArtists);
      
      // Guardar artistas actualizados en localStorage
      localStorage.setItem('artists', JSON.stringify(updatedArtists));
    } else {
      setArtists(existingArtists);
    }
  };

  // Filtrar artistas por búsqueda
  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArtist = (newArtist: any) => {
    const updatedArtists = [...artists, newArtist];
    setArtists(updatedArtists);
    localStorage.setItem('artists', JSON.stringify(updatedArtists));
    setShowAddModal(false);
  };

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
          <Users size={32} color="#c9a574" />
          Gestión de Artistas
        </h1>
        <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
          Administra la información y contratos de tus artistas
        </p>
      </div>

      {/* Barra de acciones */}
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
              placeholder="Buscar artistas..."
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

        {/* Botón agregar artista */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 165, 116, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.3)';
          }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Agregar Artista
        </button>
      </div>

      {/* Grid de tarjetas de artistas */}
      {filteredArtists.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {filteredArtists.map(artist => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => console.log('Ver detalles de', artist.name)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.2)',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <Search size={48} color="#c9a574" style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
            No se encontraron artistas
          </h3>
          <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {/* Modal para agregar artista */}
      <AddArtistModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddArtist}
      />
    </div>
  );
}