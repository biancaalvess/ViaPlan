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
import { Plus, Trash2 } from 'lucide-react';

export interface HydroExcavationConfig {
  type: 'trench' | 'hole' | 'potholing';
  holeShape?: 'rectangle' | 'circle';
  holeDimensions?: {
    length?: number;
    width?: number;
    diameter?: number;
    depth?: number;
    depthUnit?: 'inches' | 'feet';
  };
  potholingData?: {
    surfaceType?: 'asphalt' | 'concrete' | 'dirt';
    averageDepth?: number;
    depthUnit?: 'inches' | 'feet';
    includeRestoration?: boolean;
  };
  conduits: Array<{
    sizeIn: string;
    count: number;
    material: string;
  }>;
}

interface HydroExcavationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: HydroExcavationConfig) => void;
  initialConfig?: HydroExcavationConfig | null;
}

const HydroExcavationConfigModal: React.FC<HydroExcavationConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [config, setConfig] = useState<HydroExcavationConfig>({
    type: 'trench',
    conduits: [{ sizeIn: '1', count: 1, material: 'PVC' }],
  });

  const [includeConduits, setIncludeConduits] = useState(true);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setIncludeConduits(initialConfig.conduits.length > 0);
    }
  }, [initialConfig]);

  const addConduit = () => {
    setConfig(prev => ({
      ...prev,
      conduits: [...prev.conduits, { sizeIn: '1', count: 1, material: 'PVC' }],
    }));
  };

  const removeConduit = (index: number) => {
    setConfig(prev => ({
      ...prev,
      conduits: prev.conduits.filter((_, i) => i !== index),
    }));
  };

  const updateConduit = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setConfig(prev => ({
      ...prev,
      conduits: prev.conduits.map((conduit, i) =>
        i === index ? { ...conduit, [field]: value } : conduit
      ),
    }));
  };

  const handleSave = () => {
    const finalConfig = {
      ...config,
      conduits: includeConduits ? config.conduits : [],
    };
    onSave(finalConfig);
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

  const surfaceTypes = ['asphalt', 'concrete', 'dirt'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Configure Hydro Excavation</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Type Selection */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-900'>
              Excavation Type
            </h3>
            <Select
              value={config.type}
              onChange={e =>
                setConfig(prev => ({
                  ...prev,
                  type: e.target.value as 'trench' | 'hole' | 'potholing',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='trench'>Trench</SelectItem>
                <SelectItem value='hole'>Hole</SelectItem>
                <SelectItem value='potholing'>Potholing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Hole Configuration */}
          {config.type === 'hole' && (
            <>
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-gray-900'>
                  Hole Configuration
                </h3>

                <div>
                  <Label htmlFor='hole-shape'>Shape</Label>
                  <Select
                    value={config.holeShape || 'rectangle'}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        holeShape: e.target.value as 'rectangle' | 'circle',
                        holeDimensions: {
                          ...prev.holeDimensions,
                          depth: 3,
                          depthUnit: 'feet',
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='rectangle'>Rectangular</SelectItem>
                      <SelectItem value='circle'>Circular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  {config.holeShape === 'rectangle' ? (
                    <>
                      <div>
                        <Label htmlFor='hole-length'>Length (ft)</Label>
                        <Input
                          id='hole-length'
                          type='number'
                          step='0.1'
                          value={config.holeDimensions?.length || 0}
                          onChange={e =>
                            setConfig(prev => ({
                              ...prev,
                              holeDimensions: {
                                ...prev.holeDimensions,
                                length: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor='hole-width'>Width (ft)</Label>
                        <Input
                          id='hole-width'
                          type='number'
                          step='0.1'
                          value={config.holeDimensions?.width || 0}
                          onChange={e =>
                            setConfig(prev => ({
                              ...prev,
                              holeDimensions: {
                                ...prev.holeDimensions,
                                width: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label htmlFor='hole-diameter'>Diameter (ft)</Label>
                      <Input
                        id='hole-diameter'
                        type='number'
                        step='0.1'
                        value={config.holeDimensions?.diameter || 0}
                        onChange={e =>
                          setConfig(prev => ({
                            ...prev,
                            holeDimensions: {
                              ...prev.holeDimensions,
                              diameter: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='hole-depth'>Depth</Label>
                    <Input
                      id='hole-depth'
                      type='number'
                      step='0.1'
                      value={config.holeDimensions?.depth || 0}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          holeDimensions: {
                            ...prev.holeDimensions,
                            depth: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='hole-depth-unit'>Unit</Label>
                    <Select
                      value={config.holeDimensions?.depthUnit || 'feet'}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          holeDimensions: {
                            ...prev.holeDimensions,
                            depthUnit: e.target.value as 'inches' | 'feet',
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='feet'>Feet</SelectItem>
                        <SelectItem value='inches'>Inches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Potholing Configuration */}
          {config.type === 'potholing' && (
            <>
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-gray-900'>
                  Potholing Configuration
                </h3>

                <div>
                  <Label htmlFor='surface-type'>Surface Type</Label>
                  <Select
                    value={config.potholingData?.surfaceType || 'asphalt'}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        potholingData: {
                          ...prev.potholingData,
                          surfaceType: e.target.value as
                            | 'asphalt'
                            | 'concrete'
                            | 'dirt',
                          averageDepth: 12,
                          depthUnit: 'inches',
                          includeRestoration: false,
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='asphalt'>Asphalt</SelectItem>
                      <SelectItem value='concrete'>Concrete</SelectItem>
                      <SelectItem value='dirt'>Dirt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='pothole-depth'>Average Depth</Label>
                    <Input
                      id='pothole-depth'
                      type='number'
                      step='0.1'
                      value={config.potholingData?.averageDepth || 0}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          potholingData: {
                            ...prev.potholingData,
                            averageDepth: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='pothole-depth-unit'>Unit</Label>
                    <Select
                      value={config.potholingData?.depthUnit || 'inches'}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          potholingData: {
                            ...prev.potholingData,
                            depthUnit: e.target.value as 'inches' | 'feet',
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='inches'>Inches</SelectItem>
                        <SelectItem value='feet'>Feet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='include-restoration'
                    checked={config.potholingData?.includeRestoration || false}
                    onCheckedChange={checked =>
                      setConfig(prev => ({
                        ...prev,
                        potholingData: {
                          ...prev.potholingData,
                          includeRestoration: checked as boolean,
                        },
                      }))
                    }
                  />
                  <Label htmlFor='include-restoration'>
                    Include Restoration
                  </Label>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Conduits Configuration */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='include-conduits'
                checked={includeConduits}
                onCheckedChange={checked =>
                  setIncludeConduits(checked as boolean)
                }
              />
              <Label htmlFor='include-conduits'>Include Conduits</Label>
            </div>

            {includeConduits && (
              <div className='space-y-3'>
                {config.conduits.map((conduit, index) => (
                  <div key={index} className='border rounded-lg p-3 bg-gray-50'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-medium'>
                        Conduit {index + 1}
                      </span>
                      {config.conduits.length > 1 && (
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
                        <Label className='text-xs'>Size</Label>
                        <Select
                          value={conduit.sizeIn}
                          onChange={e =>
                            updateConduit(index, 'sizeIn', e.target.value)
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
                        <Label className='text-xs'>Quantity</Label>
                        <Input
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
                        <Label className='text-xs'>Material</Label>
                        <Select
                          value={conduit.material}
                          onChange={e =>
                            updateConduit(index, 'material', e.target.value)
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

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addConduit}
                  className='w-full'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Conduit
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end space-x-2 pt-4'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className='bg-red-600 hover:bg-red-700'>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HydroExcavationConfigModal;
