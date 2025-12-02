import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  MousePointer2,
  Square,
  Drill,
  Droplet,
  Gauge,
  CheckSquare,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { usePlants } from "@/hooks/usePlants";
import { useMeasurements } from "@/hooks/useMeasurements";
import { useActionHistory } from "@/hooks/useActionHistory";
import { useTools } from "@/hooks/useTools";
import { useExport } from "@/hooks/useExport";
import { ConfigurationModals } from "@/components/QuickTakeoff/ConfigurationModals";
import PDFUpload from "@/components/PDFUpload";
import QuickTakeoffViewer from "@/components/QuickTakeoffViewer";

const QuickTakeoffPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // State management
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState("1\" = 100'");
  const [zoom, setZoom] = useState(1);

  // Custom hooks
  const { loadPlantFromId } = usePlants();
  const { measurements, addMeasurement, deleteMeasurement } = useMeasurements();
  const { canUndo, undoLastAction, saveAction } = useActionHistory();
  const {
    activeTool,
    trenchConfig,
    boreShotConfig,
    conduitConfig,
    hydroExcavationConfig,
    vaultConfig,
    areaConfig,
    handleToolSelect,
    setTrenchConfiguration,
    setBoreShotConfiguration,
    setConduitConfiguration,
    setHydroExcavationConfiguration,
    setVaultConfiguration,
    setAreaConfiguration,
    clearTrenchConfig,
    clearBoreShotConfig,
    clearConduitConfig,
    clearHydroExcavationConfig,
    clearVaultConfig,
    clearAreaConfig,
  } = useTools();
  const { exportToCSV, exportToJSON } = useExport();

  // Modal states
  const [showTrenchConfig, setShowTrenchConfig] = useState(false);
  const [showBoreShotConfig, setShowBoreShotConfig] = useState(false);
  const [showConduitConfig, setShowConduitConfig] = useState(false);
  const [showHydroExcavationConfig, setShowHydroExcavationConfig] =
    useState(false);
  const [showVaultConfig, setShowVaultConfig] = useState(false);
  const [showAreaConfig, setShowAreaConfig] = useState(false);

  useEffect(() => {
    const plantId = searchParams.get("plant");
    if (plantId) {
      loadPlantFromId(plantId);
    }
  }, [searchParams, loadPlantFromId]);

  const handleFileSelect = (fileUrl: string) => {
    setPdfUrl(fileUrl);
    toast({
      title: "PDF Carregado",
      description: "Arquivo PDF carregado com sucesso!",
    });
  };

  const handleToolSelectWithConfig = (tool: string) => {
    if (tool === "trench" && !trenchConfig) {
      setShowTrenchConfig(true);
      return;
    }
    if (tool === "bore-shot" && !boreShotConfig) {
      setShowBoreShotConfig(true);
      return;
    }
    if (tool === "conduit" && !conduitConfig) {
      setShowConduitConfig(true);
      return;
    }
    if (tool === "hydro-excavation" && !hydroExcavationConfig) {
      setShowHydroExcavationConfig(true);
      return;
    }
    if (tool === "vault" && !vaultConfig) {
      setShowVaultConfig(true);
      return;
    }
    if (tool === "area" && !areaConfig) {
      setShowAreaConfig(true);
      return;
    }
    handleToolSelect(tool);
  };

  const handleTrenchConfigConfirm = (config: any) => {
    setTrenchConfiguration(config);
    setShowTrenchConfig(false);
  };

  const handleBoreShotConfigConfirm = (config: any) => {
    setBoreShotConfiguration(config);
    setShowBoreShotConfig(false);
  };

  const handleConduitConfigConfirm = (config: any) => {
    setConduitConfiguration(config);
    setShowConduitConfig(false);
  };

  const handleHydroExcavationConfigConfirm = (config: any) => {
    setHydroExcavationConfiguration(config);
    setShowHydroExcavationConfig(false);
  };

  const handleVaultConfigConfirm = (config: any) => {
    setVaultConfiguration(config);
    setShowVaultConfig(false);
  };

  const handleAreaConfigConfirm = (config: any) => {
    setAreaConfiguration(config);
    setShowAreaConfig(false);
  };

  const handleAddMeasurement = (measurement: any) => {
    saveAction("measurement", { action: "add", measurement });
    addMeasurement(measurement);
  };

  const handleDeleteMeasurement = (id: string) => {
    deleteMeasurement(id);
  };

  const handleUndo = () => {
    undoLastAction();
  };

  const handleExportCSV = () => {
    exportToCSV(measurements, currentPage);
  };

  const handleExportJSON = () => {
    exportToJSON(measurements, scale);
  };

  const tools = [
    {
      id: "select",
      name: "Selecionar",
      description:
        "Mover, redimensionar, apagar, agrupar e filtrar medições. Não mede, apenas edita.",
      icon: MousePointer2,
      needsConfig: false,
    },
    {
      id: "trench",
      name: "Trincheira Aberta",
      description:
        "Traçado (polilinha), largura e profundidade média ou variável, tipo de solo, cálculo de volume. Resultado: comprimento total + volume de escavação.",
      icon: Square,
      needsConfig: true,
      config: trenchConfig,
    },
    {
      id: "bore-shot",
      name: "Perfuração Direcional",
      description:
        "Traçado (polilinha ou spline), raio mínimo de curvatura, ângulos de entrada/saída, profundidade mínima, diâmetros. Validações automáticas. Resultado: comprimento perfurado + raio mínimo atendido.",
      icon: Drill,
      needsConfig: true,
      config: boreShotConfig,
    },
    {
      id: "hydro-excavation",
      name: "Hidroescavação",
      description:
        "Traçado (reta ou polilinha), seção nominal (circular), profundidade, volume removido. Resultado: comprimento + volume de remoção.",
      icon: Droplet,
      needsConfig: true,
      config: hydroExcavationConfig,
    },
    {
      id: "conduit",
      name: "Conduto",
      description:
        "Trajeto (polilinha), material (PVC, PEAD, aço), classe/SDR, diâmetro nominal, espessura, comprimento total. Extras: volume interno, peso estimado.",
      icon: Gauge,
      needsConfig: true,
      config: conduitConfig,
    },
    {
      id: "vault",
      name: "Câmara/Buraco de Mão",
      description:
        "Tipo (poço de visita, caixa de passagem), dimensões (retangular/circular), profundidade, material/classe, quantidade. Resultado: contagem + volume.",
      icon: CheckSquare,
      needsConfig: true,
      config: vaultConfig,
    },
    {
      id: "area",
      name: "Área",
      description:
        "Polígono, área total, perímetro e profundidade opcional para volume. Resultado: área em m² e perímetro.",
      icon: Layers,
      needsConfig: true,
      config: areaConfig,
    },
    {
      id: "note",
      name: "Nota",
      description:
        "Texto livre, nome/autor, data, localização (x,y) e vinculação a objeto. Metadado para documentação.",
      icon: FileText,
      needsConfig: false,
    },
  ];

  const activeConfigs: Array<{ name: string; onClear: () => void }> = [
    trenchConfig && { name: "Trincheira Aberta", onClear: clearTrenchConfig },
    boreShotConfig && {
      name: "Perfuração Direcional",
      onClear: clearBoreShotConfig,
    },
    conduitConfig && { name: "Conduto", onClear: clearConduitConfig },
    hydroExcavationConfig && {
      name: "Hidroescavação",
      onClear: clearHydroExcavationConfig,
    },
    vaultConfig && { name: "Câmara/Buraco de Mão", onClear: clearVaultConfig },
    areaConfig && { name: "Área", onClear: clearAreaConfig },
  ].filter((config): config is { name: string; onClear: () => void } =>
    Boolean(config)
  );

  return (
    <div className="h-screen flex flex-col bg-[#223148] text-[#f3eae0] overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#223148] border-b border-[#2f486d] px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6">
          <h1 className="text-lg sm:text-xl font-semibold text-[#f3eae0]">
            VIAPLAN
          </h1>

          <div className="[&_button]:bg-[#2f486d] [&_button]:border-[#3d5a7d] [&_button]:text-[#f3eae0] [&_button]:hover:bg-[#3d5a7d]">
            <PDFUpload onFileSelect={handleFileSelect} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-[#f3eae0]/80">
              Escala:
            </span>
            <Select value={scale} onValueChange={setScale}>
              <SelectTrigger className="w-28 sm:w-36 md:w-40 bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0] text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2f486d] border-[#3d5a7d]">
                <SelectItem value="1&quot; = 100'">1&quot; = 100'</SelectItem>
                <SelectItem value="1&quot; = 50'">1&quot; = 50'</SelectItem>
                <SelectItem value="1&quot; = 20'">1&quot; = 20'</SelectItem>
                <SelectItem value="1&quot; = 10'">1&quot; = 10'</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(zoom - 0.1)}
              className="bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0] hover:bg-[#3d5a7d]"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-[#f3eae0] px-2 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(zoom + 0.1)}
              className="bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0] hover:bg-[#3d5a7d]"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="bg-[#1a4a25] border-[#2a5a35] text-[#DAE2CB] hover:bg-[#2a5a35] disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="bg-[#1a4a25] border-[#2a5a35] text-[#DAE2CB] hover:bg-[#2a5a35] text-xs sm:text-sm"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0] hover:bg-[#3d5a7d] text-xs sm:text-sm"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar JSON</span>
            <span className="sm:hidden">JSON</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Central Content Area */}
        <div className="flex-1 bg-[#223148] flex items-center justify-center min-w-0">
          {pdfUrl ? (
            <QuickTakeoffViewer
              pdfUrl={pdfUrl}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              setTotalPages={setTotalPages}
              activeTool={activeTool}
              measurements={measurements}
              onAddMeasurement={handleAddMeasurement}
              scale={scale}
              zoom={zoom}
              trenchConfig={trenchConfig}
              boreShotConfig={boreShotConfig}
              conduitConfig={conduitConfig}
              hydroExcavationConfig={hydroExcavationConfig}
              vaultConfig={vaultConfig}
            />
          ) : (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-[#2f486d] rounded-lg flex items-center justify-center">
                  <FileText className="h-8 w-8 text-[#f3eae0]/60" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-[#f3eae0] mb-2">
                Nenhum PDF carregado
              </h3>
              <p className="text-sm text-[#f3eae0]/60">
                Faça upload de um PDF para começar
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 bg-[#223148] border-t lg:border-t-0 lg:border-l border-[#2f486d] flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-none">
          {/* Measurement Tools */}
          <div className="p-2 sm:p-3 border-b border-[#2f486d]">
            <h2 className="text-xs font-semibold text-[#f3eae0] mb-1.5 sm:mb-2">
              Ferramentas de Medição
            </h2>
            <p className="text-[10px] sm:text-xs text-[#f3eae0]/60 mb-2 sm:mb-3">
              Selecione uma ferramenta para começar a medir
            </p>
            <div className="space-y-1.5">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                const isConfigured = !tool.needsConfig || tool.config;

                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelectWithConfig(tool.id)}
                    className={`w-full text-left p-2 rounded-md border transition-colors ${
                      isActive
                        ? "bg-[#2f486d] border-[#3d5a7d]"
                        : "bg-[#1a2538] border-[#2f486d] hover:bg-[#2f486d]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#f3eae0] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 gap-1.5">
                          <span className="text-[11px] sm:text-xs font-medium text-[#f3eae0] truncate">
                            {tool.name}
                          </span>
                          {tool.needsConfig && !isConfigured && (
                            <Badge className="bg-[#d2c7b8]/30 text-[#d2c7b8] border-[#d2c7b8]/50 text-[9px] px-1 py-0 flex-shrink-0">
                              Não configurado
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-[#f3eae0]/60 line-clamp-2 leading-tight">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Configurations */}
          <div className="p-2 sm:p-3 border-b border-[#2f486d]">
            <h2 className="text-xs font-semibold text-[#f3eae0] mb-1.5 sm:mb-2">
              Configurações Ativas
            </h2>
            {activeConfigs.length === 0 ? (
              <p className="text-[10px] sm:text-xs text-[#d2c7b8]/60 italic">
                Nenhuma configuração ativa
              </p>
            ) : (
              <div className="space-y-1.5">
                {activeConfigs.map((config, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 bg-[#2f486d] rounded text-[11px] sm:text-xs text-[#f3eae0]"
                  >
                    <span>{config.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={config.onClear}
                      className="h-5 w-5 p-0 text-[#d2c7b8] hover:text-[#f3eae0] text-sm"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="p-2 sm:p-3">
            <h2 className="text-xs font-semibold text-[#f3eae0] mb-1.5 sm:mb-2">
              Medições
            </h2>
            {measurements.length === 0 ? (
              <p className="text-[10px] sm:text-xs text-[#d2c7b8]/60 italic">
                Ainda não há medições. Selecione uma ferramenta e comece a medir
                no plano.
              </p>
            ) : (
              <div className="space-y-1.5">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="p-1.5 sm:p-2 bg-[#2f486d] rounded-md border border-[#3d5a7d]"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] sm:text-xs font-medium text-[#f3eae0] truncate">
                          {measurement.label}
                        </p>
                        <p className="text-[10px] text-[#d2c7b8]">
                          {measurement.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                        className="h-5 w-5 p-0 text-[#d2c7b8] hover:text-[#f3eae0] text-sm"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Modals */}
      <ConfigurationModals
        showTrenchConfig={showTrenchConfig}
        showBoreShotConfig={showBoreShotConfig}
        showConduitConfig={showConduitConfig}
        showHydroExcavationConfig={showHydroExcavationConfig}
        showVaultConfig={showVaultConfig}
        showAreaConfig={showAreaConfig}
        trenchConfig={trenchConfig}
        boreShotConfig={boreShotConfig}
        conduitConfig={conduitConfig}
        hydroExcavationConfig={hydroExcavationConfig}
        vaultConfig={vaultConfig}
        areaConfig={areaConfig}
        onTrenchConfigClose={() => setShowTrenchConfig(false)}
        onBoreShotConfigClose={() => setShowBoreShotConfig(false)}
        onConduitConfigClose={() => setShowConduitConfig(false)}
        onHydroExcavationConfigClose={() => setShowHydroExcavationConfig(false)}
        onVaultConfigClose={() => setShowVaultConfig(false)}
        onAreaConfigClose={() => setShowAreaConfig(false)}
        onTrenchConfigConfirm={handleTrenchConfigConfirm}
        onBoreShotConfigConfirm={handleBoreShotConfigConfirm}
        onConduitConfigConfirm={handleConduitConfigConfirm}
        onHydroExcavationConfigConfirm={handleHydroExcavationConfigConfirm}
        onVaultConfigConfirm={handleVaultConfigConfirm}
        onAreaConfigConfirm={handleAreaConfigConfirm}
      />
    </div>
  );
};

export default QuickTakeoffPage;
