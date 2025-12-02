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
import { Checkbox } from "@/components/ui/checkbox";

export interface ConduitConfig {
  conduits: Array<{
    material: string;
    classSdr?: string;
    nominalDiameter?: number; // mm
    thickness?: number; // mm
    length?: number; // m
    connections?: Array<{
      type: string;
      count: number;
    }>;
  }>;
}

interface ConduitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: ConduitConfig) => void;
  initialConfig?: ConduitConfig | null;
}

const ConduitConfigModal: React.FC<ConduitConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialConfig,
}) => {
  const [conduits, setConduits] = useState<
    Array<{
      material: string;
      classSdr?: string;
      nominalDiameter?: number;
      thickness?: number;
      length?: number;
      connections?: Array<{
        type: string;
        count: number;
      }>;
    }>
  >([]);

  const [includeConnections, setIncludeConnections] = useState<boolean[]>([]);

  useEffect(() => {
    if (initialConfig) {
      setConduits(initialConfig.conduits);
      setIncludeConnections(
        initialConfig.conduits.map(
          (c) => !!c.connections && c.connections.length > 0
        )
      );
    } else {
      setConduits([
        {
          material: "PVC",
          nominalDiameter: 50,
          thickness: 3.7,
        },
      ]);
      setIncludeConnections([false]);
    }
  }, [initialConfig, isOpen]);

  const addConduit = () => {
    setConduits([
      ...conduits,
      {
        material: "PVC",
        nominalDiameter: 50,
        thickness: 3.7,
      },
    ]);
    setIncludeConnections([...includeConnections, false]);
  };

  const removeConduit = (index: number) => {
    setConduits(conduits.filter((_, i) => i !== index));
    setIncludeConnections(includeConnections.filter((_, i) => i !== index));
  };

  const updateConduit = (
    index: number,
    field: string,
    value: string | number | undefined
  ) => {
    const updatedConduits = [...conduits];
    updatedConduits[index] = { ...updatedConduits[index], [field]: value };
    setConduits(updatedConduits);
  };

  const addConnection = (conduitIndex: number) => {
    const updatedConduits = [...conduits];
    if (!updatedConduits[conduitIndex].connections) {
      updatedConduits[conduitIndex].connections = [];
    }
    updatedConduits[conduitIndex].connections!.push({
      type: "Junta",
      count: 1,
    });
    setConduits(updatedConduits);
  };

  const removeConnection = (conduitIndex: number, connectionIndex: number) => {
    const updatedConduits = [...conduits];
    if (updatedConduits[conduitIndex].connections) {
      updatedConduits[conduitIndex].connections = updatedConduits[
        conduitIndex
      ].connections!.filter((_, i) => i !== connectionIndex);
    }
    setConduits(updatedConduits);
  };

  const updateConnection = (
    conduitIndex: number,
    connectionIndex: number,
    field: string,
    value: string | number
  ) => {
    const updatedConduits = [...conduits];
    if (updatedConduits[conduitIndex].connections) {
      updatedConduits[conduitIndex].connections![connectionIndex] = {
        ...updatedConduits[conduitIndex].connections![connectionIndex],
        [field]: value,
      };
    }
    setConduits(updatedConduits);
  };

  const handleConfirm = () => {
    onConfirm({ conduits });
  };

  const conduitMaterials = [
    "PVC",
    "PEAD",
    "Aço",
    "Alumínio",
    "Fibra Óptica",
    "Cobre",
    "Outro",
  ];

  const sdrClasses = [
    "SDR 7",
    "SDR 9",
    "SDR 11",
    "SDR 13.5",
    "SDR 17",
    "SDR 21",
    "SDR 26",
    "SDR 32.5",
    "SDR 41",
  ];

  const connectionTypes = [
    "Junta",
    "Válvula",
    "Peça de Transição",
    "Tê",
    "Curva",
    "Redução",
    "Outro",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm md:max-w-md w-full mx-2 sm:mx-4">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-sm">Conduto</DialogTitle>
            <Button
              variant="outline"
              onClick={() => {
                setConduits([
                  {
                    material: "PVC",
                    nominalDiameter: 50,
                    thickness: 3.7,
                  },
                ]);
                setIncludeConnections([false]);
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
              Medição sobre o conduto instalado no subsolo.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Trajeto */}
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-600 leading-tight">
              <strong>Trajeto (polilinha):</strong> Desenhe a trajetória no
              plano para definir o percurso do conduto.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Condutos */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Condutos
            </h3>
            <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
                    {/* Material */}
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

                    {/* Classe/SDR */}
                    <div>
                      <Label className="text-xs">Classe/SDR</Label>
                      <Select
                        value={conduit.classSdr || ""}
                        onValueChange={(value) =>
                          updateConduit(index, "classSdr", value || undefined)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">N/A</SelectItem>
                          {sdrClasses.map((sdr) => (
                            <SelectItem key={sdr} value={sdr}>
                              {sdr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Diâmetro Nominal */}
                    <div>
                      <Label className="text-xs">Diâmetro Nominal (mm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={conduit.nominalDiameter || ""}
                        onChange={(e) =>
                          updateConduit(
                            index,
                            "nominalDiameter",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className="h-7 text-xs"
                        placeholder="Ex: 50"
                      />
                    </div>

                    {/* Espessura */}
                    <div>
                      <Label className="text-xs">Espessura (mm)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={conduit.thickness || ""}
                        onChange={(e) =>
                          updateConduit(
                            index,
                            "thickness",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className="h-7 text-xs"
                        placeholder="Ex: 3.7"
                      />
                    </div>

                    {/* Comprimento Total */}
                    <div>
                      <Label className="text-xs">Comprimento Total (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={conduit.length || ""}
                        onChange={(e) =>
                          updateConduit(
                            index,
                            "length",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        className="h-7 text-xs"
                        placeholder="Será calculado automaticamente"
                      />
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        Será calculado automaticamente com base no trajeto
                      </p>
                    </div>

                    {/* Conexões */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`connections-${index}`}
                          checked={includeConnections[index] || false}
                          onCheckedChange={(checked) => {
                            const newInclude = [...includeConnections];
                            newInclude[index] = checked as boolean;
                            setIncludeConnections(newInclude);
                            if (checked && !conduit.connections) {
                              updateConduit(index, "connections", []);
                            } else if (!checked) {
                              updateConduit(index, "connections", undefined);
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`connections-${index}`}
                          className="text-[11px] leading-tight"
                        >
                          Conexões (opcional: peças de transição, válvulas,
                          juntas)
                        </Label>
                      </div>
                      {includeConnections[index] && conduit.connections && (
                        <div className="pl-5 space-y-1">
                          {conduit.connections.map((conn, connIndex) => (
                            <div
                              key={connIndex}
                              className="flex items-center gap-1 border rounded p-1 bg-white"
                            >
                              <Select
                                value={conn.type}
                                onValueChange={(value) =>
                                  updateConnection(
                                    index,
                                    connIndex,
                                    "type",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="h-6 text-[10px] flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {connectionTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                min="1"
                                value={conn.count}
                                onChange={(e) =>
                                  updateConnection(
                                    index,
                                    connIndex,
                                    "count",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="h-6 w-16 text-[10px]"
                                placeholder="Qtd"
                              />
                              {conduit.connections.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeConnection(index, connIndex)
                                  }
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addConnection(index)}
                            className="w-full h-6 text-[10px] mt-1"
                          >
                            <Plus className="h-2.5 w-2.5 mr-1" />
                            Adicionar Conexão
                          </Button>
                        </div>
                      )}
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

          {/* Extras Úteis */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Extras úteis
            </h3>
            <div className="space-y-0.5 text-[11px] text-gray-600 leading-tight">
              <p>
                • <strong>Cálculo de volume interno:</strong> Será calculado
                automaticamente
              </p>
              <p>
                • <strong>Peso estimado por metro:</strong> Será calculado
                automaticamente
              </p>
              <p>
                • <strong>Verificação de compatibilidade:</strong> Será validado
                com método de instalação (valas, HDD)
              </p>
            </div>
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

export default ConduitConfigModal;
