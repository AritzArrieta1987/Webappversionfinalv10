import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '72px', 
        fontWeight: '700', 
        color: '#c9a574', 
        marginBottom: '16px',
        lineHeight: 1
      }}>
        404
      </h1>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
        Página no encontrada
      </h2>
      <p style={{ fontSize: '14px', color: '#69818D', marginBottom: '32px' }}>
        La página que buscas no existe o ha sido movida.
      </p>
      <Link 
        to="/"
        style={{
          padding: '12px 32px',
          background: 'linear-gradient(135deg, #c9a574 0%, #d4b589 100%)',
          color: '#0d1f23',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '14px',
          letterSpacing: '0.5px',
          transition: 'transform 0.2s ease'
        }}
      >
        Volver al Dashboard
      </Link>
    </div>
  );
}
