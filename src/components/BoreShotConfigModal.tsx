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
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface BoreShotConfig {
  conduits: Array<{
    sizeIn: string;
    count: number;
    material: string;
    sdr?: string;
    outerDiameterMm?: number;
    minCurvatureRadiusM?: number;
  }>;
  entryAngleDegrees?: number;
  exitAngleDegrees?: number;
  minDepthGuaranteedM?: number;
  drillDiameterMm?: number;
  backreamerDiameterMm?: number;
  lengthM?: number;
  validation?: {
    radiusCheck?: {
      passed: boolean;
      minRadiusRequiredM: number;
      minRadiusActualM: number;
      violations: Array<{ position: number; radius: number }>;
    };
    depthCheck?: {
      passed: boolean;
      minDepthRequiredM: number;
      minDepthActualM: number;
      violations: Array<{ position: number; depth: number }>;
    };
  };
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
      sdr?: string;
      outerDiameterMm?: number;
      minCurvatureRadiusM?: number;
    }>
  >([]);
  const [entryAngle, setEntryAngle] = useState<number>(15);
  const [exitAngle, setExitAngle] = useState<number>(15);
  const [minDepth, setMinDepth] = useState<number>(2.44);
  const [drillDiameter, setDrillDiameter] = useState<number>(152.4);
  const [backreamerDiameter, setBackreamerDiameter] = useState<number>(182.88);

  useEffect(() => {
    if (initialConfig) {
      setConduits(initialConfig.conduits || []);
      setEntryAngle(initialConfig.entryAngleDegrees || 15);
      setExitAngle(initialConfig.exitAngleDegrees || 15);
      setMinDepth(initialConfig.minDepthGuaranteedM || 2.44);
      setDrillDiameter(initialConfig.drillDiameterMm || 152.4);
      setBackreamerDiameter(initialConfig.backreamerDiameterMm || 182.88);
    } else {
      setConduits([{ sizeIn: "1", count: 1, material: "PVC" }]);
      setEntryAngle(15);
      setExitAngle(15);
      setMinDepth(2.44);
      setDrillDiameter(152.4);
      setBackreamerDiameter(182.88);
    }
  }, [initialConfig, isOpen]);

  const addConduit = () => {
    setConduits([...conduits, { sizeIn: "1", count: 1, material: "PVC" }]);
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
    const config: BoreShotConfig = {
      conduits,
      entryAngleDegrees: entryAngle,
      exitAngleDegrees: exitAngle,
      minDepthGuaranteedM: minDepth,
      drillDiameterMm: drillDiameter,
      backreamerDiameterMm: backreamerDiameter,
    };
    onConfirm(config);
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
            <DialogTitle className="text-sm">Perfuração Direcional</DialogTitle>
            <Button
              variant="outline"
              onClick={() => {
                setConduits([{ sizeIn: "1", count: 1, material: "PVC" }]);
                setEntryAngle(15);
                setExitAngle(15);
                setMinDepth(2.44);
                setDrillDiameter(152.4);
                setBackreamerDiameter(182.88);
              }}
              className="text-xs h-7 px-2"
            >
              Desfazer
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Traçado */}
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-600 leading-tight">
              <strong>Traçado (polilinha ou spline):</strong> Desenhe a
              trajetória no plano para definir o percurso da perfuração
              direcional.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Raio Mínimo de Curvatura */}
          <div className="space-y-1">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Raio mínimo de curvatura do tubo
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Fornecido pelo material/SDR. Configure abaixo nos condutos.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Ângulos */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Ângulo de entrada e saída
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <Label htmlFor="entry-angle" className="text-xs">
                  Ângulo de Entrada (°)
                </Label>
                <Input
                  id="entry-angle"
                  type="number"
                  step="0.1"
                  min="0"
                  max="90"
                  value={entryAngle}
                  onChange={(e) =>
                    setEntryAngle(parseFloat(e.target.value) || 0)
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="exit-angle" className="text-xs">
                  Ângulo de Saída (°)
                </Label>
                <Input
                  id="exit-angle"
                  type="number"
                  step="0.1"
                  min="0"
                  max="90"
                  value={exitAngle}
                  onChange={(e) =>
                    setExitAngle(parseFloat(e.target.value) || 0)
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Profundidade Mínima */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Profundidade mínima garantida
            </h3>
            <div>
              <Label htmlFor="min-depth" className="text-xs">
                Profundidade Mínima (m)
              </Label>
              <Input
                id="min-depth"
                type="number"
                step="0.01"
                value={minDepth}
                onChange={(e) => setMinDepth(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Diâmetros */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Diâmetros
            </h3>
            <div className="space-y-1">
              <div>
                <Label htmlFor="drill-diameter" className="text-xs">
                  Diâmetro de Perfuração (mm)
                </Label>
                <Input
                  id="drill-diameter"
                  type="number"
                  step="0.1"
                  value={drillDiameter}
                  onChange={(e) =>
                    setDrillDiameter(parseFloat(e.target.value) || 0)
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="backreamer-diameter" className="text-xs">
                  Diâmetro Backreamer (mm)
                </Label>
                <Input
                  id="backreamer-diameter"
                  type="number"
                  step="0.1"
                  value={backreamerDiameter}
                  onChange={(e) =>
                    setBackreamerDiameter(parseFloat(e.target.value) || 0)
                  }
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                  Normalmente 1,2–1,5× o diâmetro do tubo
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Condutos */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Condutos
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight mb-1.5">
              Configure os condutos para esta perfuração direcional
            </p>

            <div className="space-y-1">
              {conduits.map((conduit, index) => (
                <div key={index} className="border rounded-md p-1.5 bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium">
                      Conduto {index + 1}
                    </span>
                    {conduits.length > 1 && (
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
                      <Label htmlFor={`size-${index}`} className="text-xs">
                        Tamanho
                      </Label>
                      <Select
                        value={conduit.sizeIn}
                        onValueChange={(value) =>
                          updateConduit(index, "sizeIn", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
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
                      <Label htmlFor={`count-${index}`} className="text-xs">
                        Quantidade
                      </Label>
                      <Input
                        id={`count-${index}`}
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
                        className="h-8 text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`material-${index}`} className="text-xs">
                        Material
                      </Label>
                      <Select
                        value={conduit.material}
                        onValueChange={(value) =>
                          updateConduit(index, "material", value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
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
            </div>

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

          <Separator className="my-1.5" />

          {/* Comprimento Final */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Comprimento final perfurado
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Será calculado automaticamente com base no traçado desenhado no
              plano.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Validações Automáticas */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Validações automáticas obrigatórias
            </h3>
            <div className="space-y-0.5 text-[11px] text-gray-600 leading-tight">
              <p>
                •{" "}
                <strong>
                  Raio de curvatura real ≥ raio mínimo recomendado:
                </strong>{" "}
                O sistema validará que nenhum segmento viola o raio mínimo.
              </p>
              <p>
                • <strong>Trajetória não viola a profundidade mínima:</strong> O
                sistema validará que todos os pontos Z ≥ profundidade mínima.
              </p>
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Resultado Principal */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Resultado principal
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Comprimento perfurado + raio mínimo atendido + diâmetro do furo.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2 mt-2">
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

export default BoreShotConfigModal;
