import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  MousePointer2,
  Square,
  Layers,
  FileText,
  X,
  Trash2,
  ArrowLeft,
  Minimize2,
  Ruler,
  Wall,
  DoorOpen,
  Home,
  Building2,
  Hammer,
  Triangle,
  Paintbrush,
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
import { ScaleCalibration } from "@/components/ScaleCalibration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const QuickTakeoffPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State management
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [fileType, setFileType] = useState<"pdf" | "image" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState("1:1000");
  const [zoom, setZoom] = useState(1);
  const [showManualScale, setShowManualScale] = useState(false);
  const [isManualScaleMinimized, setIsManualScaleMinimized] = useState(false);
  const [manualScaleValue, setManualScaleValue] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#ef4444");

  // Custom hooks
  const { loadPlantFromId } = usePlants();
  const { 
    measurements, 
    addMeasurement, 
    deleteMeasurement, 
    clearMeasurements,
    updateMeasurement,
    moveMeasurement,
    moveMeasurements,
    resizeMeasurement,
    groupMeasurements,
    ungroupMeasurements,
    filterMeasurements,
  } = useMeasurements();
  const { canUndo, undoLastAction, saveAction } = useActionHistory();
  const measurementsRef = useRef(measurements);
  
  // Atualizar ref quando measurements mudar
  useEffect(() => {
    measurementsRef.current = measurements;
  }, [measurements]);
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

  // Atualizar cor padrão quando a ferramenta mudar
  useEffect(() => {
    const defaultColors: Record<string, string> = {
      select: "#6366f1",
      layout: "#3b82f6",
      walls: "#ef4444",
      area: "#10b981",
      openings: "#f59e0b",
      slabs: "#8b5cf6",
      foundation: "#92400e",
      structure: "#1e40af",
      finishes: "#ec4899",
      roofing: "#059669",
      note: "#6b7280",
    };
    if (activeTool && defaultColors[activeTool]) {
      setSelectedColor(defaultColors[activeTool]);
    }
  }, [activeTool]);

  const handleFileSelect = (fileUrl: string, fileType?: "pdf" | "image") => {
    setPdfUrl(fileUrl);
    // Usar o tipo detectado ou tentar detectar pela URL
    if (fileType) {
      setFileType(fileType);
    } else {
      const isImage = fileUrl.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i);
      setFileType(isImage ? "image" : "pdf");
    }
    toast({
      title: fileType === "image" ? "Imagem Carregada" : "PDF Carregado",
      description: `Arquivo ${fileType === "image" ? "imagem" : "PDF"} carregado com sucesso!`,
    });
  };

  const handleRemovePDF = () => {
    // Limpar URL do arquivo
    if (pdfUrl && pdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl("");
    setFileType(null);
    setCurrentPage(1);
    setTotalPages(0);
    // Limpar todas as medições quando a planta for removida
    clearMeasurements();
    toast({
      title: "Arquivo Removido",
      description: "Planta removida. Você pode carregar uma nova.",
    });
  };

  const handleToolSelectWithConfig = (tool: string) => {
    if (tool === "walls" && !trenchConfig) {
      setShowTrenchConfig(true);
      return;
    }
    if (tool === "openings" && !conduitConfig) {
      setShowConduitConfig(true);
      return;
    }
    if (tool === "slabs" && !vaultConfig) {
      setShowVaultConfig(true);
      return;
    }
    if (tool === "foundation" && !boreShotConfig) {
      setShowBoreShotConfig(true);
      return;
    }
    if (tool === "structure" && !hydroExcavationConfig) {
      setShowHydroExcavationConfig(true);
      return;
    }
    if (tool === "area" && !areaConfig) {
      setShowAreaConfig(true);
      return;
    }
    if (tool === "finishes" && !areaConfig) {
      setShowAreaConfig(true);
      return;
    }
    if (tool === "roofing" && !areaConfig) {
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
    // Salvar o comprimento atual antes de adicionar
    const prevLength = measurementsRef.current.length;
    // Adicionar a medição
    addMeasurement(measurement);
    // Salvar a ação com o comprimento anterior para referência
    saveAction("measurement", { action: "add", prevLength });
  };

  const handleDeleteMeasurement = (id: string) => {
    const measurementToDelete = measurementsRef.current.find(m => m.id === id);
    if (measurementToDelete) {
      saveAction("measurement", { action: "delete", measurement: measurementToDelete });
      deleteMeasurement(id);
    }
  };

  const handleUndo = () => {
    const lastAction = undoLastAction();
    if (!lastAction) return;

    if (lastAction.type === "measurement") {
      const { action, measurement, prevLength } = lastAction.data;
      if (action === "add") {
        // Desfazer adição: remover a última medição adicionada
        const currentMeasurements = measurementsRef.current;
        // Se temos prevLength, remover a medição que está na posição prevLength
        // Caso contrário, remover a última
        if (currentMeasurements.length > (prevLength || 0)) {
          const measurementToRemove = currentMeasurements[currentMeasurements.length - 1];
          deleteMeasurement(measurementToRemove.id);
        }
      } else if (action === "delete" && measurement) {
        // Desfazer remoção: restaurar a medição (sem o ID para que seja gerado novo)
        const { id, ...measurementWithoutId } = measurement;
        addMeasurement(measurementWithoutId);
      }
    }
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
      id: "layout",
      name: "Planta / Layout",
      description: "Medições de paredes, eixos, espessuras, alinhamentos e perímetros internos.",
      icon: Ruler,
      needsConfig: false,
    },
    {
      id: "walls",
      name: "Paredes",
      description: "Traçado, altura, espessura, área de alvenaria e estimativa de blocos/argamassa (parâmetros configuráveis).",
      icon: Wall,
      needsConfig: true,
      config: trenchConfig, // Reutilizar config temporariamente
    },
    {
      id: "area",
      name: "Área",
      description: "Polígonos, área útil/bruta, lajes e ambientes. Exportação em tabela.",
      icon: Layers,
      needsConfig: true,
      config: areaConfig,
    },
    {
      id: "openings",
      name: "Vãos e Aberturas",
      description: "Portas, janelas e vãos. Dimensões, material e quantidade.",
      icon: DoorOpen,
      needsConfig: true,
      config: conduitConfig, // Reutilizar config temporariamente
    },
    {
      id: "slabs",
      name: "Lajes / Pisos",
      description: "Medições de superfícies com espessura. Volume de concreto ou área de revestimento.",
      icon: Square,
      needsConfig: true,
      config: vaultConfig, // Reutilizar config temporariamente
    },
    {
      id: "foundation",
      name: "Fundação",
      description: "Sapatas, blocos e vigas baldrame. Dimensões, volume e parâmetros estruturais mínimos.",
      icon: Building2,
      needsConfig: true,
      config: boreShotConfig, // Reutilizar config temporariamente
    },
    {
      id: "structure",
      name: "Estrutura (Concreto)",
      description: "Vigas, pilares e lajes. Cálculo por seção e volume.",
      icon: Hammer,
      needsConfig: true,
      config: hydroExcavationConfig, // Reutilizar config temporariamente
    },
    {
      id: "finishes",
      name: "Acabamentos",
      description: "Pisos, revestimentos e pintura. Área, perdas configuráveis e tipo de material.",
      icon: Paintbrush,
      needsConfig: true,
      config: areaConfig, // Reutilizar config temporariamente
    },
    {
      id: "roofing",
      name: "Cobertura",
      description: "Áreas inclinadas, telhados e platibandas. Inclinação, área real e área projetada.",
      icon: Triangle,
      needsConfig: true,
      config: areaConfig, // Reutilizar config temporariamente
    },
    {
      id: "note",
      name: "Nota",
      description: "Texto livre, metadados e localização.",
      icon: FileText,
      needsConfig: false,
    },
  ];

  const activeConfigs: Array<{ name: string; onClear: () => void }> = [
    trenchConfig && { name: "Paredes", onClear: clearTrenchConfig },
    conduitConfig && { name: "Vãos e Aberturas", onClear: clearConduitConfig },
    vaultConfig && { name: "Lajes / Pisos", onClear: clearVaultConfig },
    boreShotConfig && {
      name: "Fundação",
      onClear: clearBoreShotConfig,
    },
    hydroExcavationConfig && {
      name: "Estrutura (Concreto)",
      onClear: clearHydroExcavationConfig,
    },
    areaConfig && { name: "Área", onClear: clearAreaConfig },
  ].filter((config): config is { name: string; onClear: () => void } =>
    Boolean(config)
  );

  return (
    <div className="h-screen flex flex-col bg-[#223148] text-[#f3eae0] overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#223148] border-b border-[#2f486d] px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6">
          <button
            onClick={() => navigate("/")}
            className="text-[#f3eae0]/60 hover:text-[#f3eae0] transition-colors p-1 rounded-md hover:bg-[#2f486d]/50"
            title="Voltar à página inicial"
            aria-label="Voltar à página inicial"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
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
            <Select
              value={scale}
              onValueChange={(value) => {
                if (value === "manual") {
                  setShowManualScale(true);
                } else {
                  setScale(value);
                }
              }}
            >
              <SelectTrigger className="w-28 sm:w-36 md:w-40 bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0] text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2f486d] border-[#3d5a7d]">
                <SelectItem value="1:1000">1:1000</SelectItem>
                <SelectItem value="1:500">1:500</SelectItem>
                <SelectItem value="1:200">1:200</SelectItem>
                <SelectItem value="1:100">1:100</SelectItem>
                <SelectItem
                  value="manual"
                  className="border-t border-[#3d5a7d] mt-1 pt-1"
                >
                  Escala Manual
                </SelectItem>
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
            {pdfUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemovePDF}
                className="bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 hover:text-red-300"
                title="Remover PDF atual"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Escala Fixa */}
          <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 bg-[#2f486d] border border-[#3d5a7d] rounded-md">
            <span className="text-xs sm:text-sm text-[#f3eae0]/80 font-medium">
              Escala:
            </span>
            <span className="text-xs sm:text-sm text-[#f3eae0] font-semibold">
              {scale}
            </span>
          </div>

          {/* Seletor de Cor */}
          {activeTool && (
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[#f3eae0]/80 font-medium">
                Cor:
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-8 h-8 rounded border border-[#3d5a7d] cursor-pointer bg-[#2f486d]"
                  title="Escolher cor da ferramenta"
                />
                <div
                  className="w-6 h-6 rounded border border-[#3d5a7d]"
                  style={{ backgroundColor: selectedColor }}
                  title={`Cor atual: ${selectedColor}`}
                />
              </div>
            </div>
          )}
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
        <div className="flex-1 bg-[#223148] flex items-center justify-center min-w-0 w-full overflow-hidden">
          {pdfUrl ? (
            <QuickTakeoffViewer
              pdfUrl={pdfUrl}
              fileType={fileType || "pdf"}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              setTotalPages={setTotalPages}
              activeTool={activeTool}
              measurements={measurements}
              onAddMeasurement={handleAddMeasurement}
              onUpdateMeasurement={updateMeasurement}
              scale={scale}
              zoom={zoom}
              selectedColor={selectedColor}
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
        <div className="w-full lg:w-64 xl:w-80 2xl:w-96 bg-[#223148] border-t lg:border-t-0 lg:border-l border-[#2f486d] flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-none">
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

          {/* Ferramentas de Seleção - quando select está ativo */}
          {activeTool === 'select' && (
            <div className="p-2 sm:p-3 border-b border-[#2f486d]">
              <h2 className="text-xs font-semibold text-[#f3eae0] mb-1.5 sm:mb-2">
                Ferramentas de Edição
              </h2>
              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Agrupar medições selecionadas
                    // Nota: A seleção será gerenciada no QuickTakeoffViewer
                    toast({
                      title: "Agrupar",
                      description: "Selecione múltiplas medições (Shift+Click) e clique em Agrupar",
                    });
                  }}
                  className="w-full bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0] hover:bg-[#3d5a7d] text-xs"
                >
                  Agrupar Selecionadas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Filtrar medições
                    const filtered = filterMeasurements({});
                    toast({
                      title: "Filtrar",
                      description: `${filtered.length} medições encontradas`,
                    });
                  }}
                  className="w-full bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0] hover:bg-[#3d5a7d] text-xs"
                >
                  Filtrar Medições
                </Button>
                <p className="text-[10px] text-[#d2c7b8]/60 mt-2">
                  Dica: Use Shift+Click para selecionar múltiplas medições. Arraste para mover, clique nos cantos para redimensionar.
                </p>
              </div>
            </div>
          )}

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
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {measurements.map((measurement) => {
                  // Função auxiliar para garantir que valores sejam strings
                  const safeString = (value: any, fallback: string = ''): string => {
                    if (value === null || value === undefined) return fallback;
                    if (typeof value === 'string') return value;
                    if (typeof value === 'number') return String(value);
                    if (typeof value === 'object') {
                      // Se for um objeto, tentar extrair uma propriedade útil ou converter para string
                      if ('value' in value) return String(value.value);
                      if ('type' in value) return String(value.type);
                      return JSON.stringify(value);
                    }
                    return String(value);
                  };
                  
                  const safeUnit = (): string => {
                    if (!measurement.unit) return 'm';
                    if (typeof measurement.unit === 'string') {
                      // Converter unidades antigas para novas
                      if (measurement.unit === 'ft') return 'm';
                      if (measurement.unit === 'ft²' || measurement.unit === 'sq ft') return 'm²';
                      if (measurement.unit === 'CY' || measurement.unit === 'cy') return 'm³';
                      return measurement.unit;
                    }
                    if (typeof measurement.unit === 'object' && measurement.unit !== null) {
                      // Se unit for um objeto, tentar extrair o valor
                      if ('value' in measurement.unit) return String(measurement.unit.value);
                      if ('type' in measurement.unit) return String(measurement.unit.type);
                    }
                    return String(measurement.unit);
                  };
                  
                  const getAreaUnit = (): string => {
                    const unit = safeUnit();
                    if (unit === 'm' || unit === 'ft') return 'm²';
                    return unit;
                  };
                  
                  const getVolumeUnit = (): string => {
                    return 'm³';
                  };
                  
                  return (
                  <div
                    key={measurement.id}
                    className="p-1.5 sm:p-2 bg-[#2f486d] rounded-md border border-[#3d5a7d] hover:border-[#4a6a8d] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: typeof measurement.color === 'string' ? measurement.color : (measurement.color ? String(measurement.color) : '#6b7280') }}
                          />
                          <p className="text-[11px] sm:text-xs font-medium text-[#f3eae0] truncate">
                            {typeof measurement.label === 'string' ? measurement.label : (measurement.label ? String(measurement.label) : 'Medição')}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-[#d2c7b8] capitalize">
                            {typeof measurement.type === 'string' ? measurement.type.replace(/-/g, ' ') : String(measurement.type || '')}
                          </p>
                          {measurement.length !== undefined && measurement.length !== null && (
                            <p className="text-[10px] text-[#f3eae0] font-semibold">
                              {typeof measurement.length === 'number' ? measurement.length.toFixed(2) : safeString(measurement.length)} {safeUnit()}
                            </p>
                          )}
                          {measurement.area !== undefined && measurement.area !== null && (
                            <p className="text-[10px] text-[#f3eae0] font-semibold">
                              Área: {typeof measurement.area === 'number' ? measurement.area.toFixed(2) : safeString(measurement.area)} m²
                            </p>
                          )}
                          {measurement.trenchWidth && measurement.trenchDepth && (
                            <p className="text-[9px] text-[#d2c7b8]">
                              {typeof measurement.trenchWidth === 'number' ? measurement.trenchWidth : String(measurement.trenchWidth)} m × {typeof measurement.trenchDepth === 'number' ? measurement.trenchDepth : String(measurement.trenchDepth)} m
                            </p>
                          )}
                          {measurement.spoilVolumeCY !== undefined && measurement.spoilVolumeCY !== null && (
                            <p className="text-[9px] text-[#d2c7b8]">
                              Volume: {typeof measurement.spoilVolumeCY === 'number' ? measurement.spoilVolumeCY.toFixed(2) : String(measurement.spoilVolumeCY)} m³
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                        className="h-5 w-5 p-0 text-[#d2c7b8] hover:text-[#f3eae0] hover:bg-[#3d5a7d] text-sm flex-shrink-0"
                        title="Deletar medição"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                  );
                })}
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

      {/* Manual Scale Calibration Dialog */}
      <Dialog open={showManualScale} onOpenChange={setShowManualScale}>
        <DialogContent className="bg-[#223148] border-[#3d5a7d] text-[#f3eae0] max-w-2xl relative">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[#f3eae0]">
                Calibração de Escala Manual
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsManualScaleMinimized(!isManualScaleMinimized);
                  }}
                  className="h-8 w-8 p-0 text-[#f3eae0] hover:text-[#f3eae0] hover:bg-[#3d5a7d] rounded-sm"
                  title={isManualScaleMinimized ? "Expandir" : "Minimizar"}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualScale(false)}
                  className="h-8 w-8 p-0 text-[#f3eae0] hover:text-[#f3eae0] hover:bg-red-600/30 hover:text-red-400 rounded-sm"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          {!isManualScaleMinimized && (
            <ScaleCalibration
              onCalibrate={(scaleValue, unit) => {
                // scaleValue é unidades reais por pixel (ex: 0.01 m/pixel)
                // Armazenamos o valor para uso nos cálculos
                setManualScaleValue(scaleValue);

                // Para exibir, calculamos a escala 1:x aproximada
                // Assumindo que 1 pixel no PDF representa scaleValue unidades reais
                // Para uma escala 1:1000, 1mm no papel = 1000mm reais = 1m real
                // Precisamos converter baseado em um tamanho de referência padrão
                // Por simplicidade, vamos usar um formato descritivo
                const displayScale = `1:manual (${scaleValue.toFixed(4)} ${unit}/px)`;
                setScale(displayScale);
                setShowManualScale(false);
                setIsManualScaleMinimized(false);
                toast({
                  title: "Escala Calibrada",
                  description: `Escala manual configurada: ${scaleValue.toFixed(4)} ${unit} por pixel`,
                });
              }}
              currentScale={manualScaleValue || undefined}
              currentUnit="m"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickTakeoffPage;
