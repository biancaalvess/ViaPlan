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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export interface AreaConfig {
  area?: number; // m² (calculado automaticamente)
  perimeter?: number; // m (calculado automaticamente)
  height?: number; // m (opcional, para volume)
}

interface AreaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: AreaConfig) => void;
  initialConfig?: AreaConfig | null;
}

const AreaConfigModal: React.FC<AreaConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialConfig,
}) => {
  const [config, setConfig] = useState<AreaConfig>({});

  const [includeHeight, setIncludeHeight] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setIncludeHeight(!!initialConfig.height);
    } else {
      setConfig({});
      setIncludeHeight(false);
    }
  }, [initialConfig, isOpen]);

  const handleConfirm = () => {
    const finalConfig: AreaConfig = {
      ...config,
      height: includeHeight ? config.height : undefined,
    };
    onConfirm(finalConfig);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm md:max-w-md w-full mx-2 sm:mx-4">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-sm">Área</DialogTitle>
            <Button
              variant="outline"
              onClick={() => {
                setConfig({});
                setIncludeHeight(false);
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
              Medição superficial.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Polígono */}
          <div className="space-y-0.5">
            <p className="text-[11px] text-gray-600 leading-tight">
              <strong>Polígono:</strong> Desenhe um polígono no plano para
              definir a área a ser medida.
            </p>
          </div>

          <Separator className="my-1.5" />

          {/* Área Total */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Área total
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Será calculada automaticamente com base no polígono desenhado.
            </p>
            {config.area !== undefined && (
              <div className="mt-1 p-1.5 bg-gray-50 rounded border">
                <p className="text-[11px] text-gray-700">
                  <strong>Área:</strong> {config.area.toFixed(2)} m²
                </p>
              </div>
            )}
          </div>

          <Separator className="my-1.5" />

          {/* Perímetro */}
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-gray-900">
              Perímetro
            </h3>
            <p className="text-[11px] text-gray-600 leading-tight">
              Será calculado automaticamente com base no polígono desenhado.
            </p>
            {config.perimeter !== undefined && (
              <div className="mt-1 p-1.5 bg-gray-50 rounded border">
                <p className="text-[11px] text-gray-700">
                  <strong>Perímetro:</strong> {config.perimeter.toFixed(2)} m
                </p>
              </div>
            )}
          </div>

          <Separator className="my-1.5" />

          {/* Altura/Profundidade Opcional */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-height"
                checked={includeHeight}
                onCheckedChange={(checked) => {
                  setIncludeHeight(checked as boolean);
                  if (checked && !config.height) {
                    setConfig((prev) => ({ ...prev, height: 0 }));
                  } else if (!checked) {
                    setConfig((prev) => ({ ...prev, height: undefined }));
                  }
                }}
                className="h-4 w-4"
              />
              <Label
                htmlFor="include-height"
                className="text-[11px] leading-tight"
              >
                Altura/Profundidade opcional (para extrair volume)
              </Label>
            </div>
            {includeHeight && (
              <div className="pl-5">
                <Label htmlFor="height" className="text-xs">
                  Altura/Profundidade (m)
                </Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={config.height || 0}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      height: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-7 text-xs"
                />
                {config.area !== undefined && config.height !== undefined && (
                  <div className="mt-1 p-1.5 bg-gray-50 rounded border">
                    <p className="text-[11px] text-gray-700">
                      <strong>Volume:</strong>{" "}
                      {(config.area * config.height).toFixed(2)} m³
                    </p>
                  </div>
                )}
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
              Área em m² e perímetro.
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

export default AreaConfigModal;

