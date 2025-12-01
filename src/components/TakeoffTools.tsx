import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { Tool } from './BlueprintCanvas';

interface TakeoffToolsProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  measurements: any[];
  onClearMeasurements: () => void;
  onExportMeasurements: () => void;
  onSelectEditMode?: () => void;
  isSelectEditMode?: boolean;
}

const tools = [
  {
    id: 'select' as Tool,
    name: 'Select',
    icon: '🖱️',
    description: 'Select and edit measurements',
  },
  {
    id: 'trench' as Tool,
    name: 'Vala',
    icon: '🚧',
    description: 'Desenhar valas e escavações',
  },
  {
    id: 'pipe' as Tool,
    name: 'Tubulação',
    icon: '🔧',
    description: 'Marcar tubulações',
  },
  {
    id: 'box' as Tool,
    name: 'Caixa',
    icon: '📦',
    description: 'Posicionar caixas/poços',
  },
  {
    id: 'measure' as Tool,
    name: 'Medição',
    icon: '📏',
    description: 'Medir distâncias',
  },
  {
    id: 'note' as Tool,
    name: 'Anotação',
    icon: '📝',
    description: 'Adicionar notas',
  },
];

export default function TakeoffTools({
  activeTool,
  onToolChange,
  measurements,
  onClearMeasurements,
  onExportMeasurements,
  onSelectEditMode,
  isSelectEditMode = false,
}: TakeoffToolsProps) {
  const getMeasurementStats = () => {
    const stats = {
      total: measurements.length,
      trenches: measurements.filter(m => m.toolType === 'trench').length,
      pipes: measurements.filter(m => m.toolType === 'pipe').length,
      boxes: measurements.filter(m => m.toolType === 'box').length,
      measures: measurements.filter(m => m.toolType === 'measure').length,
      notes: measurements.filter(m => m.toolType === 'note').length,
      selected: measurements.filter(m => m.isSelected).length || 0,
    };
    return stats;
  };

  const stats = getMeasurementStats();

  return (
    <div className='w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto'>
      {/* Indicador de Modo Ativo - NOVO */}
      {isSelectEditMode && (
        <div className='mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg'>
          <div className='flex items-center space-x-2'>
            <span className='text-blue-600'>✏️</span>
            <span className='text-sm font-medium text-blue-800'>
              Modo de Seleção e Edição Ativo
            </span>
          </div>
          <p className='text-xs text-blue-600 mt-1'>
            Clique nas medições para selecionar e editar
          </p>
        </div>
      )}

      <div className='space-y-6'>
        {/* Ferramentas */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Ferramentas de Takeoff</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {tools.map(tool => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? 'default' : 'outline'}
                className='w-full justify-start h-auto p-3'
                onClick={() =>
                  onToolChange(activeTool === tool.id ? null : tool.id)
                }
                disabled={isSelectEditMode}
              >
                <div className='flex items-center space-x-3'>
                  <span className='text-lg'>{tool.icon}</span>
                  <div className='text-left'>
                    <div className='font-medium'>{tool.name}</div>
                    <div className='text-xs text-gray-500'>
                      {tool.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}

            <Separator className='my-4' />

            <Button
              variant='outline'
              className='w-full'
              onClick={() => onToolChange(null)}
              disabled={!activeTool || isSelectEditMode}
            >
              🚫 Desativar Ferramenta
            </Button>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center justify-between'>
              Estatísticas
              <div className='flex space-x-2'>
                {isSelectEditMode && stats.selected > 0 && (
                  <Badge variant='default' className='bg-blue-600'>
                    {stats.selected} selecionado{stats.selected > 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge variant='secondary'>{stats.total} total</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {stats.total === 0 ? (
              <p className='text-sm text-gray-500 text-center py-4'>
                Nenhuma medição realizada
              </p>
            ) : (
              <div className='space-y-2'>
                {stats.trenches > 0 && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm flex items-center space-x-2'>
                      <span>🚧</span>
                      <span>Valas</span>
                    </span>
                    <Badge variant='outline'>{stats.trenches}</Badge>
                  </div>
                )}

                {stats.pipes > 0 && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm flex items-center space-x-2'>
                      <span>🔧</span>
                      <span>Tubulações</span>
                    </span>
                    <Badge variant='outline'>{stats.pipes}</Badge>
                  </div>
                )}

                {stats.boxes > 0 && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm flex items-center space-x-2'>
                      <span>📦</span>
                      <span>Caixas</span>
                    </span>
                    <Badge variant='outline'>{stats.boxes}</Badge>
                  </div>
                )}

                {stats.measures > 0 && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm flex items-center space-x-2'>
                      <span>📏</span>
                      <span>Medições</span>
                    </span>
                    <Badge variant='outline'>{stats.measures}</Badge>
                  </div>
                )}

                {stats.notes > 0 && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm flex items-center space-x-2'>
                      <span>📝</span>
                      <span>Anotações</span>
                    </span>
                    <Badge variant='outline'>{stats.notes}</Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Ações</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {/* Ações de Edição - NOVO */}
            {isSelectEditMode && (
              <>
                <Button
                  variant='outline'
                  className='w-full bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700'
                  onClick={() => {
                    /* TODO: Implementar edição */
                  }}
                  disabled={stats.selected === 0}
                >
                  ✏️ Editar Selecionado{stats.selected > 1 ? 's' : ''}
                </Button>

                <Button
                  variant='outline'
                  className='w-full bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                  onClick={() => {
                    /* TODO: Implementar exclusão */
                  }}
                  disabled={stats.selected === 0}
                >
                  🗑️ Excluir Selecionado{stats.selected > 1 ? 's' : ''}
                </Button>

                <Separator className='my-4' />
              </>
            )}

            <Button
              variant='outline'
              className='w-full'
              onClick={onExportMeasurements}
              disabled={stats.total === 0}
            >
              📊 Exportar Dados
            </Button>

            <Button
              variant='outline'
              className='w-full text-red-600 border-red-200 hover:bg-red-50'
              onClick={onClearMeasurements}
              disabled={stats.total === 0}
            >
              🗑️ Limpar Tudo
            </Button>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm text-gray-600'>
              {isSelectEditMode ? (
                <>
                  <p>
                    <strong>✏️ Modo Seleção:</strong> Clique nas medições para
                    selecionar
                  </p>
                  <p>
                    <strong>Edição:</strong> Use os botões para editar ou
                    excluir
                  </p>
                  <p>
                    <strong>Deseleção:</strong> Clique novamente para
                    deselecionar
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Valas/Medições:</strong> Clique e arraste para
                    desenhar linhas
                  </p>
                  <p>
                    <strong>Tubulações:</strong> Clique e arraste para criar
                    áreas
                  </p>
                  <p>
                    <strong>Caixas/Notas:</strong> Clique para posicionar pontos
                  </p>
                  <p>
                    <strong>Navegação:</strong> Use o scroll para fazer zoom
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
