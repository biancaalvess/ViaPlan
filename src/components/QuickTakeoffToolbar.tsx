import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Ruler,
  Cable,
  Box,
  Square,
  StickyNote,
  Settings,
  Trash2,
  MousePointer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TrenchConfig {
  width: number;
  depth: number;
  asphaltRemoval?: {
    width: number;
    thickness: number;
  };
  concreteRemoval?: {
    width: number;
    thickness: number;
  };
  backfill?: {
    type: string;
    customType?: string;
    width: number;
    depth: number;
  };
}

interface BoreShotConfig {
  conduits: Array<{
    sizeIn: string;
    count: number;
    material: string;
  }>;
}

interface ConduitConfig {
  conduits: Array<{
    sizeIn: string;
    count: number;
    material: string;
  }>;
}

interface HydroExcavationConfig {
  type: 'trench' | 'hole' | 'potholing';
  holeShape?: 'rectangle' | 'circle';
  holeDimensions?: {
    length?: number;
    width?: number;
    diameter?: number;
    depth?: number;
    depthUnit?: 'inches' | 'feet';
  };
  potholingData?: {
    surfaceType?: 'asphalt' | 'concrete' | 'dirt';
    averageDepth?: number;
    depthUnit?: 'inches' | 'feet';
    includeRestoration?: boolean;
  };
  conduits: Array<{
    sizeIn: string;
    count: number;
    material: string;
  }>;
}

interface VaultConfig {
  dimensions?: {
    length: number;
    width: number;
    depth: number;
  };
  holeSize?: {
    length: number;
    width: number;
    depth: number;
  };
  spoilVolumeCY?: number;
  asphaltRemovalCY?: number;
  concreteRemovalCY?: number;
  asphaltRestorationCY?: number;
  concreteRestorationCY?: number;
  backfillCY?: number;
  backfillType?: string;
  trafficRated?: boolean;
}

