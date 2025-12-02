import React from "react";
import TrenchConfigModal, {
  TrenchConfig,
} from "@/components/TrenchConfigModal";
import BoreShotConfigModal, {
  BoreShotConfig,
} from "@/components/BoreShotConfigModal";
import ConduitConfigModal, {
  ConduitConfig,
} from "@/components/ConduitConfigModal";
import HydroExcavationConfigModal, {
  HydroExcavationConfig,
} from "@/components/HydroExcavationConfigModal";
import VaultConfigModal, { VaultConfig } from "@/components/VaultConfigModal";
import AreaConfigModal, { AreaConfig } from "@/components/AreaConfigModal";

interface ConfigurationModalsProps {
  showTrenchConfig: boolean;
  showBoreShotConfig: boolean;
  showConduitConfig: boolean;
  showHydroExcavationConfig: boolean;
  showVaultConfig: boolean;
  showAreaConfig: boolean;
  trenchConfig: TrenchConfig | null;
  boreShotConfig: BoreShotConfig | null;
  conduitConfig: ConduitConfig | null;
  hydroExcavationConfig: HydroExcavationConfig | null;
  vaultConfig: VaultConfig | null;
  areaConfig: AreaConfig | null;
  onTrenchConfigClose: () => void;
  onBoreShotConfigClose: () => void;
  onConduitConfigClose: () => void;
  onHydroExcavationConfigClose: () => void;
  onVaultConfigClose: () => void;
  onAreaConfigClose: () => void;
  onTrenchConfigConfirm: (config: TrenchConfig) => void;
  onBoreShotConfigConfirm: (config: BoreShotConfig) => void;
  onConduitConfigConfirm: (config: ConduitConfig) => void;
  onHydroExcavationConfigConfirm: (config: HydroExcavationConfig) => void;
  onVaultConfigConfirm: (config: VaultConfig) => void;
  onAreaConfigConfirm: (config: AreaConfig) => void;
}

export const ConfigurationModals: React.FC<ConfigurationModalsProps> = ({
  showTrenchConfig,
  showBoreShotConfig,
  showConduitConfig,
  showHydroExcavationConfig,
  showVaultConfig,
  showAreaConfig,
  trenchConfig,
  boreShotConfig,
  conduitConfig,
  hydroExcavationConfig,
  vaultConfig,
  areaConfig,
  onTrenchConfigClose,
  onBoreShotConfigClose,
  onConduitConfigClose,
  onHydroExcavationConfigClose,
  onVaultConfigClose,
  onAreaConfigClose,
  onTrenchConfigConfirm,
  onBoreShotConfigConfirm,
  onConduitConfigConfirm,
  onHydroExcavationConfigConfirm,
  onVaultConfigConfirm,
  onAreaConfigConfirm,
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

      <AreaConfigModal
        isOpen={showAreaConfig}
        onClose={onAreaConfigClose}
        onConfirm={onAreaConfigConfirm}
        initialConfig={areaConfig}
      />
    </>
  );
};
