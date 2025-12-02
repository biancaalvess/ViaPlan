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
import { Plus, Trash2 } from "lucide-react";

export interface HydroExcavationConfig {
  type: "trench" | "hole" | "potholing";
  section?: {
    shape: "circular" | "rectangular";
    diameter?: number;
    width?: number;
    length?: number;
  };
  depth?: number;
  volumeRemoved?: number;
  efficiencyRatio?: number;
  conduits?: Array<{
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
    type: "trench",
    section: {
      shape: "circular",
      diameter: 0.6,
    },
    depth: 0.9,
    efficiencyRatio: 0.85,
  });

  const [includeConduits, setIncludeConduits] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setIncludeConduits(
        !!initialConfig.conduits && initialConfig.conduits.length > 0
      );
    } else {
      setConfig({
        type: "trench",
        section: {
          shape: "circular",
          diameter: 0.6,
        },
        depth: 0.9,
        efficiencyRatio: 0.85,
      });
      setIncludeConduits(false);
    }
  }, [initialConfig, isOpen]);

  const addConduit = () => {
    setConfig((prev) => ({
      ...prev,
      conduits: [
        ...(prev.conduits || []),
        { sizeIn: "1", count: 1, material: "PVC" },
      ],
    }));
  };

  const removeConduit = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      conduits: prev.conduits?.filter((_, i) => i !== index),
    }));
  };

  const updateConduit = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setConfig((prev) => ({
      ...prev,
      conduits: (prev.conduits || []).map((conduit, i) =>
        i === index ? { ...conduit, [field]: value } : conduit
      ),
    }));
  };

  const handleSave = () => {
    const finalConfig: HydroExcavationConfig = {
      ...config,
      conduits: includeConduits ? config.conduits : undefined,
    };
    onSave(finalConfig);
  };

  const conduitSizes = [
    "1/2",
    "3/4",
    "1",
    "1-1/4",
    "1-1/2",
    "2",
    "2-1/2",
    "3",
    "3-1/2",
    "4",
    "5",
    "6",
  ];

  const conduitMaterials = [
    "PVC",
    "HDPE",
    "Steel",
    "Aluminum",
    "Fiber Optic",
    "Copper",
    "Other",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm md:max-w-md w-full mx-2 sm:mx-4">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-sm">Hidroescavação</DialogTitle>
            <Button
              variant="outline"
              onClick={() => {
                setConfig({
                  type: "trench",
                  section: {
                    shape: "circular",
                    diameter: 0.6,
                  },
                  depth: 0.9,
                  efficiencyRatio: 0.85,
                });
                setIncludeConduits(false);
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
              Escavação com jato d'água e vácuo. Usada para travessias
              sensíveis.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Traçado */}
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-600 leading-tight">
              <strong>Traçado (reta ou polilinha):</strong> Desenhe a trajetória
              no plano para definir o percurso da hidroescavação.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Seção Nominal */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Seção nominal (geralmente circular)
            </h3>
            <div className="space-y-1.5">
              <div>
                <Label htmlFor="section-shape" className="text-xs">
                  Formato
                </Label>
                <Select
                  value={config.section?.shape || "circular"}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      section: {
                        shape: value as "circular" | "rectangular",
                        diameter:
                          value === "circular"
                            ? prev.section?.diameter || 0.6
                            : undefined,
                        width:
                          value === "rectangular"
                            ? prev.section?.width || 0.6
                            : undefined,
                        length:
                          value === "rectangular"
                            ? prev.section?.length || 0.6
                            : undefined,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="rectangular">Retangular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {config.section?.shape === "circular" ? (
                <div>
                  <Label htmlFor="section-diameter" className="text-xs">
                    Diâmetro (m)
                  </Label>
                  <Input
                    id="section-diameter"
                    type="number"
                    step="0.01"
                    value={config.section?.diameter || 0}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        section: {
                          ...prev.section,
                          shape: "circular",
                          diameter: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="h-7 text-xs"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <Label htmlFor="section-width" className="text-xs">
                      Largura (m)
                    </Label>
                    <Input
                      id="section-width"
                      type="number"
                      step="0.01"
                      value={config.section?.width || 0}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          section: {
                            ...prev.section,
                            shape: "rectangular",
                            width: parseFloat(e.target.value) || 0,
                            length: prev.section?.length || 0.6,
                          },
                        }))
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="section-length" className="text-xs">
                      Comprimento (m)
                    </Label>
                    <Input
                      id="section-length"
                      type="number"
                      step="0.01"
                      value={config.section?.length || 0}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          section: {
                            ...prev.section,
                            shape: "rectangular",
                            width: prev.section?.width || 0.6,
                            length: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      className="h-7 text-xs"
                    />
                  </div>
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
              <Label htmlFor="depth" className="text-xs">
                Profundidade (m)
              </Label>
              <Input
                id="depth"
                type="number"
                step="0.01"
                value={config.depth || 0}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    depth: parseFloat(e.target.value) || 0,
                  }))
                }
                className="h-7 text-xs"
              />
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Volume Removido */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Volume removido
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Será calculado automaticamente com base na seção e profundidade.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Relação de Eficiência */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="efficiency-ratio"
                checked={!!config.efficiencyRatio}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    efficiencyRatio: checked ? 0.85 : undefined,
                  }))
                }
                className="h-4 w-4"
              />
              <Label
                htmlFor="efficiency-ratio"
                className="text-[11px] leading-tight"
              >
                Relação de eficiência (opcional: perda por colapso ou material
                aspirado extra)
              </Label>
            </div>
            {config.efficiencyRatio !== undefined && (
              <div className="pl-5">
                <Label htmlFor="efficiency-value" className="text-xs">
                  Relação (0-1)
                </Label>
                <Input
                  id="efficiency-value"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={config.efficiencyRatio || 0.85}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      efficiencyRatio: parseFloat(e.target.value) || 0.85,
                    }))
                  }
                  className="h-7 text-xs"
                />
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                  Valor entre 0 e 1. Ex: 0.85 = 85% de eficiência
                </p>
              </div>
            )}
          </div>

          <Separator className="my-1.5" />

          {/* Condutos */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-conduits"
                checked={includeConduits}
                onCheckedChange={(checked) => {
                  const newIncludeConduits = checked as boolean;
                  setIncludeConduits(newIncludeConduits);
                  if (
                    newIncludeConduits &&
                    (!config.conduits || config.conduits.length === 0)
                  ) {
                    setConfig((prev) => ({
                      ...prev,
                      conduits: [{ sizeIn: "1", count: 1, material: "PVC" }],
                    }));
                  } else if (!newIncludeConduits) {
                    setConfig((prev) => ({
                      ...prev,
                      conduits: undefined,
                    }));
                  }
                }}
                className="h-4 w-4"
              />
              <Label
                htmlFor="include-conduits"
                className="text-[11px] leading-tight"
              >
                Incluir Condutos
              </Label>
            </div>
            {includeConduits && config.conduits && (
              <div className="space-y-1 pl-5">
                {config.conduits.map((conduit, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-1.5 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium">
                        Conduto {index + 1}
                      </span>
                      {config.conduits && config.conduits.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConduit(index)}
                          className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <Label className="text-xs">Tamanho</Label>
                        <Select
                          value={conduit.sizeIn}
                          onValueChange={(value) =>
                            updateConduit(index, "sizeIn", value)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conduitSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}"
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={conduit.count}
                          onChange={(e) =>
                            updateConduit(
                              index,
                              "count",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="h-7 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Material</Label>
                        <Select
                          value={conduit.material}
                          onValueChange={(value) =>
                            updateConduit(index, "material", value)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conduitMaterials.map((material) => (
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
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConduit}
                  className="w-full h-7 text-xs mt-1"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Conduto
                </Button>
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
              Comprimento + volume de remoção.
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
            onClick={handleSave}
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0] h-7 text-xs px-3"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HydroExcavationConfigModal;
