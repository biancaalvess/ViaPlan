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
  const { currentPlant, loadPlantFromId } = usePlants();
  const { measurements, addMeasurement, deleteMeasurement } = useMeasurements();
  const { canUndo, undoLastAction, saveAction } = useActionHistory();
  const {
    activeTool,
    trenchConfig,
    boreShotConfig,
    conduitConfig,
    hydroExcavationConfig,
    vaultConfig,
    handleToolSelect,
    setTrenchConfiguration,
    setBoreShotConfiguration,
    setConduitConfiguration,
    setHydroExcavationConfiguration,
    setVaultConfiguration,
    clearTrenchConfig,
    clearBoreShotConfig,
    clearConduitConfig,
    clearHydroExcavationConfig,
    clearVaultConfig,
  } = useTools();
  const { exportToCSV, exportToJSON } = useExport();

  // Modal states
  const [showTrenchConfig, setShowTrenchConfig] = useState(false);
  const [showBoreShotConfig, setShowBoreShotConfig] = useState(false);
  const [showConduitConfig, setShowConduitConfig] = useState(false);
  const [showHydroExcavationConfig, setShowHydroExcavationConfig] =
    useState(false);
  const [showVaultConfig, setShowVaultConfig] = useState(false);

  useEffect(() => {
    const plantId = searchParams.get("plant");
    if (plantId) {
      loadPlantFromId(plantId);
    }
  }, [searchParams, loadPlantFromId]);

  const handleFileSelect = (fileUrl: string) => {
    setPdfUrl(fileUrl);
    toast({
      title: "PDF Loaded",
      description: "PDF file loaded successfully!",
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
      name: "Select",
      description: "Navigate and select measurements",
      icon: MousePointer2,
      needsConfig: false,
    },
    {
      id: "trench",
      name: "Open Cut Trench",
      description: "Measure open trenches",
      icon: Square,
      needsConfig: true,
      config: trenchConfig,
    },
    {
      id: "bore-shot",
      name: "Bore Shot",
      description: "Measure directional boring runs",
      icon: Drill,
      needsConfig: true,
      config: boreShotConfig,
    },
    {
      id: "hydro-excavation",
      name: "Hydro Excavation",
      description: "Measure hydraulic excavation",
      icon: Droplet,
      needsConfig: true,
      config: hydroExcavationConfig,
    },
    {
      id: "conduit",
      name: "Conduit",
      description: "Measure conduit runs",
      icon: Gauge,
      needsConfig: true,
      config: conduitConfig,
    },
    {
      id: "vault",
      name: "Vault/Handhole",
      description: "Mark vaults and handholes",
      icon: CheckSquare,
      needsConfig: true,
      config: vaultConfig,
    },
    {
      id: "yardage",
      name: "Yardage",
      description: "Calculate area measurements",
      icon: Layers,
      needsConfig: false,
    },
    {
      id: "note",
      name: "Note",
      description: "Add notes and annotations",
      icon: FileText,
      needsConfig: false,
    },
  ];

  const activeConfigs: Array<{ name: string; onClear: () => void }> = [
    trenchConfig && { name: "Open Cut Trench", onClear: clearTrenchConfig },
    boreShotConfig && { name: "Bore Shot", onClear: clearBoreShotConfig },
    conduitConfig && { name: "Conduit", onClear: clearConduitConfig },
    hydroExcavationConfig && {
      name: "Hydro Excavation",
      onClear: clearHydroExcavationConfig,
    },
    vaultConfig && { name: "Vault/Handhole", onClear: clearVaultConfig },
  ].filter((config): config is { name: string; onClear: () => void } =>
    Boolean(config)
  );

  return (
    <div className="h-screen flex flex-col bg-[#223148] text-[#f3eae0]">
      {/* Top Header */}
      <div className="bg-[#223148] border-b border-[#2f486d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-[#f3eae0]">
            Quick Takeoff
          </h1>

          <div className="[&_button]:bg-[#2f486d] [&_button]:border-[#3d5a7d] [&_button]:text-[#f3eae0] [&_button]:hover:bg-[#3d5a7d]">
            <PDFUpload onFileSelect={handleFileSelect} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#f3eae0]/80">Scale:</span>
            <Select value={scale} onValueChange={setScale}>
              <SelectTrigger className="w-40 bg-[#2f486d] border-[#3d5a7d] text-[#f3eae0]">
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="bg-[#1a4a25] border-[#2a5a35] text-[#DAE2CB] hover:bg-[#2a5a35]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="bg-[#1a4a25] border-[#2a5a35] text-[#DAE2CB] hover:bg-[#2a5a35]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Central Content Area */}
        <div className="flex-1 bg-[#223148] flex items-center justify-center">
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
                No PDFs loaded
              </h3>
              <p className="text-sm text-[#f3eae0]/60">
                Upload a PDF to get started
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-[#223148] border-l border-[#2f486d] flex flex-col">
          {/* Measurement Tools */}
          <div className="p-4 border-b border-[#2f486d]">
            <h2 className="text-sm font-semibold text-[#f3eae0] mb-3">
              Measurement Tools
            </h2>
            <p className="text-xs text-[#f3eae0]/60 mb-4">
              Select a tool to start measuring
            </p>
            <div className="space-y-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                const isConfigured = !tool.needsConfig || tool.config;

                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelectWithConfig(tool.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isActive
                        ? "bg-[#2f486d] border-[#3d5a7d]"
                        : "bg-[#1a2538] border-[#2f486d] hover:bg-[#2f486d]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-[#f3eae0] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#f3eae0]">
                            {tool.name}
                          </span>
                          {tool.needsConfig && !isConfigured && (
                            <Badge className="bg-[#d2c7b8]/30 text-[#d2c7b8] border-[#d2c7b8]/50 text-xs">
                              Not configured
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#f3eae0]/60">
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
          <div className="p-4 border-b border-[#2f486d]">
            <h2 className="text-sm font-semibold text-[#f3eae0] mb-3">
              Active Configurations
            </h2>
            {activeConfigs.length === 0 ? (
              <p className="text-xs text-[#d2c7b8]/60 italic">
                No active configurations
              </p>
            ) : (
              <div className="space-y-2">
                {activeConfigs.map((config, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#2f486d] rounded text-sm text-[#f3eae0]"
                  >
                    <span>{config.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={config.onClear}
                      className="h-6 px-2 text-xs text-[#d2c7b8] hover:text-[#f3eae0]"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-sm font-semibold text-[#f3eae0] mb-3">
              Measurements
            </h2>
            {measurements.length === 0 ? (
              <p className="text-xs text-[#d2c7b8]/60 italic">
                No measurements yet. Select a tool and start measuring on the
                plan.
              </p>
            ) : (
              <div className="space-y-2">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="p-3 bg-[#2f486d] rounded-lg border border-[#3d5a7d]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#f3eae0]">
                          {measurement.label}
                        </p>
                        <p className="text-xs text-[#d2c7b8]">
                          {measurement.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMeasurement(measurement.id)}
                        className="text-[#d2c7b8] hover:text-[#f3eae0]"
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
        trenchConfig={trenchConfig}
        boreShotConfig={boreShotConfig}
        conduitConfig={conduitConfig}
        hydroExcavationConfig={hydroExcavationConfig}
        vaultConfig={vaultConfig}
        onTrenchConfigClose={() => setShowTrenchConfig(false)}
        onBoreShotConfigClose={() => setShowBoreShotConfig(false)}
        onConduitConfigClose={() => setShowConduitConfig(false)}
        onHydroExcavationConfigClose={() => setShowHydroExcavationConfig(false)}
        onVaultConfigClose={() => setShowVaultConfig(false)}
        onTrenchConfigConfirm={handleTrenchConfigConfirm}
        onBoreShotConfigConfirm={handleBoreShotConfigConfirm}
        onConduitConfigConfirm={handleConduitConfigConfirm}
        onHydroExcavationConfigConfirm={handleHydroExcavationConfigConfirm}
        onVaultConfigConfirm={handleVaultConfigConfirm}
      />
    </div>
  );
};

export default QuickTakeoffPage;
