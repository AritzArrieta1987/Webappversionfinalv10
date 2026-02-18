import { useState, useEffect } from 'react';
import { PhysicalSalesSection } from '../components/admin/PhysicalSalesSection';

export function PhysicalSalesPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar artistas desde localStorage
  useEffect(() => {
    const loadArtists = () => {
      const savedArtists = JSON.parse(localStorage.getItem('artists') || '[]');
      setArtists(savedArtists);
    };
    loadArtists();

    // Escuchar cambios en artistas
    const handleStorageChange = () => loadArtists();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('artistsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('artistsUpdated', handleStorageChange);
    };
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <h1 style={{
          fontSize: isMobile ? '28px' : '32px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '8px'
        }}>
          Ventas Físicas
        </h1>
        <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
          Gestión de discos físicos, vinilos, camisetas y merchandising
        </p>
      </div>

      {/* Componente de Ventas Físicas */}
      <PhysicalSalesSection artists={artists} isMobile={isMobile} />
    </div>
  );
}
