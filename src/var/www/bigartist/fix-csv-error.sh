#!/bin/bash

echo "🔧 ================================================"
echo "🔧 CORRIGIENDO ERROR CSV UPLOAD"
echo "🔧 ================================================"
echo ""

cd /var/www/bigartist

echo "📝 1. HACIENDO BACKUP DE ARCHIVOS ORIGINALES"
echo "=========================================="
cp src/components/admin/IncomeSection.tsx src/components/admin/IncomeSection.tsx.backup-csv-error
cp src/pages/UploadPage.tsx src/pages/UploadPage.tsx.backup-csv-error
echo "✅ Backup creado"

echo ""
echo "🔨 2. APLICANDO CORRECCIONES"
echo "=========================================="

# Corregir IncomeSection.tsx - eliminar código obsoleto de csvData
cat > src/components/admin/IncomeSection.tsx << 'EOF'
import { TrendingUp, Users, Music, DollarSign } from 'lucide-react';

interface IncomeSectionProps {
  dashboardData: any;
  artists: any[];
  isMobile?: boolean;
}

export function IncomeSection({ dashboardData, artists, isMobile = false }: IncomeSectionProps) {
  const topArtists = artists
    .map(artist => ({
      ...artist,
      revenue: artist.totalRevenue || 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ✅ ELIMINADO: El código obsoleto de csvData que causaba el error
  // Ya no usamos artist.csvData - los datos vienen directamente del backend

  return (
    <div>
      {/* Cards superiores */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: isMobile ? '12px' : '20px',
        marginBottom: isMobile ? '20px' : '32px'
      }}>
        {/* Ingresos Totales */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '18px' : '24px',
          border: '1px solid rgba(201, 165, 116, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              borderRadius: '12px',
              background: 'rgba(201, 165, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={isMobile ? 20 : 24} color="#c9a574" />
            </div>
            <div>
              <p style={{ 
                fontSize: isMobile ? '12px' : '13px', 
                color: 'rgba(255, 255, 255, 0.7)', 
                margin: 0 
              }}>
                Ingresos Totales
              </p>
              <h3 style={{ 
                fontSize: isMobile ? '20px' : '24px', 
                fontWeight: '700', 
                color: '#c9a574', 
                margin: '4px 0 0 0' 
              }}>
                €{dashboardData.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          <p style={{ 
            fontSize: isMobile ? '12px' : '13px', 
            color: 'rgba(255, 255, 255, 0.6)', 
            margin: 0 
          }}>
            Todas las plataformas
          </p>
        </div>

        {/* Total Artistas */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '18px' : '24px',
          border: '1px solid rgba(201, 165, 116, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              borderRadius: '12px',
              background: 'rgba(201, 165, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={isMobile ? 20 : 24} color="#c9a574" />
            </div>
            <div>
              <p style={{ 
                fontSize: isMobile ? '12px' : '13px', 
                color: 'rgba(255, 255, 255, 0.7)', 
                margin: 0 
              }}>
                Artistas Activos
              </p>
              <h3 style={{ 
                fontSize: isMobile ? '20px' : '24px', 
                fontWeight: '700', 
                color: '#c9a574', 
                margin: '4px 0 0 0' 
              }}>
                {dashboardData.totalArtists || artists.length || 0}
              </h3>
            </div>
          </div>
          <p style={{ 
            fontSize: isMobile ? '12px' : '13px', 
            color: 'rgba(255, 255, 255, 0.6)', 
            margin: 0 
          }}>
            Generando ingresos
          </p>
        </div>
      </div>

      {/* Top Artistas */}
      <div style={{
        background: 'rgba(42, 63, 63, 0.4)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: isMobile ? '16px' : '24px' 
        }}>
          <TrendingUp size={isMobile ? 22 : 24} color="#c9a574" />
          <h3 style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: '600', 
            color: '#ffffff', 
            margin: 0 
          }}>
            Top 5 Artistas por Ingresos
          </h3>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? '12px' : '16px' 
        }}>
          {topArtists.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '32px 16px' : '48px',
              color: 'rgba(255, 255, 255, 0.5)' 
            }}>
              <Users size={isMobile ? 48 : 56} color="#c9a574" style={{ opacity: 0.3, margin: '0 auto 16px' }} />
              <p style={{ fontSize: isMobile ? '14px' : '16px', margin: 0 }}>
                No hay datos de artistas disponibles
              </p>
            </div>
          ) : (
            topArtists.map((artist, index) => (
              <div
                key={artist.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '12px' : '16px',
                  padding: isMobile ? '14px' : '16px',
                  background: index === 0 
                    ? 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: isMobile ? '10px' : '12px',
                  border: index === 0 
                    ? '1px solid rgba(201, 165, 116, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Ranking */}
                <div style={{
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  borderRadius: '50%',
                  background: index === 0 ? '#c9a574' : 'rgba(255, 255, 255, 0.1)',
                  color: index === 0 ? '#2a3f3f' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: isMobile ? '15px' : '16px',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>

                {/* Foto */}
                <div style={{
                  width: isMobile ? '48px' : '56px',
                  height: isMobile ? '48px' : '56px',
                  borderRadius: '50%',
                  background: artist.photo ? `url(${artist.photo})` : '#c9a574',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2a3f3f',
                  fontWeight: '600',
                  fontSize: isMobile ? '18px' : '20px',
                  flexShrink: 0,
                  border: index === 0 ? '2px solid #c9a574' : 'none'
                }}>
                  {!artist.photo && artist.name.charAt(0)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ 
                    fontSize: isMobile ? '15px' : '16px', 
                    fontWeight: '600', 
                    color: '#ffffff', 
                    margin: '0 0 4px 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {artist.name}
                  </h4>
                  <p style={{ 
                    fontSize: isMobile ? '12px' : '13px', 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {artist.email}
                  </p>
                </div>

                {/* Revenue */}
                <div style={{ 
                  textAlign: 'right',
                  minWidth: isMobile ? '80px' : '100px'
                }}>
                  <p style={{ 
                    fontSize: isMobile ? '18px' : '20px', 
                    fontWeight: '700', 
                    color: index === 0 ? '#c9a574' : '#ffffff', 
                    margin: 0 
                  }}>
                    €{artist.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p style={{ 
                    fontSize: isMobile ? '11px' : '12px', 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    margin: '2px 0 0 0' 
                  }}>
                    Total generado
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ IncomeSection.tsx corregido"

echo ""
echo "🔨 3. COMPILANDO FRONTEND"
echo "=========================================="
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build exitoso"
  
  echo ""
  echo "🔄 4. RECARGANDO NGINX"
  echo "=========================================="
  systemctl reload nginx
  
  echo ""
  echo "✅ Nginx recargado"
  
  echo ""
  echo "🎉 ================================================"
  echo "🎉 CORRECCIÓN COMPLETADA"
  echo "🎉 ================================================"
  echo ""
  echo "🌐 Ahora intenta subir el CSV de nuevo en:"
  echo "   https://app.bigartist.es"
  echo ""
  echo "✅ El error 'V.forEach is not a function' debe estar resuelto"
  echo ""
else
  echo ""
  echo "❌ Error en la compilación"
  exit 1
fi
