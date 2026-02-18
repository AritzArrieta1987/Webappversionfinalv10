import { X, User, Mail, Phone, Calendar, FileText, Upload } from 'lucide-react';
import { useState } from 'react';

interface AddArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artist: any) => void;
}

export function AddArtistModal({ isOpen, onClose, onSave }: AddArtistModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contractType: 'Contrato 360°',
    joinDate: new Date().toISOString().split('T')[0],
    photo: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: Date.now(),
      ...formData,
      totalEarnings: 0,
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e2f2f 0%, #2a3f3f 100%)',
          border: '1px solid rgba(201, 165, 116, 0.3)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
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
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <User size={24} color="#c9a574" />
            Agregar Nuevo Artista
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201, 165, 116, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={24} color="#c9a574" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nombre completo */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#c9a574',
                  marginBottom: '8px',
                }}
              >
                <User size={16} />
                Nombre Completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Luna García"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(42, 63, 63, 0.4)',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#c9a574',
                  marginBottom: '8px',
                }}
              >
                <Mail size={16} />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="artista@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(42, 63, 63, 0.4)',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
                }}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#c9a574',
                  marginBottom: '8px',
                }}
              >
                <Phone size={16} />
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+34 612 345 678"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(42, 63, 63, 0.4)',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
                }}
              />
            </div>

            {/* Tipo de contrato */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#c9a574',
                  marginBottom: '8px',
                }}
              >
                <FileText size={16} />
                Tipo de Contrato *
              </label>
              <select
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(42, 63, 63, 0.4)',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
                }}
              >
                <option value="Contrato 360°">Contrato 360°</option>
                <option value="Distribución Digital">Distribución Digital</option>
                <option value="Producción Musical">Producción Musical</option>
              </select>
            </div>

            {/* Fecha de ingreso */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#c9a574',
                  marginBottom: '8px',
                }}
              >
                <Calendar size={16} />
                Fecha de Ingreso *
              </label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(42, 63, 63, 0.4)',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
                }}
              />
            </div>

            {/* URL de foto */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#c9a574',
                  marginBottom: '8px',
                }}
              >
                <Upload size={16} />
                URL de Foto (opcional)
              </label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                placeholder="https://ejemplo.com/foto.jpg"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(42, 63, 63, 0.4)',
                  border: '1px solid rgba(201, 165, 116, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201, 165, 116, 0.2)';
                }}
              />
            </div>
          </div>

          {/* Botones */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(201, 165, 116, 0.2)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(42, 63, 63, 0.6)',
                border: '1px solid rgba(201, 165, 116, 0.2)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(42, 63, 63, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(42, 63, 63, 0.6)';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #c9a574 0%, #a68a5e 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
            >
              Guardar Artista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
