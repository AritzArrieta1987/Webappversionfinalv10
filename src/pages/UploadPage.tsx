import { Upload, FileText, Check, X, AlertCircle, Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CSVRow {
  [key: string]: string;
}

const API_URL = 'https://app.bigartist.es';

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
  const isMountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Función helper para obtener el token JWT
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || '';
  };

  // Función helper para hacer fetch con autenticación
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

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

    const headerLine = lines[0];
    const parsedHeaders = headerLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
    console.log('📋 Headers encontrados:', parsedHeaders);
    setHeaders(parsedHeaders);

    const data: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

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
      values.push(currentValue.trim().replace(/^"|"$/g, ''));

      const row: CSVRow = {};
      parsedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
      
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
    setErrorMessage('');

    try {
      console.log('📤 Iniciando carga de CSV al backend...');
      console.log('📊 Total de filas:', csvData.length);

      // ✅ NUEVO: Enviar directamente al endpoint /api/csv-uploads con la estructura correcta
      const response = await authenticatedFetch(`${API_URL}/api/csv-uploads`, {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          csv_data: csvData  // ✅ Enviar el array parseado directamente
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al procesar el CSV');
      }

      console.log('✅ CSV procesado correctamente:', result.message);

      // 🔔 Disparar evento personalizado para actualizar el dashboard
      window.dispatchEvent(new Event('csvUploaded'));
      console.log('🔔 Evento csvUploaded disparado');

      if (isMountedRef.current) {
        setIsProcessing(false);
        setUploadStatus('success');
      }

    } catch (error) {
      console.error('❌ Error al procesar CSV:', error);
      if (isMountedRef.current) {
        setErrorMessage(error instanceof Error ? error.message : 'Error al procesar el archivo');
        setUploadStatus('error');
        setIsProcessing(false);
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setUploadStatus('idle');
    setErrorMessage('');
    setReleaseDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
          Subir Archivo CSV
        </h1>
        <p style={{ fontSize: '14px', color: '#AFB3B7' }}>
          Carga archivos CSV de The Orchard para procesar royalties automáticamente
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#c9a574' : 'rgba(201, 165, 116, 0.3)'}`,
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          background: isDragging
            ? 'rgba(201, 165, 116, 0.1)'
            : 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          marginBottom: '24px',
        }}
        onClick={() => fileInputRef.current?.click()}
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
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)',
          }}
        >
          <Upload size={32} color="#ffffff" />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
          {isDragging ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo CSV'}
        </h3>
        <p style={{ fontSize: '14px', color: '#AFB3B7', marginBottom: '16px' }}>
          o haz clic para seleccionar un archivo
        </p>
        <p style={{ fontSize: '12px', color: '#6B7280' }}>
          Formatos soportados: CSV (máx. 10 MB)
        </p>
      </div>

      {file && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
            border: '1px solid rgba(201, 165, 116, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'rgba(201, 165, 116, 0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={24} color="#c9a574" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
              {file.name}
            </p>
            <p style={{ fontSize: '13px', color: '#AFB3B7' }}>
              {(file.size / 1024).toFixed(2)} KB • {csvData.length} filas detectadas
            </p>
          </div>
          {uploadStatus !== 'success' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#AFB3B7',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#AFB3B7')}
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

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
              Los royalties han sido calculados y guardados en la base de datos
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

      {file && csvData.length > 0 && (
        <>
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