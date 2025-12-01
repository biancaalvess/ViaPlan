import React from 'react';
import TrenchConfigModal, {
  TrenchConfig,
} from '@/components/TrenchConfigModal';
import BoreShotConfigModal, {
  BoreShotConfig,
} from '@/components/BoreShotConfigModal';
import ConduitConfigModal, {
  ConduitConfig,
} from '@/components/ConduitConfigModal';
import HydroExcavationConfigModal, {
  HydroExcavationConfig,
} from '@/components/HydroExcavationConfigModal';
import VaultConfigModal, { VaultConfig } from '@/components/VaultConfigModal';

interface ConfigurationModalsProps {
  showTrenchConfig: boolean;
  showBoreShotConfig: boolean;
  showConduitConfig: boolean;
  showHydroExcavationConfig: boolean;
  showVaultConfig: boolean;
  trenchConfig: TrenchConfig | null;
  boreShotConfig: BoreShotConfig | null;
  conduitConfig: ConduitConfig | null;
  hydroExcavationConfig: HydroExcavationConfig | null;
  vaultConfig: VaultConfig | null;
  onTrenchConfigClose: () => void;
  onBoreShotConfigClose: () => void;
  onConduitConfigClose: () => void;
  onHydroExcavationConfigClose: () => void;
  onVaultConfigClose: () => void;
  onTrenchConfigConfirm: (config: TrenchConfig) => void;
  onBoreShotConfigConfirm: (config: BoreShotConfig) => void;
  onConduitConfigConfirm: (config: ConduitConfig) => void;
  onHydroExcavationConfigConfirm: (config: HydroExcavationConfig) => void;
  onVaultConfigConfirm: (config: VaultConfig) => void;
}

export const ConfigurationModals: React.FC<ConfigurationModalsProps> = ({
  showTrenchConfig,
  showBoreShotConfig,
  showConduitConfig,
  showHydroExcavationConfig,
  showVaultConfig,
  trenchConfig,
  boreShotConfig,
  conduitConfig,
  hydroExcavationConfig,
  vaultConfig,
  onTrenchConfigClose,
  onBoreShotConfigClose,
  onConduitConfigClose,
  onHydroExcavationConfigClose,
  onVaultConfigClose,
  onTrenchConfigConfirm,
  onBoreShotConfigConfirm,
  onConduitConfigConfirm,
  onHydroExcavationConfigConfirm,
  onVaultConfigConfirm,
}) => {
  return (
    <>
      <TrenchConfigModal
        isOpen={showTrenchConfig}
        onClose={onTrenchConfigClose}
        onConfirm={onTrenchConfigConfirm}
        initialConfig={trenchConfig}
      />

      <BoreShotConfigModal
        isOpen={showBoreShotConfig}
        onClose={onBoreShotConfigClose}
        onConfirm={onBoreShotConfigConfirm}
        initialConfig={boreShotConfig}
      />

      <ConduitConfigModal
        isOpen={showConduitConfig}
        onClose={onConduitConfigClose}
        onConfirm={onConduitConfigConfirm}
        initialConfig={conduitConfig}
      />

      <HydroExcavationConfigModal
        isOpen={showHydroExcavationConfig}
        onClose={onHydroExcavationConfigClose}
        onSave={onHydroExcavationConfigConfirm}
        initialConfig={hydroExcavationConfig}
      />

      <VaultConfigModal
        isOpen={showVaultConfig}
        onClose={onVaultConfigClose}
        onConfirm={onVaultConfigConfirm}
        initialConfig={vaultConfig}
      />
    </>
  );
};
