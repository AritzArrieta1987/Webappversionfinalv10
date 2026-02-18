import { useState } from 'react';
import { Plus, Trash2, Edit2, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
}

interface ExpensesSectionProps {
  isMobile?: boolean;
}

export function ExpensesSection({ isMobile = false }: ExpensesSectionProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'operativo',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transferencia'
  });

  const categories = {
    operativo: { label: 'Operativo', color: '#c9a574' },
    marketing: { label: 'Marketing', color: '#c9a574' },
    distribucion: { label: 'Distribución', color: '#c9a574' },
    legal: { label: 'Legal', color: '#c9a574' },
    otros: { label: 'Otros', color: '#c9a574' }
  };

  const categoryData = Object.keys(categories).map(cat => ({
    category: categories[cat as keyof typeof categories].label,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  }));

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense.id 
          ? { ...exp, ...formData, amount: parseFloat(formData.amount) }
          : exp
      ));
    } else {
      const newExpense: Expense = {
        id: Date.now(),
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        paymentMethod: formData.paymentMethod
      };
      setExpenses([...expenses, newExpense]);
    }
    setShowAddModal(false);
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      category: 'operativo',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Transferencia'
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      paymentMethod: expense.paymentMethod
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div>
      {/* Header con botón agregar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '16px' : '0',
        marginBottom: isMobile ? '20px' : '32px' 
      }}>
        <div>
          <h2 style={{ 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: '700', 
            color: '#ffffff', 
            margin: 0 
          }}>
            Gestión de Gastos
          </h2>
          <p style={{ 
            fontSize: isMobile ? '13px' : '14px', 
            color: 'rgba(255, 255, 255, 0.7)', 
            margin: '4px 0 0 0' 
          }}>
            Total gastado: <span style={{ color: '#c9a574', fontWeight: '600' }}>€{totalExpenses.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: isMobile ? '10px 20px' : '12px 24px',
            background: 'linear-gradient(135deg, #c9a574 0%, #b8935d 100%)',
            color: '#2a3f3f',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: isMobile ? '14px' : '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center'
          }}
        >
          <Plus size={18} />
          Agregar Gasto
        </button>
      </div>

      {/* Gráfico de gastos por categoría */}
      <div style={{
        background: 'rgba(42, 63, 63, 0.4)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: isMobile ? '20px' : '32px'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '16px' : '18px', 
          fontWeight: '600', 
          color: '#ffffff', 
          marginBottom: isMobile ? '16px' : '20px' 
        }}>
          Gastos por Categoría
        </h3>
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="category" 
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: isMobile ? '11px' : '12px' }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 80 : 30}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.5)"
              style={{ fontSize: isMobile ? '11px' : '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#2a3f3f',
                border: '1px solid rgba(201, 165, 116, 0.3)',
                borderRadius: '8px',
                fontSize: isMobile ? '12px' : '14px'
              }}
              labelStyle={{ color: '#c9a574' }}
            />
            <Bar dataKey="value" fill="#c9a574" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lista de gastos */}
      <div style={{
        background: 'rgba(42, 63, 63, 0.4)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '16px' : '18px', 
          fontWeight: '600', 
          color: '#ffffff', 
          marginBottom: isMobile ? '16px' : '20px' 
        }}>
          Historial de Gastos
        </h3>
        
        {expenses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '32px 16px' : '48px',
            color: 'rgba(255, 255, 255, 0.5)' 
          }}>
            <Plus size={isMobile ? 48 : 56} color="#c9a574" style={{ opacity: 0.5, marginBottom: '16px' }} />
            <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
              No hay gastos registrados
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? '12px' : '16px' 
          }}>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: isMobile ? '10px' : '12px',
                  padding: isMobile ? '14px' : '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  gap: isMobile ? '12px' : '16px',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center'
                }}>
                  {/* Info principal */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ 
                      fontSize: isMobile ? '15px' : '16px', 
                      fontWeight: '600', 
                      color: '#ffffff', 
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: isMobile ? 'normal' : 'nowrap'
                    }}>
                      {expense.description}
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: isMobile ? '8px' : '16px', 
                      flexWrap: 'wrap',
                      fontSize: isMobile ? '12px' : '13px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={14} />
                        {categories[expense.category as keyof typeof categories].label}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString('es-ES')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} />
                        {expense.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Monto y acciones */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? '12px' : '20px',
                    justifyContent: isMobile ? 'space-between' : 'flex-end'
                  }}>
                    <span style={{ 
                      fontSize: isMobile ? '18px' : '20px', 
                      fontWeight: '700', 
                      color: '#c9a574',
                      whiteSpace: 'nowrap'
                    }}>
                      €{expense.amount.toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(expense)}
                        style={{
                          padding: isMobile ? '8px' : '10px',
                          background: 'rgba(201, 165, 116, 0.1)',
                          color: '#c9a574',
                          border: '1px solid rgba(201, 165, 116, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit2 size={isMobile ? 16 : 18} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        style={{
                          padding: isMobile ? '8px' : '10px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={isMobile ? 16 : 18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Agregar/Editar */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '0' : '20px'
        }}>
          <div style={{
            background: '#2a3f3f',
            borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            padding: isMobile ? '24px 20px' : '32px',
            width: isMobile ? '100%' : '100%',
            maxWidth: '500px',
            maxHeight: isMobile ? '90vh' : '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ 
              fontSize: isMobile ? '20px' : '24px', 
              fontWeight: '700', 
              color: '#ffffff', 
              marginBottom: isMobile ? '20px' : '24px' 
            }}>
              {editingExpense ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? '13px' : '14px', 
                  color: '#c9a574', 
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ej: Pago de royalties"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? '13px' : '14px', 
                  color: '#c9a574', 
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Monto (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0.00"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? '13px' : '14px', 
                  color: '#c9a574', 
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key} style={{ background: '#2a3f3f' }}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? '13px' : '14px', 
                  color: '#c9a574', 
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: isMobile ? '13px' : '14px', 
                  color: '#c9a574', 
                  marginBottom: '8px',
                  fontWeight: '600'
                }}>
                  Método de Pago
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  style={{
                    width: '100%',
                    padding: isMobile ? '12px' : '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: isMobile ? '15px' : '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Transferencia" style={{ background: '#2a3f3f' }}>Transferencia Bancaria</option>
                  <option value="Tarjeta" style={{ background: '#2a3f3f' }}>Tarjeta</option>
                  <option value="Efectivo" style={{ background: '#2a3f3f' }}>Efectivo</option>
                  <option value="Cheque" style={{ background: '#2a3f3f' }}>Cheque</option>
                </select>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px',
                flexDirection: isMobile ? 'column-reverse' : 'row'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExpense(null);
                    setFormData({
                      description: '',
                      amount: '',
                      category: 'operativo',
                      date: new Date().toISOString().split('T')[0],
                      paymentMethod: 'Transferencia'
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px' : '14px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '15px' : '16px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px' : '14px',
                    background: 'linear-gradient(135deg, #c9a574 0%, #b8935d 100%)',
                    color: '#2a3f3f',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '15px' : '16px'
                  }}
                >
                  {editingExpense ? 'Guardar Cambios' : 'Agregar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}