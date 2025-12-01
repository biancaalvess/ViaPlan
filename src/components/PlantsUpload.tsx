import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  Edit,
  Trash2,
  MapPin,
  MoreVertical,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PlantsApiService, {
  PlantDocument,
  PlantUploadData,
} from '../services/plantsApiService';

interface PlantsUploadProps {
  projectId?: string;
  onUploadComplete?: (plantData: PlantDocument) => void;
  onFileSelect?: (fileUrl: string, file: File) => void;
}

const PlantsUpload: React.FC<PlantsUploadProps> = ({
  projectId = '1',
  onUploadComplete,
  onFileSelect,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPlants, setUploadedPlants] = useState<PlantDocument[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<PlantUploadData>({
    name: '',
    code: '',
    description: '',
    project_id: projectId || '1',
    location: '',
  });
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setShowUploadModal(true);

        if (onFileSelect) {
          const fileUrl = URL.createObjectURL(file);
          onFileSelect(fileUrl, file);
        }
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
      'image/bmp': ['.bmp'],
      'application/dwg': ['.dwg'],
      'application/dxf': ['.dxf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile || !formData.name || !formData.code) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    // Validar arquivo antes do upload
    const validationError = PlantsApiService.validateFile(selectedFile);
    if (validationError) {
      toast({
        title: 'Erro',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Preparar dados para upload
      const uploadData: PlantUploadData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        project_id: formData.project_id || '1',
        location: formData.location,
        file: selectedFile,
      };

      // Fazer upload usando o service
      const result = await PlantsApiService.uploadPlant(uploadData);

      if (result.success && result.data) {
        // API externa pode retornar dados em result.data diretamente
        const newPlant = result.data.plant || result.data;

        setUploadedPlants(prev => [...prev, newPlant]);

        if (onUploadComplete) {
          onUploadComplete(newPlant);
        }

        // Reset form
        setFormData({
          name: '',
          code: '',
          description: '',
          project_id: projectId || '1',
          location: '',
        });
        setSelectedFile(null);
        setShowUploadModal(false);

        toast({
          title: 'Sucesso',
          description: 'Planta carregada com sucesso!',
        });
      } else {
        throw new Error(result.message || 'Falha no upload');
      }
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);

      let errorMessage = 'Falha ao carregar planta';

      // Verificar se é erro 500 da API externa
      if (error.message && error.message.includes('500')) {
        errorMessage =
          'Upload temporariamente indisponível na API externa. Funcionalidade será restaurada em breve.';
      } else if (error.name === 'AbortError') {
        errorMessage =
          'Upload cancelado por timeout. Tente novamente com um arquivo menor.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage =
          'Erro de conexão. Verifique sua internet e tente novamente.';
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePlant = async (plantId: number) => {
    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}/api/plants/${plantId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        setUploadedPlants(prev => prev.filter(p => p.id !== plantId));
        toast({
          title: 'Success',
          description: 'Plant deleted successfully',
        });
      } else {
        throw new Error('Failed to delete plant');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete plant',
        variant: 'destructive',
      });
    }
  };

  const openInTakeoff = (plant: PlantDocument) => {
    // Navigate to takeoff page with plant data
    window.location.href = `/takeoff?plant=${plant.id}`;
  };

  const editPlant = (plant: PlantDocument) => {
    // TODO: Implement edit functionality
    toast({
      title: 'Info',
      description: 'Edit functionality coming soon',
    });
  };

  const adjustLocation = (plant: PlantDocument) => {
    // TODO: Implement location adjustment
    toast({
      title: 'Info',
      description: 'Location adjustment coming soon',
    });
  };

  return (
    <div className='w-full max-w-full'>
      {/* Upload Area */}
      <div {...getRootProps()} className='w-full'>
        <input {...getInputProps()} />
        <Button
          variant='outline'
          className={`w-full h-12 transition-all duration-200 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'hover:border-gray-400'
          }`}
        >
          <Upload className='h-4 w-4 mr-2' />
          {isDragActive ? 'Drop file here...' : 'Drag file or click to select'}
        </Button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedFile && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold'>Upload New Plant</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowUploadModal(false)}
                className='h-8 w-8 p-0'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            <div className='space-y-4'>
              {/* File Info */}
              <div className='p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center space-x-2'>
                  <FileText className='h-5 w-5 text-gray-500' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{selectedFile.name}</p>
                    <p className='text-xs text-gray-500'>
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <Label htmlFor='name'>Plant Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder='Enter plant name'
                  required
                />
              </div>

              <div>
                <Label htmlFor='code'>Plant Code *</Label>
                <Input
                  id='code'
                  value={formData.code}
                  onChange={e =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder='Enter unique code'
                  required
                />
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Optional description'
                />
              </div>

              <div>
                <Label htmlFor='location'>Location</Label>
                <Input
                  id='location'
                  value={formData.location}
                  onChange={e =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder='Plant location (optional)'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-2 pt-2'>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !formData.name || !formData.code}
                  className='flex-1 bg-red-600 hover:bg-red-700'
                >
                  {isUploading ? 'Uploading...' : 'Upload Plant'}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Plants List */}
      {uploadedPlants.length > 0 && (
        <Card className='mt-4'>
          <CardContent className='p-4'>
            <h3 className='font-medium text-gray-800 mb-3'>
              Uploaded Plants ({uploadedPlants.length})
            </h3>

            <div className='space-y-2'>
              {uploadedPlants.map(plant => (
                <div
                  key={plant.id}
                  className='flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50'
                >
                  <div className='flex items-center space-x-3'>
                    <CheckCircle className='h-5 w-5 text-green-500' />
                    <div>
                      <p className='font-medium'>{plant.name}</p>
                      <p className='text-sm text-gray-500'>
                        Code: {plant.code}
                      </p>
                      {plant.location && (
                        <p className='text-xs text-gray-400'>
                          📍 {plant.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center space-x-1'>
                    {/* Open in Takeoff */}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => openInTakeoff(plant)}
                      className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700'
                      title='Open in Takeoff'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>

                    {/* Three dots menu */}
                    <div className='relative group'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0 text-gray-600 hover:text-gray-700'
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>

                      {/* Dropdown Menu */}
                      <div className='absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                        <div className='py-1'>
                          <button
                            onClick={() => editPlant(plant)}
                            className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
                          >
                            <Edit className='h-4 w-4' />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => adjustLocation(plant)}
                            className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
                          >
                            <MapPin className='h-4 w-4' />
                            <span>Adjust Location</span>
                          </button>
                          <button
                            onClick={() => removePlant(plant.id)}
                            className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2'
                          >
                            <Trash2 className='h-4 w-4' />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlantsUpload;
