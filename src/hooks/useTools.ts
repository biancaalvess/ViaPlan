import { useState, useCallback } from 'react';
import { TrenchConfig } from '../components/TrenchConfigModal';
import { BoreShotConfig } from '../components/BoreShotConfigModal';
import { ConduitConfig } from '../components/ConduitConfigModal';
import { HydroExcavationConfig } from '../components/HydroExcavationConfigModal';
import { VaultConfig } from '../components/VaultConfigModal';

export const useTools = () => {
  const [activeTool, setActiveTool] = useState<string>('');
  const [trenchConfig, setTrenchConfig] = useState<TrenchConfig | null>(null);
  const [boreShotConfig, setBoreShotConfig] = useState<BoreShotConfig | null>(null);
  const [conduitConfig, setConduitConfig] = useState<ConduitConfig | null>(null);
  const [hydroExcavationConfig, setHydroExcavationConfig] = useState<HydroExcavationConfig | null>(null);
  const [vaultConfig, setVaultConfig] = useState<VaultConfig | null>(null);

  const handleToolSelect = useCallback((tool: string) => {
    if (tool === activeTool) {
      setActiveTool('');
    } else {
      setActiveTool(tool);
    }
  }, [activeTool]);

  const setTrenchConfiguration = useCallback((config: TrenchConfig) => {
    setTrenchConfig(config);
    setActiveTool('trench');
  }, []);

  const setBoreShotConfiguration = useCallback((config: BoreShotConfig) => {
    setBoreShotConfig(config);
    setActiveTool('bore-shot');
  }, []);

  const setConduitConfiguration = useCallback((config: ConduitConfig) => {
    setConduitConfig(config);
    setActiveTool('conduit');
  }, []);

  const setHydroExcavationConfiguration = useCallback((config: HydroExcavationConfig) => {
    setHydroExcavationConfig(config);
    setActiveTool('hydro-excavation');
  }, []);

  const setVaultConfiguration = useCallback((config: VaultConfig) => {
    setVaultConfig(config);
    setActiveTool('vault');
  }, []);

  const clearTrenchConfig = useCallback(() => {
    setTrenchConfig(null);
    if (activeTool === 'trench') {
      setActiveTool('');
    }
  }, [activeTool]);

  const clearBoreShotConfig = useCallback(() => {
    setBoreShotConfig(null);
    if (activeTool === 'bore-shot') {
      setActiveTool('');
    }
  }, [activeTool]);

  const clearConduitConfig = useCallback(() => {
    setConduitConfig(null);
    if (activeTool === 'conduit') {
      setActiveTool('');
    }
  }, [activeTool]);

  const clearHydroExcavationConfig = useCallback(() => {
    setHydroExcavationConfig(null);
    if (activeTool === 'hydro-excavation') {
      setActiveTool('');
    }
  }, [activeTool]);

  const clearVaultConfig = useCallback(() => {
    setVaultConfig(null);
    if (activeTool === 'vault') {
      setActiveTool('');
    }
  }, [activeTool]);

  const clearAllConfigs = useCallback(() => {
    setTrenchConfig(null);
    setBoreShotConfig(null);
    setConduitConfig(null);
    setHydroExcavationConfig(null);
    setVaultConfig(null);
    setActiveTool('');
  }, []);

  return {
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
  };
};
