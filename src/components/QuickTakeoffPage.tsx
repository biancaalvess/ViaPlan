import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import QuickTakeoffViewer from '@/components/QuickTakeoffViewer';
import { useToast } from '@/components/ui/use-toast';

// Custom hooks
import { usePlants } from '@/hooks/usePlants';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useActionHistory } from '@/hooks/useActionHistory';
import { useTools } from '@/hooks/useTools';
import { useExport } from '@/hooks/useExport';

// Components
import { TopToolbar } from '@/components/QuickTakeoff/TopToolbar';
import { RightSidebar } from '@/components/QuickTakeoff/RightSidebar';
import { ConfigurationModals } from '@/components/QuickTakeoff/ConfigurationModals';

const QuickTakeoffPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // State management
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState('1" = 100\'');
  const [zoom, setZoom] = useState(1);
  const [isToolbarMinimized, setIsToolbarMinimized] = useState(false);

  // Custom hooks
  const { currentPlant, isLoadingPlant, loadPlantFromId, clearCurrentPlant } =
    usePlants();

  const {
    measurements,
    addMeasurement,
    deleteMeasurement,
    updateMeasurement,
    clearMeasurements,
    getMeasurementsByType,
    getTotalLength,
    getTotalArea,
  } = useMeasurements();

  const {
    actionHistory,
    canUndo,
    saveAction,
    undoLastAction,
    clearHistory,
    getHistoryCount,
    getLastAction,
  } = useActionHistory();

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
    clearAllConfigs,
  } = useTools();

  const { exportToCSV, exportToJSON } = useExport();

  // Modal states
  const [showTrenchConfig, setShowTrenchConfig] = useState(false);
  const [showBoreShotConfig, setShowBoreShotConfig] = useState(false);
  const [showConduitConfig, setShowConduitConfig] = useState(false);
  const [showHydroExcavationConfig, setShowHydroExcavationConfig] =
    useState(false);
  const [showVaultConfig, setShowVaultConfig] = useState(false);

  // Check for plant parameter in URL
  useEffect(() => {
    const plantId = searchParams.get('plant');
    if (plantId) {
      loadPlantFromId(plantId);
    }
  }, [searchParams, loadPlantFromId]);

  // Load plant data from ID
  const handlePlantLoad = async (plantId: string) => {
    const plant = await loadPlantFromId(plantId);
    if (plant && plant.file_path) {
      const fileUrl = `${window.location.origin}${plant.file_path}`;
      setPdfUrl(fileUrl);
    }
  };

  // Handle file selection
  const handleFileSelect = (fileUrl: string) => {
    setPdfUrl(fileUrl);
    clearCurrentPlant();
    toast({
      title: 'PDF Loaded',
      description: 'PDF file loaded successfully!',
    });
  };

  // Handle tool selection with config modals
  const handleToolSelectWithConfig = (tool: string) => {
    // Save previous state for undo
    if (tool === 'trench' && trenchConfig) {
      saveAction('config', { tool, previousConfig: trenchConfig });
    } else if (tool === 'bore-shot' && boreShotConfig) {
      saveAction('config', { tool, previousConfig: boreShotConfig });
    } else if (tool === 'conduit' && conduitConfig) {
      saveAction('config', { tool, previousConfig: conduitConfig });
    } else if (tool === 'hydro-excavation' && hydroExcavationConfig) {
      saveAction('config', { tool, previousConfig: hydroExcavationConfig });
    } else if (tool === 'vault' && vaultConfig) {
      saveAction('config', { tool, previousConfig: vaultConfig });
    }

    // Show config modal if tool doesn't have config
    if (tool === 'trench' && !trenchConfig) {
      setShowTrenchConfig(true);
      return;
    }
    if (tool === 'bore-shot' && !boreShotConfig) {
      setShowBoreShotConfig(true);
      return;
    }
    if (tool === 'conduit' && !conduitConfig) {
      setShowConduitConfig(true);
      return;
    }
    if (tool === 'hydro-excavation' && !hydroExcavationConfig) {
      setShowHydroExcavationConfig(true);
      return;
    }
    if (tool === 'vault' && !vaultConfig) {
      setShowVaultConfig(true);
      return;
    }

    handleToolSelect(tool);
  };

  // Handle config confirmations
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

  // Add measurement with undo support
  const handleAddMeasurement = (measurement: any) => {
    saveAction('measurement', { action: 'add', measurement });
    addMeasurement(measurement);
  };

  // Delete measurement with undo support
  const handleDeleteMeasurement = (id: string) => {
    const measurementToDelete = measurements.find(m => m.id === id);
    if (measurementToDelete) {
      saveAction('measurement', {
        action: 'delete',
        measurement: measurementToDelete,
      });
    }
    deleteMeasurement(id);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle zoom change with undo support
  const handleZoomChange = (newZoom: number) => {
    saveAction('zoom', { previousZoom: zoom });
    setZoom(Math.max(0.5, Math.min(3, newZoom)));
  };

  // Handle scale change with undo support
  const handleScaleChange = (newScale: string) => {
    saveAction('scale', { previousScale: scale });
    setScale(newScale);
  };

  // Handle undo with specific logic
  const handleUndo = () => {
    const lastAction = undoLastAction();
    if (!lastAction) return;

    switch (lastAction.type) {
      case 'measurement':
        if (lastAction.data.action === 'add') {
          // Remove the last added measurement
          const lastMeasurement = measurements[measurements.length - 1];
          if (lastMeasurement) {
            deleteMeasurement(lastMeasurement.id);
          }
        } else if (lastAction.data.action === 'delete') {
          // Restore the deleted measurement
          addMeasurement(lastAction.data.measurement);
        }
        break;

      case 'config':
        // Restore previous configuration
        if (lastAction.data.tool === 'trench') {
          setTrenchConfiguration(lastAction.data.previousConfig);
        } else if (lastAction.data.tool === 'bore-shot') {
          setBoreShotConfiguration(lastAction.data.previousConfig);
        } else if (lastAction.data.tool === 'conduit') {
          setConduitConfiguration(lastAction.data.previousConfig);
        } else if (lastAction.data.tool === 'hydro-excavation') {
          setHydroExcavationConfiguration(lastAction.data.previousConfig);
        } else if (lastAction.data.tool === 'vault') {
          setVaultConfiguration(lastAction.data.previousConfig);
        }
        break;

      case 'scale':
        // Restore previous scale
        setScale(lastAction.data.previousScale);
        break;

      case 'zoom':
        // Restore previous zoom
        setZoom(lastAction.data.previousZoom);
        break;
    }
  };

  // Handle export
  const handleExportCSV = () => {
    exportToCSV(measurements, currentPage);
  };

  const handleExportJSON = () => {
    exportToJSON(measurements, scale);
  };

  return (
    <Layout>
      <div className='h-screen flex flex-col bg-slate-50'>
        {/* Top Toolbar */}
        <TopToolbar
          currentPlant={currentPlant}
          scale={scale}
          zoom={zoom}
          canUndo={canUndo}
          onFileSelect={handleFileSelect}
          onScaleChange={handleScaleChange}
          onZoomChange={handleZoomChange}
          onUndo={handleUndo}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />

        {/* Main Content */}
        <div className='flex-1 flex'>
          {/* PDF Viewer */}
          <div className='flex-1 bg-slate-100 p-4 overflow-hidden'>
            <QuickTakeoffViewer
              pdfUrl={pdfUrl}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={handlePageChange}
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
          </div>

          {/* Right Sidebar */}
          <RightSidebar
            isToolbarMinimized={isToolbarMinimized}
            activeTool={activeTool}
            measurements={measurements}
            trenchConfig={trenchConfig}
            boreShotConfig={boreShotConfig}
            conduitConfig={conduitConfig}
            hydroExcavationConfig={hydroExcavationConfig}
            vaultConfig={vaultConfig}
            onToolSelect={handleToolSelectWithConfig}
            onClearTrenchConfig={clearTrenchConfig}
            onClearBoreShotConfig={clearBoreShotConfig}
            onClearConduitConfig={clearConduitConfig}
            onClearHydroExcavationConfig={clearHydroExcavationConfig}
            onClearVaultConfig={clearVaultConfig}
            onToggleMinimize={() => setIsToolbarMinimized(!isToolbarMinimized)}
            onDeleteMeasurement={handleDeleteMeasurement}
          />
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
          onHydroExcavationConfigClose={() =>
            setShowHydroExcavationConfig(false)
          }
          onVaultConfigClose={() => setShowVaultConfig(false)}
          onTrenchConfigConfirm={handleTrenchConfigConfirm}
          onBoreShotConfigConfirm={handleBoreShotConfigConfirm}
          onConduitConfigConfirm={handleConduitConfigConfirm}
          onHydroExcavationConfigConfirm={handleHydroExcavationConfigConfirm}
          onVaultConfigConfirm={handleVaultConfigConfirm}
        />
      </div>
    </Layout>
  );
};

export default QuickTakeoffPage;
