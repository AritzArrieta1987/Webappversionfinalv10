import { X, FileSignature, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ContractPDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
  onSign: (contractId: number) => void;
}

export function ContractPDFViewer({ isOpen, onClose, contract, onSign }: ContractPDFViewerProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !contract) return null;

  const handleSign = () => {
    setIsLoading(true);
    setTimeout(() => {
      onSign(contract.id);
      setIsLoading(false);
      setAcceptedTerms(false);
      onClose();
    }, 1000);
  };

  const isSigned = contract.signedAt;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.95) 0%, rgba(30, 47, 47, 0.98) 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(201, 165, 116, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: isSigned 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSigned ? (
                <CheckCircle size={20} color="#ffffff" />
              ) : (
                <FileSignature size={20} color="#ffffff" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                {contract.contractType}
              </h2>
              {isSigned && (
                <p style={{ fontSize: '12px', color: '#22c55e', margin: '4px 0 0 0' }}>
                  ✓ Firmado el {new Date(contract.signedAt).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(201, 165, 116, 0.1)',
              border: '1px solid rgba(201, 165, 116, 0.3)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201, 165, 116, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(201, 165, 116, 0.1)';
            }}
          >
            <X size={20} color="#c9a574" />
          </button>
        </div>

        {/* PDF Viewer */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          {contract.contractPDF ? (
            <iframe
              src={contract.contractPDF}
              style={{
                width: '100%',
                height: '500px',
                border: '1px solid rgba(201, 165, 116, 0.3)',
                borderRadius: '12px',
                background: '#ffffff',
              }}
              title="Contrato PDF"
            />
          ) : (
            <div
              style={{
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed rgba(201, 165, 116, 0.3)',
                borderRadius: '12px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <AlertCircle size={48} color="#c9a574" style={{ opacity: 0.5, margin: '0 auto 16px' }} />
                <p style={{ fontSize: '16px', color: '#AFB3B7' }}>
                  No hay PDF disponible para este contrato
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {!isSigned && contract.contractPDF && (
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid rgba(201, 165, 116, 0.2)',
              background: 'rgba(42, 63, 63, 0.5)',
            }}
          >
            {/* Checkbox de aceptación */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#ffffff',
                cursor: 'pointer',
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(201, 165, 116, 0.1)',
                border: '1px solid rgba(201, 165, 116, 0.3)',
                borderRadius: '10px',
              }}
            >
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#c9a574',
                }}
              />
              <span>
                He leído y acepto todos los términos y condiciones de este contrato
              </span>
            </label>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(201, 165, 116, 0.1)',
                  border: '1px solid rgba(201, 165, 116, 0.3)',
                  borderRadius: '10px',
                  color: '#c9a574',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 165, 116, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(201, 165, 116, 0.1)';
                }}
              >
                Cerrar
              </button>
              <button
                onClick={handleSign}
                disabled={!acceptedTerms || isLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: acceptedTerms
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'rgba(201, 165, 116, 0.2)',
                  border: 'none',
                  borderRadius: '10px',
                  color: acceptedTerms ? '#ffffff' : '#AFB3B7',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: acceptedTerms ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: acceptedTerms ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isLoading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (acceptedTerms) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (acceptedTerms) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                  }
                }}
              >
                <FileSignature size={16} />
                {isLoading ? 'Firmando...' : 'Firmar Contrato'}
              </button>
            </div>
          </div>
        )}

        {/* Si ya está firmado */}
        {isSigned && (
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid rgba(201, 165, 116, 0.2)',
              background: 'rgba(34, 197, 94, 0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#22c55e" />
              <p style={{ fontSize: '14px', color: '#22c55e', fontWeight: '600', margin: 0 }}>
                Este contrato ya ha sido firmado digitalmente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
