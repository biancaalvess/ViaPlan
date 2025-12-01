import React from 'react';
import { Separator } from '@/components/ui/separator';
import QuickTakeoffToolbar from '@/components/QuickTakeoffToolbar';
import { MeasurementsList } from './MeasurementsList';
import { TakeoffMeasurement } from '@/hooks/useMeasurements';
import { TrenchConfig } from '@/components/TrenchConfigModal';
import { BoreShotConfig } from '@/components/BoreShotConfigModal';
import { ConduitConfig } from '@/components/ConduitConfigModal';
import { HydroExcavationConfig } from '@/components/HydroExcavationConfigModal';
import { VaultConfig } from '@/components/VaultConfigModal';

interface RightSidebarProps {
  isToolbarMinimized: boolean;
  activeTool: string;
  measurements: TakeoffMeasurement[];
  trenchConfig: TrenchConfig | null;
  boreShotConfig: BoreShotConfig | null;
  conduitConfig: ConduitConfig | null;
  hydroExcavationConfig: HydroExcavationConfig | null;
  vaultConfig: VaultConfig | null;
  onToolSelect: (tool: string) => void;
  onClearTrenchConfig: () => void;
  onClearBoreShotConfig: () => void;
  onClearConduitConfig: () => void;
  onClearHydroExcavationConfig: () => void;
  onClearVaultConfig: () => void;
  onToggleMinimize: () => void;
  onDeleteMeasurement: (id: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isToolbarMinimized,
  activeTool,
  measurements,
  trenchConfig,
  boreShotConfig,
  conduitConfig,
  hydroExcavationConfig,
  vaultConfig,
  onToolSelect,
  onClearTrenchConfig,
  onClearBoreShotConfig,
  onClearConduitConfig,
  onClearHydroExcavationConfig,
  onClearVaultConfig,
  onToggleMinimize,
  onDeleteMeasurement,
}) => {
  return (
    <div
      className={`bg-white border-l border-slate-200 flex flex-col transition-all duration-300 ${
        isToolbarMinimized ? 'w-16' : 'w-80'
      }`}
      style={{ width: isToolbarMinimized ? '64px' : '320px' }}
    >
      {/* Tools */}
      <QuickTakeoffToolbar
        activeTool={activeTool}
        setActiveTool={onToolSelect}
        trenchConfig={trenchConfig}
        onClearTrenchConfig={onClearTrenchConfig}
        boreShotConfig={boreShotConfig}
        onClearBoreShotConfig={onClearBoreShotConfig}
        conduitConfig={conduitConfig}
        onClearConduitConfig={onClearConduitConfig}
        hydroExcavationConfig={hydroExcavationConfig}
        onClearHydroExcavationConfig={onClearHydroExcavationConfig}
        vaultConfig={vaultConfig}
        onClearVaultConfig={onClearVaultConfig}
        isMinimized={isToolbarMinimized}
        onToggleMinimize={onToggleMinimize}
      />

      <Separator />

      {/* Measurements List */}
      <div
        className={`flex-1 overflow-y-auto ${
          isToolbarMinimized ? 'px-0 py-1' : 'p-4'
        }`}
      >
        <MeasurementsList
          measurements={measurements}
          isMinimized={isToolbarMinimized}
          onDeleteMeasurement={onDeleteMeasurement}
        />
      </div>
    </div>
  );
};
