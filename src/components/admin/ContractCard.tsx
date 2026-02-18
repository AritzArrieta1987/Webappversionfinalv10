import { FileText, Calendar, TrendingUp, AlertCircle, CheckCircle, FileCheck, Euro } from 'lucide-react';

interface ContractCardProps {
  contract: {
    id: number;
    artistName: string;
    artistPhoto?: string;
    contractType: string;
    royaltyPercentage: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'pending';
    totalRevenue: number;
    isPhysical: boolean;
    workBilling: number;
    contractPDF?: string;
    contractPDFName?: string;
    signedAt?: string;
  };
  onClick: () => void;
}

export function ContractCard({ contract, onClick }: ContractCardProps) {
  const statusConfig = {
    active: {
      label: 'Activo',
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
      icon: CheckCircle,
    },
    expired: {
      label: 'Expirado',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      icon: AlertCircle,
    },
    pending: {
      label: 'Pendiente',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: AlertCircle,
    },
  };

  const currentStatus = statusConfig[contract.status];
  const StatusIcon = currentStatus.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.6) 0%, rgba(30, 47, 47, 0.8) 100%)',
        border: '1px solid rgba(201, 165, 116, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Estado badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: currentStatus.bg,
          borderRadius: '20px',
          border: `1px solid ${currentStatus.color}`,
        }}
      >
        <StatusIcon size={14} color={currentStatus.color} />
        <span style={{ fontSize: '12px', fontWeight: '600', color: currentStatus.color }}>
          {currentStatus.label}
        </span>
      </div>

      {/* Artista info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {contract.artistPhoto ? (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #c9a574',
              flexShrink: 0,
            }}
          >
            <img
              src={contract.artistPhoto}
              alt={contract.artistName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
              {contract.artistName.charAt(0)}
            </span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {contract.artistName}
          </h3>
          <p style={{ fontSize: '12px', color: '#AFB3B7' }}>Artista</p>
        </div>
      </div>

      {/* Tipo de contrato */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(201, 165, 116, 0.1)',
          borderRadius: '10px',
          marginBottom: '16px',
        }}
      >
        <FileText size={16} color="#c9a574" />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#c9a574' }}>
          {contract.contractType}
        </span>
      </div>

      {/* Tipo de contrato físico/digital */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: contract.isPhysical ? 'rgba(201, 165, 116, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          border: `1px solid ${contract.isPhysical ? 'rgba(201, 165, 116, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <FileCheck size={14} color={contract.isPhysical ? '#c9a574' : '#3b82f6'} />
        <span style={{ fontSize: '12px', fontWeight: '600', color: contract.isPhysical ? '#c9a574' : '#3b82f6' }}>
          {contract.isPhysical ? 'Contrato Físico' : 'Contrato Digital'}
        </span>
      </div>

      {/* Facturación del trabajo */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Euro size={16} color="#c9a574" />
          <span style={{ fontSize: '12px', color: '#AFB3B7' }}>Facturación Trabajo</span>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
          {formatCurrency(contract.workBilling)}
        </div>
      </div>

      {/* Porcentaje de royalties */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <TrendingUp size={16} color="#c9a574" />
          <span style={{ fontSize: '12px', color: '#AFB3B7' }}>Royalties</span>
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
          {contract.royaltyPercentage}%
        </div>
      </div>

      {/* Fechas */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px',
          background: 'rgba(42, 63, 63, 0.5)',
          borderRadius: '10px',
          marginBottom: '16px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Calendar size={12} color="#AFB3B7" />
            <span style={{ fontSize: '11px', color: '#AFB3B7' }}>Inicio</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            {formatDate(contract.startDate)}
          </div>
        </div>
        <div style={{ width: '1px', background: 'rgba(201, 165, 116, 0.2)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Calendar size={12} color="#AFB3B7" />
            <span style={{ fontSize: '11px', color: '#AFB3B7' }}>Vencimiento</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            {formatDate(contract.endDate)}
          </div>
        </div>
      </div>

      {/* Ingresos totales */}
      <div
        style={{
          borderTop: '1px solid rgba(201, 165, 116, 0.2)',
          paddingTop: '16px',
          marginBottom: contract.contractPDF ? '16px' : '0',
        }}
      >
        <div style={{ fontSize: '12px', color: '#AFB3B7', marginBottom: '4px' }}>
          Ingresos generados
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#c9a574' }}>
          {formatCurrency(contract.totalRevenue)}
        </div>
      </div>

      {/* Indicador de PDF y firma */}
      {contract.contractPDF && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            background: contract.signedAt 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(96, 165, 250, 0.1)',
            border: `1px solid ${contract.signedAt ? 'rgba(34, 197, 94, 0.3)' : 'rgba(96, 165, 250, 0.3)'}`,
            borderRadius: '8px',
          }}
        >
          <FileCheck size={14} color={contract.signedAt ? '#22c55e' : '#60a5fa'} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: contract.signedAt ? '#22c55e' : '#60a5fa' }}>
            {contract.signedAt 
              ? `✓ Firmado ${formatDate(contract.signedAt)}`
              : 'PDF disponible - Pendiente de firma'}
          </span>
        </div>
      )}
    </div>
  );
}