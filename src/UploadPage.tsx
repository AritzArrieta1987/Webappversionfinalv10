import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Calendar } from 'lucide-react';

interface ParsedRow {
  sale_month: string;
  artist_name: string;
  release_title: string;
  track_title: string;
  isrc: string;
  upc: string;
  catalog_number: string;
  label_name: string;
  quantity: number;
  gross_revenue: number;
  currency: string;
  country: string;
  dsp: string;
  asset_type: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError('');
      parseCSVPreview(droppedFile);
    } else {
      setError('Por favor, sube un archivo CSV válido');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        parseCSVPreview(selectedFile);
      } else {
        setError('Por favor, sube un archivo CSV válido');
        setFile(null);
      }
    }
  };

  const parseNumber = (value: string): number => {
    if (!value || value.trim() === '') return 0;
    
    const cleaned = value.trim().replace(/[^\d,.-]/g, '');
    
    const commaCount = (cleaned.match(/,/g) || []).length;
    const dotCount = (cleaned.match(/\./g) || []).length;
    
    let normalized = cleaned;
    
    if (commaCount > 0 && dotCount > 0) {
      const lastCommaPos = cleaned.lastIndexOf(',');
      const lastDotPos = cleaned.lastIndexOf('.');
      
      if (lastCommaPos > lastDotPos) {
        normalized = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = cleaned.replace(/,/g, '');
      }
    } else if (commaCount > 0) {
      if (commaCount === 1 && cleaned.indexOf(',') > cleaned.length - 4) {
        normalized = cleaned.replace(',', '.');
      } else {
        normalized = cleaned.replace(/,/g, '');
      }
    }
    
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  const parseCSVPreview = async (csvFile: File) => {
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setError('El archivo CSV está vacío o no tiene datos');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows: ParsedRow[] = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        const row: ParsedRow = {
          sale_month: values[headers.indexOf('Sale Month')] || '',
          artist_name: values[headers.indexOf('Artist')] || '',
          release_title: values[headers.indexOf('Release')] || '',
          track_title: values[headers.indexOf('Track Title')] || '',
          isrc: values[headers.indexOf('ISRC')] || '',
          upc: values[headers.indexOf('UPC')] || '',
          catalog_number: values[headers.indexOf('Catalog Number')] || '',
          label_name: values[headers.indexOf('Label Name')] || '',
          quantity: parseNumber(values[headers.indexOf('Quantity')] || '0'),
          gross_revenue: parseNumber(values[headers.indexOf('Customer Price')] || '0'),
          currency: values[headers.indexOf('Customer Currency')] || 'EUR',
          country: values[headers.indexOf('Sale Country')] || '',
          dsp: values[headers.indexOf('DSP')] || '',
          asset_type: values[headers.indexOf('Asset Type')] || ''
        };

        rows.push(row);
      }

      setPreviewData(rows);
      setShowPreview(true);
    } catch (err) {
      console.error('Error parsing CSV preview:', err);
      setError('Error al previsualizar el archivo CSV');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo CSV');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append('file', file);
    if (releaseDate) {
      formData.append('releaseDate', releaseDate);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('https://api.bigartist.es/api/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setMessage(data.message || '✅ Archivo subido exitosamente');
      setFile(null);
      setShowPreview(false);
      setPreviewData([]);
      setReleaseDate('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setMessage('');
      }, 5000);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('La carga fue cancelada');
      } else {
        console.error('Error uploading file:', err);
        setError(err.message || 'Error al subir el archivo. Por favor, intenta de nuevo.');
      }
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const clearFile = () => {
    setFile(null);
    setShowPreview(false);
    setPreviewData([]);
    setError('');
    setMessage('');
    setReleaseDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{
      padding: window.innerWidth < 768 ? '16px' : '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        background: '#1a2828',
        borderRadius: '12px',
        padding: window.innerWidth < 768 ? '20px' : '32px',
        marginBottom: '24px',
        border: '1px solid rgba(201, 165, 116, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <Upload size={28} style={{ color: '#c9a574' }} />
          <h1 style={{
            fontSize: window.innerWidth < 768 ? '24px' : '32px',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
          }}>
            Subir Archivo CSV
          </h1>
        </div>

        <p style={{
          color: '#a0a0a0',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Sube archivos CSV de The Orchard para importar datos de ventas y royalties.
          Los datos se acumularán con importaciones anteriores.
        </p>

        {/* Release Date Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#c9a574',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            <Calendar size={18} />
            Fecha de Lanzamiento del Release (opcional)
          </label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '12px 16px',
              background: '#0f1818',
              border: '2px solid rgba(201, 165, 116, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#c9a574';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
            }}
          />
          <p style={{
            color: '#808080',
            fontSize: '12px',
            marginTop: '6px',
            fontStyle: 'italic'
          }}>
            Si se especifica, se asociará a todos los tracks del CSV
          </p>
        </div>

        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#c9a574' : 'rgba(201, 165, 116, 0.3)'}`,
            borderRadius: '12px',
            padding: window.innerWidth < 768 ? '32px 16px' : '48px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? 'rgba(201, 165, 116, 0.05)' : 'transparent',
            transition: 'all 0.3s ease',
            marginBottom: '24px'
          }}
        >
          <FileText
            size={48}
            style={{
              color: isDragging ? '#c9a574' : 'rgba(201, 165, 116, 0.5)',
              margin: '0 auto 16px',
              display: 'block'
            }}
          />
          <p style={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            {file ? file.name : 'Arrastra y suelta tu archivo CSV aquí'}
          </p>
          <p style={{
            color: '#808080',
            fontSize: '14px'
          }}>
            o haz clic para seleccionar un archivo
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {file && !uploading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'rgba(201, 165, 116, 0.1)',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid rgba(201, 165, 116, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1,
              minWidth: 0
            }}>
              <FileText size={24} style={{ color: '#c9a574', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {file.name}
                </p>
                <p style={{
                  color: '#808080',
                  fontSize: '12px',
                  margin: 0
                }}>
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#808080',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#808080';
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Preview Table */}
        {showPreview && previewData.length > 0 && (
          <div style={{
            marginBottom: '24px',
            background: '#0f1818',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(201, 165, 116, 0.1)',
            overflowX: 'auto'
          }}>
            <h3 style={{
              color: '#c9a574',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Vista Previa (primeras 5 filas)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                minWidth: '800px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(201, 165, 116, 0.2)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#c9a574', fontWeight: '600' }}>Mes</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#c9a574', fontWeight: '600' }}>Artista</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#c9a574', fontWeight: '600' }}>Track</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#c9a574', fontWeight: '600' }}>ISRC</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#c9a574', fontWeight: '600' }}>Cantidad</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#c9a574', fontWeight: '600' }}>Revenue</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#c9a574', fontWeight: '600' }}>DSP</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(201, 165, 116, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      <td style={{ padding: '10px', color: '#a0a0a0' }}>{row.sale_month}</td>
                      <td style={{ padding: '10px', color: '#ffffff' }}>{row.artist_name}</td>
                      <td style={{ padding: '10px', color: '#ffffff' }}>{row.track_title}</td>
                      <td style={{ padding: '10px', color: '#a0a0a0', fontSize: '12px' }}>{row.isrc}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#ffffff' }}>{row.quantity.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#c9a574', fontWeight: '500' }}>
                        {row.gross_revenue.toFixed(2)} {row.currency}
                      </td>
                      <td style={{ padding: '10px', color: '#a0a0a0' }}>{row.dsp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p style={{ color: '#ef4444', margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
            <p style={{ color: '#22c55e', margin: 0, fontSize: '14px' }}>{message}</p>
          </div>
        )}

        {/* Upload Button */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row'
        }}>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              flex: 1,
              padding: '14px 24px',
              background: (!file || uploading) ? '#4a4a4a' : '#c9a574',
              color: (!file || uploading) ? '#808080' : '#1a2828',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (file && !uploading) {
                e.currentTarget.style.background = '#d4b589';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 165, 116, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (file && !uploading) {
                e.currentTarget.style.background = '#c9a574';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {uploading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Subiendo archivo...
              </>
            ) : (
              <>
                <Upload size={20} />
                Subir CSV
              </>
            )}
          </button>

          {uploading && (
            <button
              onClick={cancelUpload}
              style={{
                padding: '14px 24px',
                background: 'transparent',
                color: '#ef4444',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: window.innerWidth < 768 ? 'auto' : '150px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={20} />
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: '#1a2828',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(201, 165, 116, 0.1)'
        }}>
          <h3 style={{
            color: '#c9a574',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            📋 Formato Soportado
          </h3>
          <p style={{
            color: '#a0a0a0',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Archivos CSV de The Orchard con columnas estándar: Sale Month, Artist, Release, Track Title, ISRC, UPC, Quantity, Customer Price, DSP, etc.
          </p>
        </div>

        <div style={{
          background: '#1a2828',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(201, 165, 116, 0.1)'
        }}>
          <h3 style={{
            color: '#c9a574',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            🔄 Acumulación de Datos
          </h3>
          <p style={{
            color: '#a0a0a0',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Los datos se suman automáticamente. Si subes múltiples CSVs del mismo periodo, las cantidades y revenues se acumularán correctamente.
          </p>
        </div>

        <div style={{
          background: '#1a2828',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(201, 165, 116, 0.1)'
        }}>
          <h3 style={{
            color: '#c9a574',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            🌍 Formato Europeo
          </h3>
          <p style={{
            color: '#a0a0a0',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Compatible con formato europeo (coma decimal: 1.234,56) y americano (punto decimal: 1,234.56). El sistema detecta automáticamente el formato.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
