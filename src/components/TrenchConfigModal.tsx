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

export interface TrenchConfig {
  width: {
    type: "constant" | "variable";
    value: number;
    values?: number[];
  };
  depth: {
    type: "constant" | "variable";
    value: number;
    values?: number[];
  };
  soilType?: string;
  crossSections?: Array<{
    position: number;
    width: number;
    depth: number;
    profile?: Array<{ x: number; y: number }>;
  }>;
}

// Internal state interface for easier updates
interface TrenchConfigState {
  width: {
    type: "constant" | "variable";
    value: number;
    values?: number[];
  };
  depth: {
    type: "constant" | "variable";
    value: number;
    values?: number[];
  };
  soilType?: string;
  crossSections?: Array<{
    position: number;
    width: number;
    depth: number;
    profile?: Array<{ x: number; y: number }>;
  }>;
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
    width: {
      type: "constant",
      value: 0.6,
    },
    depth: {
      type: "constant",
      value: 0.9,
    },
  });

  const [includeSoilType, setIncludeSoilType] = useState(false);
  const [includeCrossSections, setIncludeCrossSections] = useState(false);

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
      setIncludeSoilType(!!initialConfig.soilType);
      setIncludeCrossSections(
        !!initialConfig.crossSections && initialConfig.crossSections.length > 0
      );

      // Inicializar histórico
      setHistory([newConfig]);
      setHistoryIndex(0);
    } else {
      // Resetar para valores padrão
      setConfig({
        width: {
          type: "constant",
          value: 0.6,
        },
        depth: {
          type: "constant",
          value: 0.9,
        },
      });
      setIncludeSoilType(false);
      setIncludeCrossSections(false);
    }
  }, [initialConfig, isOpen]);

  const handleConfirm = () => {
    const finalConfig: TrenchConfig = {
      ...config,
      soilType: includeSoilType ? config.soilType : undefined,
      crossSections: includeCrossSections ? config.crossSections : undefined,
    };
    onConfirm(finalConfig);
  };

  const soilTypes = ["Argila", "Areia", "Rocha", "Misturado"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm md:max-w-md w-full mx-2 sm:mx-4">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-sm">Configurar Trincheira</DialogTitle>
            <Button
              variant="outline"
              onClick={undoLastChange}
              disabled={!canUndo}
              className="text-xs h-7 px-2"
            >
              Desfazer
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Traçado */}
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-600">
              <strong>Traçado (polilinha):</strong> Desenhe a polilinha no plano
              para definir o traçado da trincheira.
            </p>
          </div>

          <Separator className="my-2" />

          {/* Largura */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Largura média ou variável
            </h3>
            <div className="space-y-1.5">
              <div>
                <Label htmlFor="width-type" className="text-xs">
                  Tipo
                </Label>
                <Select
                  value={config.width.type}
                  onValueChange={(value) => {
                    const newConfig = {
                      ...config,
                      width: {
                        type: value as "constant" | "variable",
                        value: config.width.value,
                        values:
                          value === "variable"
                            ? [config.width.value]
                            : undefined,
                      },
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="constant">Média (constante)</SelectItem>
                    <SelectItem value="variable">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="width-value" className="text-xs">
                  {config.width.type === "constant"
                    ? "Largura (m)"
                    : "Largura inicial (m)"}
                </Label>
                <Input
                  id="width-value"
                  type="number"
                  step="0.01"
                  value={config.width.value}
                  onChange={(e) => {
                    const newConfig = {
                      ...config,
                      width: {
                        ...config.width,
                        value: parseFloat(e.target.value) || 0,
                      },
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Profundidade */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Profundidade média ou variável
            </h3>
            <div className="space-y-1.5">
              <div>
                <Label htmlFor="depth-type" className="text-xs">
                  Tipo
                </Label>
                <Select
                  value={config.depth.type}
                  onValueChange={(value) => {
                    const newConfig = {
                      ...config,
                      depth: {
                        type: value as "constant" | "variable",
                        value: config.depth.value,
                        values:
                          value === "variable"
                            ? [config.depth.value]
                            : undefined,
                      },
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="constant">Média (constante)</SelectItem>
                    <SelectItem value="variable">Variável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="depth-value" className="text-xs">
                  {config.depth.type === "constant"
                    ? "Profundidade (m)"
                    : "Profundidade inicial (m)"}
                </Label>
                <Input
                  id="depth-value"
                  type="number"
                  step="0.01"
                  value={config.depth.value}
                  onChange={(e) => {
                    const newConfig = {
                      ...config,
                      depth: {
                        ...config.depth,
                        value: parseFloat(e.target.value) || 0,
                      },
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Tipo de Solo */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="soil-type"
                checked={includeSoilType}
                onCheckedChange={(checked) => {
                  const newIncludeSoil = checked as boolean;
                  setIncludeSoilType(newIncludeSoil);

                  if (newIncludeSoil && !config.soilType) {
                    const newConfig = {
                      ...config,
                      soilType: "Argila",
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  } else if (!newIncludeSoil) {
                    const newConfig = {
                      ...config,
                      soilType: undefined,
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }
                }}
                className="h-4 w-4"
              />
              <Label htmlFor="soil-type" className="text-[11px] leading-tight">
                Tipo de solo (opcional: só influencia custo ou cálculo
                geotécnico futuro)
              </Label>
            </div>

            {includeSoilType && (
              <div className="pl-5">
                <Select
                  value={config.soilType || "Argila"}
                  onValueChange={(value) => {
                    const newConfig = {
                      ...config,
                      soilType: value,
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator className="my-2" />

          {/* Cálculo de Volume */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Cálculo de volume (L × W × D)
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              O volume será calculado automaticamente com base no comprimento
              (L), largura (W) e profundidade (D) da trincheira.
            </p>
          </div>

          <Separator className="my-2" />

          {/* Seções Transversais */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cross-sections"
                checked={includeCrossSections}
                onCheckedChange={(checked) => {
                  const newIncludeCross = checked as boolean;
                  setIncludeCrossSections(newIncludeCross);

                  if (
                    newIncludeCross &&
                    (!config.crossSections || config.crossSections.length === 0)
                  ) {
                    const newConfig = {
                      ...config,
                      crossSections: [],
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  } else if (!newIncludeCross) {
                    const newConfig = {
                      ...config,
                      crossSections: undefined,
                    };
                    setConfig(newConfig);
                    saveToHistory(newConfig);
                  }
                }}
                className="h-4 w-4"
              />
              <Label
                htmlFor="cross-sections"
                className="text-[11px] leading-tight"
              >
                Seções transversais opcionais (quando o usuário precisar perfis
                mais técnicos)
              </Label>
            </div>
            {includeCrossSections && (
              <div className="pl-5">
                <p className="text-[11px] text-gray-600 leading-tight">
                  As seções transversais podem ser adicionadas durante a medição
                  no plano.
                </p>
              </div>
            )}
          </div>

          <Separator className="my-2" />

          {/* Exportar */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Exportar metragem/volume
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Use os botões "Exportar CSV" ou "Exportar JSON" no cabeçalho para
              exportar as medições e volumes calculados.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 mt-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-8 text-xs px-3"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#2f486d] hover:bg-[#3d5a7d] text-[#f3eae0] h-8 text-xs px-3"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrenchConfigModal;
