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
import { Plus, Trash2 } from 'lucide-react';

export interface BoreShotConfig {
  conduits: Array<{
    sizeIn: string;
    count: number;
    material: string;
  }>;
}

interface BoreShotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: BoreShotConfig) => void;
  initialConfig?: BoreShotConfig | null;
}

const BoreShotConfigModal: React.FC<BoreShotConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialConfig,
}) => {
  const [conduits, setConduits] = useState<
    Array<{
      sizeIn: string;
      count: number;
      material: string;
    }>
  >([]);

  useEffect(() => {
    if (initialConfig) {
      setConduits(initialConfig.conduits);
    } else {
      setConduits([{ sizeIn: '1', count: 1, material: 'PVC' }]);
    }
  }, [initialConfig, isOpen]);

  const addConduit = () => {
    setConduits([...conduits, { sizeIn: '1', count: 1, material: 'PVC' }]);
  };

  const removeConduit = (index: number) => {
    setConduits(conduits.filter((_, i) => i !== index));
  };

  const updateConduit = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedConduits = [...conduits];
    updatedConduits[index] = { ...updatedConduits[index], [field]: value };
    setConduits(updatedConduits);
  };

  const handleConfirm = () => {
    onConfirm({ conduits });
  };

  const conduitSizes = [
    '1/2',
    '3/4',
    '1',
    '1-1/4',
    '1-1/2',
    '2',
    '2-1/2',
    '3',
    '3-1/2',
    '4',
    '5',
    '6',
  ];

  const conduitMaterials = [
    'PVC',
    'HDPE',
    'Steel',
    'Aluminum',
    'Fiber Optic',
    'Copper',
    'Other',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Configure Bore Shot</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label className='text-sm font-medium text-gray-900'>
              Conduits
            </Label>
            <p className='text-xs text-gray-500 mb-3'>
              Configure the conduits for this bore shot
            </p>
          </div>

          <div className='space-y-3'>
            {conduits.map((conduit, index) => (
              <div key={index} className='border rounded-lg p-3 bg-gray-50'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-sm font-medium'>
                    Conduit {index + 1}
                  </span>
                  {conduits.length > 1 && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeConduit(index)}
                      className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  )}
                </div>

                <div className='grid grid-cols-3 gap-2'>
                  <div>
                    <Label htmlFor={`size-${index}`} className='text-xs'>
                      Size
                    </Label>
                    <Select
                      value={conduit.sizeIn}
                      onValueChange={value =>
                        updateConduit(index, 'sizeIn', value)
                      }
                    >
                      <SelectTrigger className='h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conduitSizes.map(size => (
                          <SelectItem key={size} value={size}>
                            {size}"
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`count-${index}`} className='text-xs'>
                      Quantity
                    </Label>
                    <Input
                      id={`count-${index}`}
                      type='number'
                      min='1'
                      value={conduit.count}
                      onChange={e =>
                        updateConduit(
                          index,
                          'count',
                          parseInt(e.target.value) || 1
                        )
                      }
                      className='h-8'
                    />
                  </div>

                  <div>
                    <Label htmlFor={`material-${index}`} className='text-xs'>
                      Material
                    </Label>
                    <Select
                      value={conduit.material}
                      onValueChange={value =>
                        updateConduit(index, 'material', value)
                      }
                    >
                      <SelectTrigger className='h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conduitMaterials.map(material => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addConduit}
            className='w-full'
          >
            <Plus className='h-4 w-4 mr-2' />
            Adicionar Conduto
          </Button>
        </div>

        <div className='flex justify-end space-x-2 pt-4'>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className='bg-red-600 hover:bg-red-700'
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoreShotConfigModal;

