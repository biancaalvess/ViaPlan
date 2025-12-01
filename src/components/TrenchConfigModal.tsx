import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export interface TrenchConfig {
  width: number;
  depth: number;
  asphaltRemoval?: {
    width: number;
    thickness: number;
  };
  concreteRemoval?: {
    width: number;
    thickness: number;
  };
  backfill?: {
    type: string;
    customType?: string;
    width: number;
    depth: number;
  };
}

// Internal state interface for easier updates
interface TrenchConfigState {
  width: number;
  depth: number;
  asphaltRemoval?: {
    width: number;
    thickness: number;
  };
  concreteRemoval?: {
    width: number;
    thickness: number;
  };
  backfill?: {
    type: string;
    customType?: string;
    width: number;
    depth: number;
  };
}

interface TrenchConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: TrenchConfig) => void;
  initialConfig?: TrenchConfig | null;
}

const TrenchConfigModal: React.FC<TrenchConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialConfig,
}) => {
  const [config, setConfig] = useState<TrenchConfigState>({
    width: 2,
    depth: 3,
  });

  const [includeAsphaltRemoval, setIncludeAsphaltRemoval] = useState(false);
  const [includeConcreteRemoval, setIncludeConcreteRemoval] = useState(false);
  const [includeBackfill, setIncludeBackfill] = useState(false);

  // Histórico para funcionalidade de desfazer
  const [history, setHistory] = useState<TrenchConfigState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Função para salvar estado no histórico
  const saveToHistory = (newConfig: TrenchConfigState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newConfig);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Função para desfazer última alteração
  const undoLastChange = () => {
    if (historyIndex > 0) {
      const previousConfig = history[historyIndex - 1];
      setConfig(previousConfig);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Função para verificar se pode desfazer
  const canUndo = historyIndex > 0;

  useEffect(() => {
    if (initialConfig) {
      const newConfig = initialConfig;
      setConfig(newConfig);
      setIncludeAsphaltRemoval(!!initialConfig.asphaltRemoval);
      setIncludeConcreteRemoval(!!initialConfig.concreteRemoval);
      setIncludeBackfill(!!initialConfig.backfill);

      // Inicializar histórico
      setHistory([newConfig]);
      setHistoryIndex(0);
    }
  }, [initialConfig]);

  const handleConfirm = () => {
    const finalConfig: TrenchConfig = {
      ...config,
      asphaltRemoval: includeAsphaltRemoval ? config.asphaltRemoval : undefined,
      concreteRemoval: includeConcreteRemoval
        ? config.concreteRemoval
        : undefined,
      backfill: includeBackfill ? config.backfill : undefined,
    };
    onConfirm(finalConfig);
  };

  const backfillTypes = [
    'Native Soil',
    'Flowable Fill',
    'Sand',
    'Gravel',
    'Crushed Stone',
    'Custom',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Configure Trench</DialogTitle>
        </DialogHeader>

        {/* Botão de Desfazer */}
        <div className='flex justify-between items-center mb-4'>
          <Button
            variant='outline'
            onClick={undoLastChange}
            disabled={!canUndo}
            className='flex items-center space-x-2 text-red-600 border-red-600 hover:bg-red-50'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M3 7v6h6' />
              <path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' />
            </svg>
            <span>Desfazer</span>
          </Button>
        </div>

        <div className='space-y-6'>
          {/* Basic Dimensions */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-900'>
              Basic Dimensions
            </h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='width'>Width (ft)</Label>
                <Input
                  id='width'
                  type='number'
                  step='0.1'
                  value={config.width}
                  onChange={e => {
                    const newConfig = {
                      ...config,
                      width: parseFloat(e.target.value) || 0,
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }}
                />
              </div>
              <div>
                <Label htmlFor='depth'>Depth (ft)</Label>
                <Input
                  id='depth'
                  type='number'
                  step='0.1'
                  value={config.depth}
                  onChange={e => {
                    const newConfig = {
                      ...config,
                      depth: parseFloat(e.target.value) || 0,
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Asphalt Removal */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='asphalt-removal'
                checked={includeAsphaltRemoval}
                onCheckedChange={checked => {
                  const newIncludeAsphalt = checked as boolean;
                  setIncludeAsphaltRemoval(newIncludeAsphalt);

                  if (newIncludeAsphalt && !config.asphaltRemoval) {
                    const newConfig = {
                      ...config,
                      asphaltRemoval: { width: 0, thickness: 0 },
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }
                }}
              />
              <Label htmlFor='asphalt-removal'>Asphalt Removal</Label>
            </div>

            {includeAsphaltRemoval && (
              <div className='grid grid-cols-2 gap-4 pl-6'>
                <div>
                  <Label htmlFor='asphalt-width'>Width (ft)</Label>
                  <Input
                    id='asphalt-width'
                    type='number'
                    step='0.1'
                    value={config.asphaltRemoval?.width || 0}
                    onChange={e => {
                      const newConfig = {
                        ...config,
                        asphaltRemoval: {
                          width: parseFloat(e.target.value) || 0,
                          thickness: config.asphaltRemoval?.thickness || 0,
                        },
                      };
                      setConfig(newConfig);
                      saveToHistory(newConfig);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor='asphalt-thickness'>Thickness (in)</Label>
                  <Input
                    id='asphalt-thickness'
                    type='number'
                    step='0.1'
                    value={config.asphaltRemoval?.thickness || 0}
                    onChange={e => {
                      const newConfig = {
                        ...config,
                        asphaltRemoval: {
                          width: config.asphaltRemoval?.width || 0,
                          thickness: parseFloat(e.target.value) || 0,
                        },
                      };
                      setConfig(newConfig);
                      saveToHistory(newConfig);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Concrete Removal */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='concrete-removal'
                checked={includeConcreteRemoval}
                onCheckedChange={checked => {
                  const newIncludeConcrete = checked as boolean;
                  setIncludeConcreteRemoval(newIncludeConcrete);

                  if (newIncludeConcrete && !config.concreteRemoval) {
                    const newConfig = {
                      ...config,
                      concreteRemoval: { width: 0, thickness: 0 },
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }
                }}
              />
              <Label htmlFor='concrete-removal'>Concrete Removal</Label>
            </div>

            {includeConcreteRemoval && (
              <div className='grid grid-cols-2 gap-4 pl-6'>
                <div>
                  <Label htmlFor='concrete-width'>Width (ft)</Label>
                  <Input
                    id='concrete-width'
                    type='number'
                    step='0.1'
                    value={config.concreteRemoval?.width || 0}
                    onChange={e => {
                      const newConfig = {
                        ...config,
                        concreteRemoval: {
                          width: parseFloat(e.target.value) || 0,
                          thickness: config.concreteRemoval?.thickness || 0,
                        },
                      };
                      setConfig(newConfig);
                      saveToHistory(newConfig);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor='concrete-thickness'>Thickness (in)</Label>
                  <Input
                    id='concrete-thickness'
                    type='number'
                    step='0.1'
                    value={config.concreteRemoval?.thickness || 0}
                    onChange={e => {
                      const newConfig = {
                        ...config,
                        concreteRemoval: {
                          width: config.concreteRemoval?.width || 0,
                          thickness: parseFloat(e.target.value) || 0,
                        },
                      };
                      setConfig(newConfig);
                      saveToHistory(newConfig);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Backfill */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='backfill'
                checked={includeBackfill}
                onCheckedChange={checked => {
                  const newIncludeBackfill = checked as boolean;
                  setIncludeBackfill(newIncludeBackfill);

                  if (newIncludeBackfill && !config.backfill) {
                    const newConfig = {
                      ...config,
                      backfill: {
                        type: 'Native Soil',
                        customType: '',
                        width: 0,
                        depth: 0,
                      },
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }
                }}
              />
              <Label htmlFor='backfill'>Backfill</Label>
            </div>

            {includeBackfill && (
              <div className='space-y-4 pl-6'>
                <div>
                  <Label htmlFor='backfill-type'>Backfill Type</Label>
                  <Select
                    value={config.backfill?.type || 'Native Soil'}
                    onValueChange={value => {
                      const newConfig = {
                        ...config,
                        backfill: {
                          type: value,
                          customType: config.backfill?.customType || '',
                          width: config.backfill?.width || 0,
                          depth: config.backfill?.depth || 0,
                        },
                      };
                      setConfig(newConfig);
                      saveToHistory(newConfig);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backfillTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {config.backfill?.type === 'Custom' && (
                  <div>
                    <Label htmlFor='custom-backfill'>Custom Type</Label>
                    <Input
                      id='custom-backfill'
                      value={config.backfill?.customType || ''}
                      onChange={e => {
                        const newConfig = {
                          ...config,
                          backfill: {
                            type: config.backfill?.type || 'Native Soil',
                            customType: e.target.value,
                            width: config.backfill?.width || 0,
                            depth: config.backfill?.depth || 0,
                          },
                        };
                        setConfig(newConfig);
                        saveToHistory(newConfig);
                      }}
                      placeholder='Specify backfill type'
                    />
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='backfill-width'>Width (ft)</Label>
                    <Input
                      id='backfill-width'
                      type='number'
                      step='0.1'
                      value={config.backfill?.width || 0}
                      onChange={e => {
                        const newConfig = {
                          ...config,
                          backfill: {
                            type: config.backfill?.type || 'Native Soil',
                            customType: config.backfill?.customType || '',
                            width: parseFloat(e.target.value) || 0,
                            depth: config.backfill?.depth || 0,
                          },
                        };
                        setConfig(newConfig);
                        saveToHistory(newConfig);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor='backfill-depth'>Depth (ft)</Label>
                    <Input
                      id='backfill-depth'
                      type='number'
                      step='0.1'
                      value={config.backfill?.depth || 0}
                      onChange={e => {
                        const newConfig = {
                          ...config,
                          backfill: {
                            type: config.backfill?.type || 'Native Soil',
                            customType: config.backfill?.customType || '',
                            width: config.backfill?.width || 0,
                            depth: parseFloat(e.target.value) || 0,
                          },
                        };
                        setConfig(newConfig);
                        saveToHistory(newConfig);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end space-x-2 pt-4'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className='bg-red-600 hover:bg-red-700'
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrenchConfigModal;
