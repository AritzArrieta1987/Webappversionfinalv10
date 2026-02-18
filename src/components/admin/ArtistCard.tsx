import { User, Calendar, FileText } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNavigate } from 'react-router';

interface ArtistCardProps {
  artist: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    contractType?: string;
    joinDate?: string;
    totalEarnings?: number;
  };
  onClick?: () => void;
}

export function ArtistCard({ artist, onClick }: ArtistCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Navegar al portal del artista
    navigate(`/artist/${artist.id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.4) 0%, rgba(30, 47, 47, 0.6) 100%)',
        border: '1px solid rgba(201, 165, 116, 0.2)',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(201, 165, 116, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
      }}
    >
      {/* Foto del artista */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '100%', // Aspect ratio 1:1
        background: 'linear-gradient(135deg, #2a3f3f 0%, #1e2f2f 100%)',
        overflow: 'hidden',
      }}>
        {artist.photo ? (
          <ImageWithFallback
            src={artist.photo}
            alt={artist.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
            <User size={64} color="#c9a574" style={{ opacity: 0.3 }} />
          </div>
        )}
        {/* Overlay gradiente */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
        }} />
      </div>

      {/* Información del artista */}
      <div style={{ padding: '20px' }}>
        {/* Nombre */}
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '12px',
          lineHeight: '1.2',
        }}>
          {artist.name}
        </h3>

        {/* Detalles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {artist.contractType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={14} color="#c9a574" />
              <span style={{ fontSize: '13px', color: '#AFB3B7' }}>
                {artist.contractType}
              </span>
            </div>
          )}

          {artist.joinDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} color="#c9a574" />
              <span style={{ fontSize: '13px', color: '#AFB3B7' }}>
                Desde {new Date(artist.joinDate).toLocaleDateString('es-ES', {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Ganancias totales */}
        {artist.totalEarnings !== undefined && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(201, 165, 116, 0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#AFB3B7', textTransform: 'uppercase' }}>
                Ganancias Totales
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#c9a574',
              }}>
                €{artist.totalEarnings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}