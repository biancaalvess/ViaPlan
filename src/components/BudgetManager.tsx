import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { budgetService } from '../services/budgetService';
import {
  Budget,
  BudgetItem,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../types/entities';

// Ícones simplificados (substituindo lucide-react temporariamente)
const Plus = () => <span>➕</span>;
const Edit = ({ className }: { className?: string }) => (
  <span className={className}>✏️</span>
);
const Trash2 = ({ className }: { className?: string }) => (
  <span className={className}>🗑️</span>
);
const FileText = ({ className }: { className?: string }) => (
  <span className={className}>📄</span>
);
const DollarSign = ({ className }: { className?: string }) => (
  <span className={className}>💰</span>
);
const Calculator = ({ className }: { className?: string }) => (
  <span className={className}>🧮</span>
);
const Download = ({ className }: { className?: string }) => (
  <span className={className}>⬇️</span>
);
const Eye = ({ className }: { className?: string }) => (
  <span className={className}>👁️</span>
);
const CheckCircle = ({ className }: { className?: string }) => (
  <span className={className}>✅</span>
);
const XCircle = ({ className }: { className?: string }) => (
  <span className={className}>❌</span>
);
const Clock = ({ className }: { className?: string }) => (
  <span className={className}>🕐</span>
);

// Toast simplificado (substituindo sonner temporariamente)
const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.error('ERROR:', message),
};

// Interfaces já importadas do budgetService

interface BudgetManagerProps {
  projectId: string;
}

