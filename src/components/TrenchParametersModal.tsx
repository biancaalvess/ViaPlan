import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';

interface TrenchParameters {
  width: number;
  depth: number;
  length: number;
  material: string;
  type: string;
  soilType?: string;
  compaction?: boolean;
  drainage?: boolean;
  reinforcement?: boolean;
}

interface TrenchParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parameters: TrenchParameters) => void;
  initialParameters?: Partial<TrenchParameters>;
}

const materialOptions = [
  { value: 'soil', label: 'Solo comum', factor: 1.0 },
  { value: 'clay', label: 'Argila', factor: 1.2 },
  { value: 'sand', label: 'Areia', factor: 0.9 },
  { value: 'rock', label: 'Rocha', factor: 2.5 },
  { value: 'concrete', label: 'Concreto', factor: 2.0 },
  { value: 'asphalt', label: 'Asfalto', factor: 1.5 },
];

const trenchTypes = [
  { value: 'standard', label: 'Padrão', description: 'Vala comum para tubulações' },
  { value: 'narrow', label: 'Estreita', description: 'Vala para cabos e pequenas tubulações' },
  { value: 'wide', label: 'Larga', description: 'Vala para grandes tubulações' },
  { value: 'deep', label: 'Profunda', description: 'Vala com mais de 2m de profundidade' },
  { value: 'foundation', label: 'Fundação', description: 'Vala para fundações' },
];

export function TrenchParametersModal({
  isOpen,
  onClose,
  onSave,
  initialParameters,
}: TrenchParametersModalProps) {
  const [parameters, setParameters] = useState<TrenchParameters>({
    width: initialParameters?.width || 0.6,
    depth: initialParameters?.depth || 1.2,
    length: initialParameters?.length || 0,
    material: initialParameters?.material || 'soil',
    type: initialParameters?.type || 'standard',
    soilType: initialParameters?.soilType || 'normal',
    compaction: initialParameters?.compaction || false,
    drainage: initialParameters?.drainage || false,
    reinforcement: initialParameters?.reinforcement || false,
  });

  const handleSave = () => {
    onSave(parameters);
    onClose();
  };

  const calculateVolume = () => {
    const volume = parameters.width * parameters.depth * parameters.length;
    return volume.toFixed(2);
  };

  const calculateWeight = () => {
    const material = materialOptions.find(m => m.value === parameters.material);
    const volume = parameters.width * parameters.depth * parameters.length;
    const weight = volume * (material?.factor || 1) * 1600; // kg/m³ aproximado
    return weight.toFixed(0);
  };

  const getSelectedMaterial = () => {
    return materialOptions.find(m => m.value === parameters.material);
  };

  const getSelectedType = () => {
    return trenchTypes.find(t => t.value === parameters.type);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            🚧 Parâmetros da Vala
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Dimensões */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              📐 Dimensões
            </h3>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='width'>Largura (m)</Label>
                <Input
                  id='width'
                  type='number'
                  step='0.01'
                  min='0'
                  value={parameters.width}
                  onChange={e =>
                    setParameters({
                      ...parameters,
                      width: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder='0.60'
                />
              </div>
              
              <div>
                <Label htmlFor='depth'>Profundidade (m)</Label>
                <Input
                  id='depth'
                  type='number'
                  step='0.01'
                  min='0'
                  value={parameters.depth}
                  onChange={e =>
                    setParameters({
                      ...parameters,
                      depth: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder='1.20'
                />
              </div>

              <div>
                <Label htmlFor='length'>Comprimento (m)</Label>
                <Input
                  id='length'
                  type='number'
                  step='0.01'
                  min='0'
                  value={parameters.length}
                  onChange={e =>
                    setParameters({
                      ...parameters,
                      length: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder='10.00'
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tipo e Material */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              🏗️ Tipo e Material
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='type'>Tipo da Vala</Label>
                <Select
                  value={parameters.type}
                  onValueChange={value =>
                    setParameters({ ...parameters, type: value })
                  }
                >
                  <SelectTrigger id='type'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trenchTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getSelectedType() && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getSelectedType()?.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='material'>Material do Solo</Label>
                <Select
                  value={parameters.material}
                  onValueChange={value =>
                    setParameters({ ...parameters, material: value })
                  }
                >
                  <SelectTrigger id='material'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materialOptions.map(material => (
                      <SelectItem key={material.value} value={material.value}>
                        <div>
                          <div className="font-medium">{material.label}</div>
                          <div className="text-xs text-gray-500">
                            Fator: {material.factor}x
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getSelectedMaterial() && (
                  <p className="text-xs text-gray-500 mt-1">
                    Fator de dificuldade: {getSelectedMaterial()?.factor}x
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Opções Adicionais */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              ⚙️ Opções Adicionais
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='compaction'
                  checked={parameters.compaction}
                  onChange={e =>
                    setParameters({ ...parameters, compaction: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor='compaction' className="text-sm">
                  🔨 Incluir compactação do solo
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='drainage'
                  checked={parameters.drainage}
                  onChange={e =>
                    setParameters({ ...parameters, drainage: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor='drainage' className="text-sm">
                  💧 Incluir sistema de drenagem
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='reinforcement'
                  checked={parameters.reinforcement}
                  onChange={e =>
                    setParameters({ ...parameters, reinforcement: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor='reinforcement' className="text-sm">
                  🛡️ Incluir reforço estrutural
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cálculos */}
          {parameters.width > 0 && parameters.depth > 0 && parameters.length > 0 && (
            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-800">
                📊 Cálculos Estimados
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div className='text-center'>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculateVolume()}
                  </div>
                  <div className="text-blue-700">m³ de escavação</div>
                </div>
                
                <div className='text-center'>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculateWeight()}
                  </div>
                  <div className="text-blue-700">kg de material</div>
                </div>
                
                <div className='text-center'>
                  <div className="text-2xl font-bold text-blue-600">
                    {(parseFloat(calculateVolume()) * (getSelectedMaterial()?.factor || 1)).toFixed(1)}
                  </div>
                  <div className="text-blue-700">horas estimadas</div>
                </div>
              </div>
              
              <div className='mt-3 pt-3 border-t border-blue-200'>
                <p className='text-xs text-blue-600'>
                  💡 <strong>Fórmula:</strong> Volume = {parameters.width}m × {parameters.depth}m × {parameters.length}m
                </p>
                <p className='text-xs text-blue-600'>
                  ⚖️ <strong>Material:</strong> {getSelectedMaterial()?.label} (fator {getSelectedMaterial()?.factor}x)
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className='bg-red-600 hover:bg-red-700'
            disabled={parameters.width <= 0 || parameters.depth <= 0}
          >
            💾 Salvar Parâmetros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}