import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Image,
  AlertCircle,
  Pause,
  Play,
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export interface UploadProgressItem {
  id: string;
  file: File;
  status:
    | 'pending'
    | 'uploading'
    | 'processing'
    | 'completed'
    | 'error'
    | 'paused';
  progress: number;
  error?: string;
  uploadedAt?: Date;
  processedAt?: Date;
}

interface UploadProgressProps {
  uploads: UploadProgressItem[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onPause,
  onResume,
  onRetry,
  onRemove,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return <Upload className='h-4 w-4 text-gray-500' />;
      case 'uploading':
        return <Upload className='h-4 w-4 text-blue-500 animate-pulse' />;
      case 'processing':
        return <FileText className='h-4 w-4 text-yellow-500 animate-spin' />;
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'paused':
        return <Pause className='h-4 w-4 text-orange-500' />;
      default:
        return <Upload className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return 'Aguardando';
      case 'uploading':
        return 'Fazendo Upload';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      case 'error':
        return 'Erro';
      case 'paused':
        return 'Pausado';
      default:
        return 'Desconhecido';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/'))
      return <Image className='h-4 w-4 text-blue-500' />;
    if (file.type === 'application/pdf')
      return <FileText className='h-4 w-4 text-red-500' />;
    return <FileText className='h-4 w-4 text-gray-500' />;
  };

  if (uploads.length === 0) {
    return null;
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Upload className='h-5 w-5' />
          Progresso do Upload ({uploads.length} arquivo
          {uploads.length !== 1 ? 's' : ''})
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {uploads.map(upload => (
          <div key={upload.id} className='border rounded-lg p-4 space-y-3'>
            {/* Cabeçalho do item */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                {getFileIcon(upload.file)}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {upload.file.name}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {formatFileSize(upload.file.size)}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Badge className={getStatusColor(upload.status)}>
                  <div className='flex items-center gap-1'>
                    {getStatusIcon(upload.status)}
                    {getStatusText(upload.status)}
                  </div>
                </Badge>

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toggleExpanded(upload.id)}
                  className='h-6 w-6 p-0'
                >
                  <div
                    className={`transform transition-transform ${expandedItems.has(upload.id) ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </div>
                </Button>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className='space-y-2'>
              <div className='flex justify-between text-xs text-gray-600'>
                <span>{Math.round(upload.progress)}%</span>
                <span>{getStatusText(upload.status)}</span>
              </div>
              <Progress value={upload.progress} className='h-2' />
            </div>

            {/* Detalhes expandidos */}
            {expandedItems.has(upload.id) && (
              <div className='pt-3 border-t space-y-3'>
                {/* Informações do arquivo */}
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='text-gray-500'>Tipo</p>
                    <p className='font-medium'>
                      {upload.file.type || 'Desconhecido'}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Tamanho</p>
                    <p className='font-medium'>
                      {formatFileSize(upload.file.size)}
                    </p>
                  </div>
                  {upload.uploadedAt && (
                    <div>
                      <p className='text-gray-500'>Upload iniciado</p>
                      <p className='font-medium'>
                        {upload.uploadedAt.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  )}
                  {upload.processedAt && (
                    <div>
                      <p className='text-gray-500'>Processado em</p>
                      <p className='font-medium'>
                        {upload.processedAt.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mensagem de erro */}
                {upload.error && (
                  <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
                    <AlertCircle className='h-4 w-4 text-red-500' />
                    <p className='text-sm text-red-700'>{upload.error}</p>
                  </div>
                )}

                {/* Ações */}
                <div className='flex gap-2'>
                  {upload.status === 'uploading' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onPause(upload.id)}
                      className='flex-1'
                    >
                      <Pause className='h-4 w-4 mr-1' />
                      Pausar
                    </Button>
                  )}

                  {upload.status === 'paused' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onResume(upload.id)}
                      className='flex-1'
                    >
                      <Play className='h-4 w-4 mr-1' />
                      Retomar
                    </Button>
                  )}

                  {upload.status === 'error' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onRetry(upload.id)}
                      className='flex-1'
                    >
                      <Upload className='h-4 w-4 mr-1' />
                      Tentar Novamente
                    </Button>
                  )}

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onRemove(upload.id)}
                    className='flex-1'
                  >
                    Remover
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