interface QuickTakeoffToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  trenchConfig: TrenchConfig | null;
  onClearTrenchConfig: () => void;
  boreShotConfig: BoreShotConfig | null;
  onClearBoreShotConfig: () => void;
  conduitConfig: ConduitConfig | null;
  onClearConduitConfig: () => void;
  hydroExcavationConfig: HydroExcavationConfig | null;
  onClearHydroExcavationConfig: () => void;
  vaultConfig: VaultConfig | null;
  onClearVaultConfig: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const QuickTakeoffToolbar: React.FC<QuickTakeoffToolbarProps> = ({
  activeTool,
  setActiveTool,
  trenchConfig,
  onClearTrenchConfig,
  boreShotConfig,
  onClearBoreShotConfig,
  conduitConfig,
  onClearConduitConfig,
  hydroExcavationConfig,
  onClearHydroExcavationConfig,
  vaultConfig,
  onClearVaultConfig,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const tools = [
    {
      id: 'select',
      name: 'Select',
      icon: MousePointer,
      color: '#6366f1',
      description: 'Navigate and select measurements',
    },
    {
      id: 'trench',
      name: 'Open Cut Trench',
      icon: Ruler,
      color: '#ef4444',
      description: 'Measure open trenches',
    },
    {
      id: 'bore-shot',
      name: 'Bore Shot',
      icon: Cable,
      color: '#3b82f6',
      description: 'Measure directional boring runs',
    },
    {
      id: 'hydro-excavation',
      name: 'Hydro Excavation',
      icon: Box,
      color: '#f59e0b',
      description: 'Measure hydraulic excavation',
    },
    {
      id: 'conduit',
      name: 'Conduit',
      icon: Cable,
      color: '#10b981',
      description: 'Measure conduit runs',
    },
    {
      id: 'vault',
      name: 'Vault/Handhole',
      icon: Square,
      color: '#8b5cf6',
      description: 'Mark vaults and handholes',
    },
    {
      id: 'yardage',
      name: 'Yardage',
      icon: Square,
      color: '#ec4899',
      description: 'Calculate area measurements',
    },
    {
      id: 'note',
      name: 'Note',
      icon: StickyNote,
      color: '#6b7280',
      description: 'Add notes and annotations',
    },
  ];

  const getConfigStatus = (toolId: string) => {
    switch (toolId) {
      case 'select':
        return null; // Select tool - navigation only, no configuration needed
      case 'trench':
        return trenchConfig ? 'Configured' : 'Not configured';
      case 'bore-shot':
        return boreShotConfig ? 'Configured' : 'Not configured';
      case 'conduit':
        return conduitConfig ? 'Configured' : 'Not configured';
      case 'hydro-excavation':
        return hydroExcavationConfig ? 'Configured' : 'Not configured';
      case 'vault':
        return vaultConfig ? 'Configured' : 'Not configured';
      default:
        return null;
    }
  };

  const getConfigColor = (toolId: string) => {
    const status = getConfigStatus(toolId);
    if (status === 'Configured') return 'bg-green-100 text-green-800';
    if (status === 'Not configured') return 'bg-yellow-100 text-yellow-800';
    return '';
  };

  const handleToolClick = (toolId: string) => {
    setActiveTool(activeTool === toolId ? '' : toolId);
  };

  return (
    <div
      className={`bg-white border-b border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-16' : 'w-full'
      }`}
      style={{ width: isMinimized ? '64px' : '100%' }}
    >
      {/* Header with minimize toggle */}
      <div
        className={`flex items-center justify-between border-b border-gray-100 ${
          isMinimized ? 'p-2' : 'p-3'
        }`}
      >
        {!isMinimized && (
          <div className='flex-1'>
            <h3 className='text-sm font-semibold text-gray-900 mb-1'>
              Measurement Tools
            </h3>
            <p className='text-xs text-gray-500'>
              Select a tool to start measuring
            </p>
          </div>
        )}

        {onToggleMinimize && (
          <Button
            variant='ghost'
            size='sm'
            className='h-6 w-6 p-0 text-gray-500 hover:text-gray-700'
            onClick={onToggleMinimize}
            title={isMinimized ? 'Expand toolbar' : 'Minimize toolbar'}
          >
            {isMinimized ? (
              <ChevronRight className='h-4 w-4' />
            ) : (
              <ChevronLeft className='h-4 w-4' />
            )}
          </Button>
        )}
      </div>

      {/* Tools Section */}
      <div className={`${isMinimized ? 'p-1' : 'p-4'}`}>
        {isMinimized ? (
          // Minimized view - only icons
          <div className='space-y-1'>
            {tools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const configStatus = getConfigStatus(tool.id);

              return (
                <div key={tool.id} className='relative'>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size='sm'
                    className={`w-full h-10 p-0 ${
                      isActive
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleToolClick(tool.id)}
                    title={`${tool.name}: ${tool.description}`}
                  >
                    <div className='flex flex-col items-center space-y-1'>
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? 'text-white' : 'text-gray-600'
                        }`}
                        style={
                          !isActive && tool.color ? { color: tool.color } : {}
                        }
                      />
                      {configStatus && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            configStatus === 'Configured'
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }`}
                        />
                      )}
                    </div>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          // Full view - complete tool information
          <div className='space-y-2'>
            {tools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const configStatus = getConfigStatus(tool.id);
              const configColor = getConfigColor(tool.id);

              return (
                <div key={tool.id} className='relative'>
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size='sm'
                    className={`w-full justify-start h-auto p-3 ${
                      isActive
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <div className='flex items-center space-x-3 w-full'>
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? 'text-white' : 'text-gray-600'
                        }`}
                      />
                      <div className='flex-1 text-left'>
                        <div
                          className={`font-medium ${
                            isActive ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {tool.name}
                        </div>
                        <div
                          className={`text-xs ${
                            isActive ? 'text-red-100' : 'text-gray-500'
                          }`}
                        >
                          {tool.description}
                        </div>
                      </div>
                      {configStatus && (
                        <Badge
                          variant='secondary'
                          className={`text-xs ${configColor}`}
                        >
                          {configStatus}
                        </Badge>
                      )}
                    </div>
                  </Button>

                  {/* Config buttons for tools that need configuration */}
                  {configStatus && isActive && tool.id !== 'select' && (
                    <div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0'
                        onClick={e => {
                          e.stopPropagation();
                          // This would open the config modal
                        }}
                      >
                        <Settings className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 text-red-500 hover:text-red-700'
                        onClick={e => {
                          e.stopPropagation();
                          switch (tool.id) {
                            case 'trench':
                              onClearTrenchConfig();
                              break;
                            case 'bore-shot':
                              onClearBoreShotConfig();
                              break;
                            case 'conduit':
                              onClearConduitConfig();
                              break;
                            case 'hydro-excavation':
                              onClearHydroExcavationConfig();
                              break;
                            case 'vault':
                              onClearVaultConfig();
                              break;
                          }
                        }}
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Configuration Summary - Only show when not minimized */}
      {!isMinimized && (
        <>
          <Separator className='my-4' />
          <div className='space-y-2 px-4 pb-4'>
            <h4 className='text-xs font-medium text-gray-700'>
              Active Configurations
            </h4>
            <div className='space-y-1'>
              {trenchConfig && (
                <div className='text-xs bg-green-50 p-2 rounded'>
                  <span className='font-medium text-green-800'>Trench:</span>
                  <span className='text-green-600 ml-1'>
                    {trenchConfig.width}' × {trenchConfig.depth}'
                  </span>
                </div>
              )}
              {boreShotConfig && (
                <div className='text-xs bg-blue-50 p-2 rounded'>
                  <span className='font-medium text-blue-800'>Bore Shot:</span>
                  <span className='text-blue-600 ml-1'>
                    {boreShotConfig.conduits.length} conduits configured
                  </span>
                </div>
              )}
              {conduitConfig && (
                <div className='text-xs bg-emerald-50 p-2 rounded'>
                  <span className='font-medium text-emerald-800'>Conduit:</span>
                  <span className='text-emerald-600 ml-1'>
                    {conduitConfig.conduits.length} conduits configured
                  </span>
                </div>
              )}
              {hydroExcavationConfig && (
                <div className='text-xs bg-amber-50 p-2 rounded'>
                  <span className='font-medium text-amber-800'>
                    Hydro Excavation:
                  </span>
                  <span className='text-amber-600 ml-1'>
                    {hydroExcavationConfig.type}
                  </span>
                </div>
              )}
              {vaultConfig && (
                <div className='text-xs bg-purple-50 p-2 rounded'>
                  <span className='font-medium text-purple-800'>Vault:</span>
                  <span className='text-purple-600 ml-1'>
                    {vaultConfig.dimensions
                      ? `${vaultConfig.dimensions.length}×${vaultConfig.dimensions.width}×${vaultConfig.dimensions.depth}`
                      : 'Configured'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickTakeoffToolbar;
