import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export interface VaultConfig {
  dimensions?: {
    length: number;
    width: number;
    depth: number;
  };
  holeSize?: {
    length: number;
    width: number;
    depth: number;
  };
  spoilVolumeCY?: number;
  asphaltRemovalCY?: number;
  concreteRemovalCY?: number;
  asphaltRestorationCY?: number;
  concreteRestorationCY?: number;
  backfillCY?: number;
  backfillType?: string;
  trafficRated?: boolean;
}

// Internal state interface for easier updates
interface VaultConfigState {
  dimensions?: {
    length: number;
    width: number;
    depth: number;
  };
  holeSize?: {
    length: number;
    width: number;
    depth: number;
  };
  spoilVolumeCY?: number;
  asphaltRemovalCY?: number;
  concreteRemovalCY?: number;
  asphaltRestorationCY?: number;
  concreteRestorationCY?: number;
  backfillCY?: number;
  backfillType?: string;
  trafficRated?: boolean;
}

interface VaultConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: VaultConfig) => void;
  initialConfig?: VaultConfig | null;
}

const VaultConfigModal: React.FC<VaultConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialConfig,
}) => {
  const [config, setConfig] = useState<VaultConfigState>({});

  const [includeDimensions, setIncludeDimensions] = useState(false);
  const [includeHoleSize, setIncludeHoleSize] = useState(false);
  const [includeSpoilVolume, setIncludeSpoilVolume] = useState(false);
  const [includeAsphaltRemoval, setIncludeAsphaltRemoval] = useState(false);
  const [includeConcreteRemoval, setIncludeConcreteRemoval] = useState(false);
  const [includeAsphaltRestoration, setIncludeAsphaltRestoration] =
    useState(false);
  const [includeConcreteRestoration, setIncludeConcreteRestoration] =
    useState(false);
  const [includeBackfill, setIncludeBackfill] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setIncludeDimensions(!!initialConfig.dimensions);
      setIncludeHoleSize(!!initialConfig.holeSize);
      setIncludeSpoilVolume(!!initialConfig.spoilVolumeCY);
      setIncludeAsphaltRemoval(!!initialConfig.asphaltRemovalCY);
      setIncludeConcreteRemoval(!!initialConfig.concreteRemovalCY);
      setIncludeAsphaltRestoration(!!initialConfig.asphaltRestorationCY);
      setIncludeConcreteRestoration(!!initialConfig.concreteRestorationCY);
      setIncludeBackfill(!!initialConfig.backfillCY);
    }
  }, [initialConfig]);

  const handleConfirm = () => {
    const finalConfig: VaultConfig = {
      ...config,
      dimensions: includeDimensions ? config.dimensions : undefined,
      holeSize: includeHoleSize ? config.holeSize : undefined,
      spoilVolumeCY: includeSpoilVolume ? config.spoilVolumeCY : undefined,
      asphaltRemovalCY: includeAsphaltRemoval
        ? config.asphaltRemovalCY
        : undefined,
      concreteRemovalCY: includeConcreteRemoval
        ? config.concreteRemovalCY
        : undefined,
      asphaltRestorationCY: includeAsphaltRestoration
        ? config.asphaltRestorationCY
        : undefined,
      concreteRestorationCY: includeConcreteRestoration
        ? config.concreteRestorationCY
        : undefined,
      backfillCY: includeBackfill ? config.backfillCY : undefined,
    };
    onConfirm(finalConfig);
  };

  const backfillTypes = [
    "Solo Nativo",
    "Reaterro Fluido",
    "Areia",
    "Cascalho",
    "Pedra Britada",
    "Personalizado",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg w-full mx-2 sm:mx-4">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Configurar Câmara/Buraco de Mão</DialogTitle>
            <Button
              variant="outline"
              onClick={() => setConfig({})}
              className="text-sm"
            >
              Desfazer
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Dimensions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-dimensions"
                checked={includeDimensions}
                onCheckedChange={(checked) =>
                  setIncludeDimensions(checked as boolean)
                }
              />
              <Label htmlFor="include-dimensions">Dimensões da Câmara</Label>
            </div>

            {includeDimensions && (
              <div className="grid grid-cols-3 gap-4 pl-6">
                <div>
                  <Label htmlFor="vault-length">Comprimento (ft)</Label>
                  <Input
                    id="vault-length"
                    type="number"
                    step="0.1"
                    value={config.dimensions?.length || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        dimensions: {
                          length: parseFloat(e.target.value) || 0,
                          width: prev.dimensions?.width || 0,
                          depth: prev.dimensions?.depth || 0,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vault-width">Largura (ft)</Label>
                  <Input
                    id="vault-width"
                    type="number"
                    step="0.1"
                    value={config.dimensions?.width || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        dimensions: {
                          length: prev.dimensions?.length || 0,
                          width: parseFloat(e.target.value) || 0,
                          depth: prev.dimensions?.depth || 0,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="vault-depth">Profundidade (ft)</Label>
                  <Input
                    id="vault-depth"
                    type="number"
                    step="0.1"
                    value={config.dimensions?.depth || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        dimensions: {
                          length: prev.dimensions?.length || 0,
                          width: prev.dimensions?.width || 0,
                          depth: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Hole Size */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-hole-size"
                checked={includeHoleSize}
                onCheckedChange={(checked) =>
                  setIncludeHoleSize(checked as boolean)
                }
              />
              <Label htmlFor="include-hole-size">Tamanho do Buraco</Label>
            </div>

            {includeHoleSize && (
              <div className="grid grid-cols-3 gap-4 pl-6">
                <div>
                  <Label htmlFor="hole-length">Comprimento (ft)</Label>
                  <Input
                    id="hole-length"
                    type="number"
                    step="0.1"
                    value={config.holeSize?.length || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        holeSize: {
                          length: parseFloat(e.target.value) || 0,
                          width: prev.holeSize?.width || 0,
                          depth: prev.holeSize?.depth || 0,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="hole-width">Largura (ft)</Label>
                  <Input
                    id="hole-width"
                    type="number"
                    step="0.1"
                    value={config.holeSize?.width || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        holeSize: {
                          length: prev.holeSize?.length || 0,
                          width: parseFloat(e.target.value) || 0,
                          depth: prev.holeSize?.depth || 0,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="hole-depth">Profundidade (ft)</Label>
                  <Input
                    id="hole-depth"
                    type="number"
                    step="0.1"
                    value={config.holeSize?.depth || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        holeSize: {
                          length: prev.holeSize?.length || 0,
                          width: prev.holeSize?.width || 0,
                          depth: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Volumes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Volumes (CY)</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-spoil-volume"
                  checked={includeSpoilVolume}
                  onCheckedChange={(checked) =>
                    setIncludeSpoilVolume(checked as boolean)
                  }
                />
                <Label htmlFor="include-spoil-volume">
                  Volume de Escavação (CY)
                </Label>
              </div>
              {includeSpoilVolume && (
                <div className="pl-6">
                  <Input
                    type="number"
                    step="0.1"
                    value={config.spoilVolumeCY || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        spoilVolumeCY: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-asphalt-removal"
                  checked={includeAsphaltRemoval}
                  onCheckedChange={(checked) =>
                    setIncludeAsphaltRemoval(checked as boolean)
                  }
                />
                <Label htmlFor="include-asphalt-removal">
                  Remoção de Asfalto (CY)
                </Label>
              </div>
              {includeAsphaltRemoval && (
                <div className="pl-6">
                  <Input
                    type="number"
                    step="0.1"
                    value={config.asphaltRemovalCY || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        asphaltRemovalCY: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-concrete-removal"
                  checked={includeConcreteRemoval}
                  onCheckedChange={(checked) =>
                    setIncludeConcreteRemoval(checked as boolean)
                  }
                />
                <Label htmlFor="include-concrete-removal">
                  Remoção de Concreto (CY)
                </Label>
              </div>
              {includeConcreteRemoval && (
                <div className="pl-6">
                  <Input
                    type="number"
                    step="0.1"
                    value={config.concreteRemovalCY || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        concreteRemovalCY: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-asphalt-restoration"
                  checked={includeAsphaltRestoration}
                  onCheckedChange={(checked) =>
                    setIncludeAsphaltRestoration(checked as boolean)
                  }
                />
                <Label htmlFor="include-asphalt-restoration">
                  Restauração de Asfalto (CY)
                </Label>
              </div>
              {includeAsphaltRestoration && (
                <div className="pl-6">
                  <Input
                    type="number"
                    step="0.1"
                    value={config.asphaltRestorationCY || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        asphaltRestorationCY: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-concrete-restoration"
                  checked={includeConcreteRestoration}
                  onCheckedChange={(checked) =>
                    setIncludeConcreteRestoration(checked as boolean)
                  }
                />
                <Label htmlFor="include-concrete-restoration">
                  Restauração de Concreto (CY)
                </Label>
              </div>
              {includeConcreteRestoration && (
                <div className="pl-6">
                  <Input
                    type="number"
                    step="0.1"
                    value={config.concreteRestorationCY || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        concreteRestorationCY: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-backfill"
                  checked={includeBackfill}
                  onCheckedChange={(checked) =>
                    setIncludeBackfill(checked as boolean)
                  }
                />
                <Label htmlFor="include-backfill">Reaterro (CY)</Label>
              </div>
              {includeBackfill && (
                <div className="space-y-3 pl-6">
                  <Input
                    type="number"
                    step="0.1"
                    value={config.backfillCY || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        backfillCY: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                  <div>
                    <Label htmlFor="backfill-type">Tipo de Reaterro</Label>
                    <Select
                      value={config.backfillType || "Solo Nativo"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          backfillType: e.target.value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backfillTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Traffic Rated */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="traffic-rated"
              checked={config.trafficRated || false}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  trafficRated: checked as boolean,
                }))
              }
            />
            <Label htmlFor="traffic-rated">Classificado para Tráfego</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0]"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VaultConfigModal;