export function BudgetManager({ projectId }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    margin_percentage: 15,
    discount_percentage: 0,
    tax_percentage: 0,
    currency: 'BRL',
  });

  useEffect(() => {
    loadBudgets();
  }, [projectId]);

  useEffect(() => {
    if (selectedBudget) {
      loadBudgetItems(selectedBudget.id);
    }
  }, [selectedBudget]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const budgetsData = await budgetService.getBudgetsByProject(projectId);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadBudgetItems = async (budgetId: string) => {
    try {
      const itemsData = await budgetService.getBudgetItems(budgetId);
      setBudgetItems(itemsData);
    } catch (error) {
      console.error('Erro ao carregar itens do orçamento:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBudget) {
        // Atualizar orçamento existente
        const updatedBudget = await budgetService.updateBudget(
          editingBudget.id,
          formData
        );
        setBudgets(prev =>
          prev.map(b => (b.id === editingBudget.id ? updatedBudget : b))
        );
        if (selectedBudget?.id === editingBudget.id) {
          setSelectedBudget(updatedBudget);
        }
        toast.success('Orçamento atualizado!');
      } else {
        // Criar novo orçamento
        const createData: CreateBudgetRequest = {
          project_id: projectId,
          ...formData,
        };
        const newBudget = await budgetService.createBudget(createData);
        setBudgets(prev => [...prev, newBudget]);
        toast.success('Orçamento criado!');
      }

      setIsModalOpen(false);
      setEditingBudget(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      toast.error('Erro ao salvar orçamento');
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;

    try {
      await budgetService.deleteBudget(budgetId);
      setBudgets(prev => prev.filter(b => b.id !== budgetId));
      toast.success('Orçamento excluído!');

      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(null);
      }
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      toast.error('Erro ao excluir orçamento');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      margin_percentage: 15,
      discount_percentage: 0,
      tax_percentage: 0,
      currency: 'BRL',
    });
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      description: budget.description || '',
      margin_percentage: budget.margin_percentage,
      discount_percentage: budget.discount_percentage,
      tax_percentage: budget.tax_percentage,
      currency: budget.currency,
    });
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className='w-4 h-4' />;
      case 'proposal':
        return <FileText className='w-4 h-4' />;
      case 'approved':
        return <CheckCircle className='w-4 h-4' />;
      case 'rejected':
        return <XCircle className='w-4 h-4' />;
      case 'completed':
        return <CheckCircle className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'proposal':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'proposal':
        return 'Proposta';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const calculateTotals = () => {
    if (!selectedBudget)
      return { subtotal: 0, margin: 0, discount: 0, tax: 0, total: 0 };

    const subtotal = budgetItems.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    const margin = subtotal * (selectedBudget.margin_percentage / 100);
    const discount = subtotal * (selectedBudget.discount_percentage / 100);
    const tax = subtotal * (selectedBudget.tax_percentage / 100);
    const total = subtotal + margin - discount + tax;

    return { subtotal, margin, discount, tax, total };
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold'>Orçamentos</h2>
          <p className='text-gray-600'>Gerencie orçamentos do projeto</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus />
          <span className='ml-2'>Novo Orçamento</span>
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Lista de Orçamentos */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {budgets.map(budget => (
                <div
                  key={budget.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBudget?.id === budget.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBudget(budget)}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-medium'>{budget.name}</h3>
                    <Badge className={getStatusColor(budget.status)}>
                      {getStatusIcon(budget.status)}
                      <span className='ml-1'>
                        {getStatusText(budget.status)}
                      </span>
                    </Badge>
                  </div>
                  <p className='text-sm text-gray-600 mb-2'>
                    {budget.description || 'Sem descrição'}
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      {formatCurrency(budget.total_amount, budget.currency)}
                    </span>
                    <div className='flex space-x-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={e => {
                          e.stopPropagation();
                          openEditModal(budget);
                        }}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(budget.id);
                        }}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {budgets.length === 0 && (
                <div className='text-center py-8'>
                  <FileText className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    Nenhum orçamento
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Crie seu primeiro orçamento
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Orçamento */}
        <div className='lg:col-span-2'>
          {selectedBudget ? (
            <div className='space-y-6'>
              {/* Cabeçalho do Orçamento */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>{selectedBudget.name}</CardTitle>
                      <p className='text-gray-600'>
                        {selectedBudget.description}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-2xl font-bold'>
                        {formatCurrency(totals.total, selectedBudget.currency)}
                      </p>
                      <p className='text-sm text-gray-500'>Total</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Itens do Orçamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Itens do Orçamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {budgetItems.map(item => (
                      <div
                        key={item.id}
                        className='flex items-center justify-between p-3 border rounded-lg'
                      >
                        <div className='flex-1'>
                          <p className='font-medium'>{item.category}</p>
                          <p className='text-sm text-gray-500'>
                            {item.quantity} {item.unit} ×{' '}
                            {formatCurrency(
                              item.unit_price,
                              selectedBudget.currency
                            )}
                          </p>
                          {item.notes && (
                            <p className='text-sm text-gray-600 mt-1'>
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {formatCurrency(
                              item.total_price,
                              selectedBudget.currency
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                    {budgetItems.length === 0 && (
                      <div className='text-center py-8'>
                        <Calculator className='mx-auto h-12 w-12 text-gray-400' />
                        <h3 className='mt-2 text-sm font-medium text-gray-900'>
                          Nenhum item
                        </h3>
                        <p className='mt-1 text-sm text-gray-500'>
                          Adicione itens ao orçamento
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span>Subtotal:</span>
                      <span>
                        {formatCurrency(
                          totals.subtotal,
                          selectedBudget.currency
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Margem ({selectedBudget.margin_percentage}%):</span>
                      <span className='text-green-600'>
                        +
                        {formatCurrency(totals.margin, selectedBudget.currency)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>
                        Desconto ({selectedBudget.discount_percentage}%):
                      </span>
                      <span className='text-red-600'>
                        -
                        {formatCurrency(
                          totals.discount,
                          selectedBudget.currency
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Impostos ({selectedBudget.tax_percentage}%):</span>
                      <span className='text-orange-600'>
                        +{formatCurrency(totals.tax, selectedBudget.currency)}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between font-bold text-lg'>
                      <span>Total:</span>
                      <span>
                        {formatCurrency(totals.total, selectedBudget.currency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className='text-center py-12'>
                <FileText className='mx-auto h-12 w-12 text-gray-400' />
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                  Selecione um orçamento
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  Escolha um orçamento da lista para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de criação/edição */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-96 max-h-[90vh] overflow-y-auto'>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <DollarSign className='mr-2 h-5 w-5' />
                {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Nome *</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='description'>Descrição</Label>
                  <Input
                    id='description'
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <Label htmlFor='margin'>Margem (%)</Label>
                    <Input
                      id='margin'
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.margin_percentage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          margin_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='discount'>Desconto (%)</Label>
                    <Input
                      id='discount'
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.discount_percentage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          discount_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='tax'>Impostos (%)</Label>
                    <Input
                      id='tax'
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.tax_percentage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          tax_percentage: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='currency'>Moeda</Label>
                  <select
                    id='currency'
                    value={formData.currency}
                    onChange={e =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className='w-full p-2 border rounded-md'
                  >
                    <option value='BRL'>Real (BRL)</option>
                    <option value='USD'>Dólar (USD)</option>
                    <option value='EUR'>Euro (EUR)</option>
                  </select>
                </div>

                <Separator />

                <div className='flex space-x-2'>
                  <Button type='submit' className='flex-1'>
                    {editingBudget ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingBudget(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
