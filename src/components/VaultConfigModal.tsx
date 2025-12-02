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
  type?: string; // poço de visita, caixa de passagem, etc.
  shape?: "rectangular" | "circular";
  dimensions?: {
    length?: number; // m (para retangular)
    width?: number; // m (para retangular)
    diameter?: number; // m (para circular)
    depth: number; // m
  };
  material?: string;
  class?: string;
  quantity?: number;
  volume?: number; // m³ (opcional)
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
  const [config, setConfig] = useState<VaultConfig>({
    type: "Poço de Visita",
    shape: "rectangular",
    dimensions: {
      length: 1.2,
      width: 1.2,
      depth: 1.5,
    },
    material: "Concreto",
    quantity: 1,
  });

  const [includeVolume, setIncludeVolume] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setIncludeVolume(!!initialConfig.volume);
    } else {
      setConfig({
        type: "Poço de Visita",
        shape: "rectangular",
        dimensions: {
          length: 1.2,
          width: 1.2,
          depth: 1.5,
        },
        material: "Concreto",
        quantity: 1,
      });
      setIncludeVolume(false);
    }
  }, [initialConfig, isOpen]);

  const handleConfirm = () => {
    const finalConfig: VaultConfig = {
      ...config,
      volume: includeVolume ? config.volume : undefined,
    };
    onConfirm(finalConfig);
  };

  const vaultTypes = [
    "Poço de Visita",
    "Caixa de Passagem",
    "Caixa de Inspeção",
    "Caixa de Emenda",
    "Caixa de Derivação",
    "Outro",
  ];

  const materials = [
    "Concreto",
    "Concreto Armado",
    "PVC",
    "PEAD",
    "Aço",
    "Alumínio",
    "Fibra de Vidro",
    "Outro",
  ];

  const classes = [
    "Classe A",
    "Classe B",
    "Classe C",
    "Classe D",
    "H-20",
    "H-25",
    "Outro",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm md:max-w-md w-full mx-2 sm:mx-4">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-sm">Câmara / Buraco de Mão</DialogTitle>
            <Button
              variant="outline"
              onClick={() => {
                setConfig({
                  type: "Poço de Visita",
                  shape: "rectangular",
                  dimensions: {
                    length: 1.2,
                    width: 1.2,
                    depth: 1.5,
                  },
                  material: "Concreto",
                  quantity: 1,
                });
                setIncludeVolume(false);
              }}
              className="text-xs h-7 px-2"
            >
              Desfazer
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Descrição */}
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-600 leading-tight">
              Infraestrutura pontual para acesso/inspeção.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Tipo */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Tipo (poço de visita, caixa de passagem etc.)
            </h3>
            <div>
              <Label htmlFor="vault-type" className="text-xs">Tipo</Label>
              <Select
                value={config.type || "Poço de Visita"}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vaultTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Dimensões */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Dimensões (retangular/circular)
            </h3>
            <div className="space-y-1.5">
              <div>
                <Label htmlFor="vault-shape" className="text-xs">Formato</Label>
                <Select
                  value={config.shape || "rectangular"}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      shape: value as "rectangular" | "circular",
                      dimensions: {
                        ...prev.dimensions,
                        length:
                          value === "rectangular"
                            ? prev.dimensions?.length || 1.2
                            : undefined,
                        width:
                          value === "rectangular"
                            ? prev.dimensions?.width || 1.2
                            : undefined,
                        diameter:
                          value === "circular"
                            ? prev.dimensions?.diameter || 1.2
                            : undefined,
                        depth: prev.dimensions?.depth || 1.5,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangular">Retangular</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {config.shape === "rectangular" ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <Label htmlFor="vault-length" className="text-xs">
                      Comprimento (m)
                    </Label>
                    <Input
                      id="vault-length"
                      type="number"
                      step="0.01"
                      value={config.dimensions?.length || 0}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            length: parseFloat(e.target.value) || 0,
                            width: prev.dimensions?.width || 1.2,
                            depth: prev.dimensions?.depth || 1.5,
                          },
                        }))
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vault-width" className="text-xs">
                      Largura (m)
                    </Label>
                    <Input
                      id="vault-width"
                      type="number"
                      step="0.01"
                      value={config.dimensions?.width || 0}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            length: prev.dimensions?.length || 1.2,
                            width: parseFloat(e.target.value) || 0,
                            depth: prev.dimensions?.depth || 1.5,
                          },
                        }))
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="vault-diameter" className="text-xs">
                    Diâmetro (m)
                  </Label>
                  <Input
                    id="vault-diameter"
                    type="number"
                    step="0.01"
                    value={config.dimensions?.diameter || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          diameter: parseFloat(e.target.value) || 0,
                          depth: prev.dimensions?.depth || 1.5,
                        },
                      }))
                    }
                    className="h-7 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Profundidade */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Profundidade
            </h3>
            <div>
              <Label htmlFor="vault-depth" className="text-xs">
                Profundidade (m)
              </Label>
              <Input
                id="vault-depth"
                type="number"
                step="0.01"
                value={config.dimensions?.depth || 0}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    dimensions: {
                      ...prev.dimensions,
                      depth: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                className="h-7 text-xs"
              />
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Material/Classe */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Material/Classe
            </h3>
            <div className="space-y-1.5">
              <div>
                <Label htmlFor="vault-material" className="text-xs">
                  Material
                </Label>
                <Select
                  value={config.material || "Concreto"}
                  onValueChange={(value) =>
                    setConfig((prev) => ({ ...prev, material: value }))
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vault-class" className="text-xs">
                  Classe
                </Label>
                <Select
                  value={config.class || ""}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      class: value || undefined,
                    }))
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">N/A</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Quantidade */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Quantidade
            </h3>
            <div>
              <Label htmlFor="vault-quantity" className="text-xs">
                Quantidade
              </Label>
              <Input
                id="vault-quantity"
                type="number"
                min="1"
                value={config.quantity || 1}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
                className="h-7 text-xs"
              />
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Volume (Opcional) */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-volume"
                checked={includeVolume}
                onCheckedChange={(checked) => {
                  setIncludeVolume(checked as boolean);
                  if (checked && !config.volume) {
                    setConfig((prev) => ({ ...prev, volume: 0 }));
                  } else if (!checked) {
                    setConfig((prev) => ({ ...prev, volume: undefined }));
                  }
                }}
                className="h-4 w-4"
              />
              <Label htmlFor="include-volume" className="text-[11px] leading-tight">
                Volume da estrutura (opcional)
              </Label>
            </div>
            {includeVolume && (
              <div className="pl-5">
                <Label htmlFor="vault-volume" className="text-xs">
                  Volume (m³)
                </Label>
                <Input
                  id="vault-volume"
                  type="number"
                  step="0.01"
                  value={config.volume || 0}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      volume: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-7 text-xs"
                  placeholder="Será calculado automaticamente"
                />
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                  Será calculado automaticamente com base nas dimensões
                </p>
              </div>
            )}
          </div>

          <Separator className="my-1.5" />

          {/* Resultado Principal */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Resultado principal
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Contagem + volume da estrutura (opcional).
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-7 text-xs px-3"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0] h-7 text-xs px-3"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VaultConfigModal;
