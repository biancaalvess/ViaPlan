import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import {
  uploadService,
  PlantUploadData,
  TakeoffUploadData,
  UploadProgress,
} from '../services/uploadService';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UnifiedUploadProps {
  type: 'plants' | 'takeoff';
  projectId?: number;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export const UnifiedUpload: React.FC<UnifiedUploadProps> = ({
  type,
  projectId,
  onSuccess,
  onClose,
  isOpen = true,
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [plantData, setPlantData] = useState<PlantUploadData>({
    name: '',
    code: '',
    description: '',
    project_id: projectId,
    status: 'active',
  });
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);

        // Auto-preencher nome se for planta
        if (type === 'plants' && !plantData.name) {
          setPlantData(prev => ({
            ...prev,
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
          }));
        }
      }
    },
    [type, plantData.name]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      type === 'plants'
        ? {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.bmp'],
            'application/dwg': ['.dwg'],
            'application/dxf': ['.dxf'],
          }
        : {
            'application/pdf': ['.pdf'],
          },
    maxSize: type === 'plants' ? 50 * 1024 * 1024 : 200 * 1024 * 1024, // 50MB para plantas, 200MB para takeoff
    multiple: false,
  });

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo para upload',
        variant: 'destructive',
      });
      return;
    }

    // Validar arquivo
    const validation = uploadService.validateFile(uploadedFile, type);
    if (!validation.valid) {
      toast({
        title: 'Erro',
        description: validation.error || 'Arquivo inválido',
        variant: 'destructive',
      });
      return;
    }

    // Validar dados obrigatórios para plantas
    if (type === 'plants' && (!plantData.name || !plantData.code)) {
      toast({
        title: 'Erro',
        description: 'Nome e código são obrigatórios para plantas',
        variant: 'destructive',
      });
      return;
    }

    // Validar projectId para takeoff
    if (type === 'takeoff' && !projectId) {
      toast({
        title: 'Erro',
        description: 'ID do projeto é obrigatório para takeoff',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: uploadedFile.size, percentage: 0 });

    try {
      let result;

      if (type === 'plants') {
        result = await uploadService.uploadPlant(
          uploadedFile,
          plantData,
          progress => {
            setUploadProgress(progress);
          }
        );
      } else {
        result = await uploadService.uploadTakeoff(
          uploadedFile,
          { projectId: projectId! },
          progress => {
            setUploadProgress(progress);
          }
        );
      }

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: `${type === 'plants' ? 'Planta' : 'Arquivo de takeoff'} enviado com sucesso!`,
        });

        if (onSuccess) {
          onSuccess(result.data);
        }

        // Resetar estado
        setUploadedFile(null);
        setPlantData({
          name: '',
          code: '',
          description: '',
          project_id: projectId,
          status: 'active',
        });
        setUploadProgress(null);
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha no upload',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(null);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <Card className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Upload de {type === 'plants' ? 'Planta' : 'Takeoff'}
          </h2>
          {onClose && (
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-5 w-5' />
            </Button>
          )}
        </div>

        <div className='space-y-6'>
          {/* Área de Drop */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-red-500 bg-red-50'
                : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />

            {uploadedFile ? (
              <div className='space-y-2'>
                <CheckCircle className='h-12 w-12 text-green-500 mx-auto' />
                <div className='text-green-700 font-medium'>
                  Arquivo selecionado: {uploadedFile.name}
                </div>
                <div className='text-sm text-gray-500'>
                  Tamanho: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                <Button variant='outline' size='sm' onClick={removeFile}>
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className='space-y-2'>
                <Upload className='h-12 w-12 text-gray-400 mx-auto' />
                <div className='text-lg font-medium text-gray-700'>
                  {isDragActive
                    ? 'Drop file here'
                    : 'Upload'}
                </div>
                <div className='text-sm text-gray-500'>
                  {type === 'plants'
                    ? 'PDF, imagens (JPG, PNG, TIFF, BMP) ou arquivos CAD (DWG, DXF) até 50MB'
                    : 'Apenas arquivos PDF até 200MB'}
                </div>
              </div>
            )}
          </div>

          {/* Campos específicos para plantas */}
          {type === 'plants' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Nome da Planta *
                </label>
                <Input
                  value={plantData.name}
                  onChange={e =>
                    setPlantData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Nome da planta'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Código *
                </label>
                <Input
                  value={plantData.code}
                  onChange={e =>
                    setPlantData(prev => ({ ...prev, code: e.target.value }))
                  }
                  placeholder='Código único'
                  required
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Descrição
                </label>
                <Input
                  value={plantData.description}
                  onChange={e =>
                    setPlantData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Descrição opcional'
                />
              </div>
            </div>
          )}

          {/* Informações do projeto */}
          {projectId && (
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='text-sm text-gray-600'>
                Projeto ID: <span className='font-medium'>{projectId}</span>
              </div>
            </div>
          )}

          {/* Barra de progresso */}
          {uploadProgress && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm text-gray-600'>
                <span>Progresso do upload</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
              <Progress value={uploadProgress.percentage} className='w-full' />
              <div className='text-xs text-gray-500 text-center'>
                {uploadProgress.loaded > 0 && (
                  <>
                    {(uploadProgress.loaded / (1024 * 1024)).toFixed(2)} MB de{' '}
                    {(uploadProgress.total / (1024 * 1024)).toFixed(2)} MB
                  </>
                )}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className='flex justify-end space-x-3'>
            {onClose && (
              <Button
                variant='outline'
                onClick={onClose}
                disabled={isUploading}
              >
                Cancelar
              </Button>
            )}

            <Button
              onClick={handleUpload}
              disabled={!uploadedFile || isUploading}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              {isUploading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className='h-4 w-4 mr-2' />
                  Enviar {type === 'plants' ? 'Planta' : 'Takeoff'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
