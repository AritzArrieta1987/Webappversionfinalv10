import { useState, useEffect, useRef } from 'react';
import { Package, Plus, Edit2, Trash2, ShoppingCart, Disc, Shirt, Gift, Save, X, Camera } from 'lucide-react';

interface PhysicalSalesProps {
  artists: any[];
  isMobile: boolean;
}

interface PhysicalProduct {
  id: string;
  name: string;
  type: 'CD' | 'Vinyl' | 'T-Shirt' | 'Merchandising' | 'Other';
  artistName: string;
  price: number;
  unitsSold: number;
  shippingCost: number;
  royaltyPercentage: number;
  totalRevenue: number;
  date: string;
  description?: string;
  photo?: string;
}

export function PhysicalSalesSection({ artists, isMobile }: PhysicalSalesProps) {
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PhysicalProduct | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CD' as PhysicalProduct['type'],
    artistName: '',
    price: 0,
    unitsSold: 0,
    shippingCost: 0,
    royaltyPercentage: 100,
    description: '',
    photo: ''
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Cargar productos desde localStorage
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('physicalSales') || '[]');
    setProducts(savedProducts);
  }, []);

  // Guardar productos en localStorage
  const saveProducts = (newProducts: PhysicalProduct[]) => {
    localStorage.setItem('physicalSales', JSON.stringify(newProducts));
    setProducts(newProducts);
    // Disparar evento para actualizar otras secciones
    window.dispatchEvent(new Event('physicalSalesUpdated'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.artistName || formData.price <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const totalRevenue = formData.price * formData.unitsSold - formData.shippingCost;
    const royaltyAmount = totalRevenue * (formData.royaltyPercentage / 100);

    if (editingProduct) {
      // Editar producto existente
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id 
          ? {
              ...p,
              ...formData,
              totalRevenue,
              date: p.date // Mantener fecha original
            }
          : p
      );
      saveProducts(updatedProducts);
    } else {
      // Crear nuevo producto
      const newProduct: PhysicalProduct = {
        id: Date.now().toString(),
        ...formData,
        totalRevenue,
        date: new Date().toISOString()
      };
      saveProducts([...products, newProduct]);
    }

    // Resetear formulario
    setFormData({
      name: '',
      type: 'CD',
      artistName: '',
      price: 0,
      unitsSold: 0,
      shippingCost: 0,
      royaltyPercentage: 100,
      description: '',
      photo: ''
    });
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      saveProducts(updatedProducts);
    }
  };

  const handleEdit = (product: PhysicalProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      artistName: product.artistName,
      price: product.price,
      unitsSold: product.unitsSold,
      shippingCost: product.shippingCost,
      royaltyPercentage: product.royaltyPercentage,
      description: product.description || '',
      photo: product.photo || ''
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      type: 'CD',
      artistName: '',
      price: 0,
      unitsSold: 0,
      shippingCost: 0,
      royaltyPercentage: 100,
      description: '',
      photo: ''
    });
  };

  // Calcular estadísticas
  const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalUnits = products.reduce((sum, p) => sum + p.unitsSold, 0);
  const averagePrice = products.length > 0 ? totalRevenue / totalUnits : 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CD':
      case 'Vinyl':
        return <Disc size={16} color="#c9a574" />;
      case 'T-Shirt':
        return <Shirt size={16} color="#c9a574" />;
      case 'Merchandising':
      case 'Other':
        return <Gift size={16} color="#c9a574" />;
      default:
        return <Package size={16} color="#c9a574" />;
    }
  };

  return (
    <div>
      {/* Header con Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '20px' : '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(201, 165, 116, 0.15) 0%, rgba(201, 165, 116, 0.05) 100%)',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '18px' : '24px',
          border: '1px solid rgba(201, 165, 116, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              borderRadius: '12px',
              background: 'rgba(201, 165, 116, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={isMobile ? 18 : 20} color="#c9a574" />
            </div>
            <span style={{ fontSize: isMobile ? '11px' : '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', textTransform: 'uppercase' }}>
              Total Unidades
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#c9a574' }}>
            {totalUnits.toLocaleString('es-ES')}
          </div>
        </div>

        <div style={{
          background: 'rgba(42, 63, 63, 0.4)',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '18px' : '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={isMobile ? 18 : 20} color="#22c55e" />
            </div>
            <span style={{ fontSize: isMobile ? '11px' : '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', textTransform: 'uppercase' }}>
              Ingresos Totales
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#22c55e' }}>
            €{totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{
          background: 'rgba(42, 63, 63, 0.4)',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '18px' : '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              borderRadius: '12px',
              background: 'rgba(201, 165, 116, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={isMobile ? 18 : 20} color="#c9a574" />
            </div>
            <span style={{ fontSize: isMobile ? '11px' : '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600', textTransform: 'uppercase' }}>
              Precio Promedio
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#ffffff' }}>
            €{averagePrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Botón Agregar Producto */}
      <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '12px 20px' : '14px 28px',
            background: 'linear-gradient(135deg, #c9a574 0%, #b8935d 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#2a3f3f',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(201, 165, 116, 0.3)',
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center'
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
          <Plus size={isMobile ? 18 : 20} />
          Agregar Producto
        </button>
      </div>

      {/* Lista de Productos */}
      {products.length > 0 ? (
        <div style={{
          background: 'rgba(42, 63, 63, 0.3)',
          borderRadius: isMobile ? '12px' : '16px',
          border: '1px solid rgba(201, 165, 116, 0.2)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Producto
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Artista
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Precio
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Unidades
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    % Royalty
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Total
                  </th>
                  <th style={{
                    padding: isMobile ? '12px' : '16px',
                    background: 'rgba(201, 165, 116, 0.1)',
                    borderBottom: '2px solid rgba(201, 165, 116, 0.3)',
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: '700',
                    color: '#c9a574',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 165, 116, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: isMobile ? '12px' : '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {product.photo ? (
                          <img
                            src={product.photo}
                            alt={product.name}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '2px solid rgba(201, 165, 116, 0.3)'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(201, 165, 116, 0.3)'
                          }}>
                            {getTypeIcon(product.type)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#ffffff' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#AFB3B7', marginTop: '2px' }}>
                            {product.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '12px' : '14px', color: '#AFB3B7' }}>
                      {product.artistName}
                    </td>
                    <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#ffffff', textAlign: 'right' }}>
                      €{product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', color: '#c9a574', fontWeight: '600', textAlign: 'right' }}>
                      {product.unitsSold}
                    </td>
                    <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', color: '#c9a574', fontWeight: '600', textAlign: 'right' }}>
                      {product.royaltyPercentage}%
                    </td>
                    <td style={{ padding: isMobile ? '12px' : '16px', fontSize: isMobile ? '13px' : '14px', fontWeight: '700', color: '#22c55e', textAlign: 'right' }}>
                      €{product.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            padding: '8px',
                            background: 'rgba(201, 165, 116, 0.1)',
                            border: '1px solid rgba(201, 165, 116, 0.3)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 165, 116, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201, 165, 116, 0.1)'}
                        >
                          <Edit2 size={16} color="#c9a574" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            padding: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(42, 63, 63, 0.3)',
          borderRadius: isMobile ? '12px' : '16px',
          border: '1px solid rgba(201, 165, 116, 0.2)',
          padding: isMobile ? '40px 20px' : '60px 40px',
          textAlign: 'center'
        }}>
          <Package size={isMobile ? 48 : 64} color="#c9a574" style={{ opacity: 0.3, margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            No hay productos físicos
          </h3>
          <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#AFB3B7' }}>
            Agrega CDs, vinilos, camisetas y merchandising para gestionar las ventas físicas
          </p>
        </div>
      )}

      {/* Modal Agregar/Editar Producto */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '16px' : '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 63, 0.98) 0%, rgba(30, 47, 47, 0.98) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(201, 165, 116, 0.3)',
            padding: isMobile ? '24px' : '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} color="#ef4444" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Album Debut - CD"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(42, 63, 63, 0.4)',
                    border: '1px solid rgba(201, 165, 116, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                  Tipo de Producto *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PhysicalProduct['type'] })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(42, 63, 63, 0.4)',
                    border: '1px solid rgba(201, 165, 116, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="CD">CD</option>
                  <option value="Vinyl">Vinilo</option>
                  <option value="T-Shirt">Camiseta</option>
                  <option value="Merchandising">Merchandising</option>
                  <option value="Other">Otro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                  Artista *
                </label>
                <select
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
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
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Seleccionar artista</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.name}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                    Precio Unitario (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(42, 63, 63, 0.4)',
                      border: '1px solid rgba(201, 165, 116, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                    Unidades Vendidas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unitsSold}
                    onChange={(e) => setFormData({ ...formData, unitsSold: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(42, 63, 63, 0.4)',
                      border: '1px solid rgba(201, 165, 116, 0.2)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                  Costo de Envío (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(42, 63, 63, 0.4)',
                    border: '1px solid rgba(201, 165, 116, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                  Porcentaje de Royalties (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.royaltyPercentage}
                  onChange={(e) => setFormData({ ...formData, royaltyPercentage: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(42, 63, 63, 0.4)',
                    border: '1px solid rgba(201, 165, 116, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles adicionales del producto..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(42, 63, 63, 0.4)',
                    border: '1px solid rgba(201, 165, 116, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#c9a574', marginBottom: '8px' }}>
                  Foto (opcional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={photoInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, photo: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      display: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(201, 165, 116, 0.1)',
                      border: '1px solid rgba(201, 165, 116, 0.3)',
                      borderRadius: '12px',
                      color: '#c9a574',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 165, 116, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201, 165, 116, 0.1)'}
                  >
                    <Camera size={16} />
                    Subir Foto
                  </button>
                  {formData.photo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={formData.photo}
                        alt="Producto"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: '' })}
                        style={{
                          padding: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {formData.price > 0 && formData.unitsSold > 0 && (
                <div style={{
                  padding: '16px',
                  background: 'rgba(201, 165, 116, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(201, 165, 116, 0.3)'
                }}>
                  <div style={{ fontSize: '13px', color: '#AFB3B7', marginBottom: '8px' }}>
                    Ingresos Totales
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                    €{(formData.price * formData.unitsSold - formData.shippingCost).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px 20px' : '14px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px 20px' : '14px 24px',
                    background: 'linear-gradient(135deg, #c9a574 0%, #b8935d 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#2a3f3f',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Save size={18} />
                  {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}