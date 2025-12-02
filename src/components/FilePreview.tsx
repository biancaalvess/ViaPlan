import React, { useState, useEffect } from 'react';
import { X, FileText, Image, File, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  onConfirm: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  onConfirm,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generatePreview();
  }, [file]);

  const generatePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      if (file.type.startsWith('image/')) {
        // Preview de imagem
        const reader = new FileReader();
        reader.onload = e => {
          setPreview(e.target?.result as string);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // Preview de PDF (primeira página)
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');

        // Usar o worker do CDN com versão dinâmica
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context!,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        setPreview(canvas.toDataURL());
        setLoading(false);
      } else {
        // Arquivo não suportado para preview
        setError('Tipo de arquivo não suportado para preview');
        setLoading(false);
      }
    } catch (err) {
      setError('Erro ao gerar preview');
      setLoading(false);
      console.error('Erro ao gerar preview:', err);
    }
  };

  const getFileIcon = () => {
    if (file.type.startsWith('image/'))
      return <Image className='h-8 w-8 text-blue-500' />;
    if (file.type === 'application/pdf')
      return <FileText className='h-8 w-8 text-red-500' />;
    return <File className='h-8 w-8 text-gray-500' />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card className='w-full max-w-md'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center h-32'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          </div>
          <p className='text-center text-sm text-gray-500 mt-2'>
            Gerando preview...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full max-w-md border-red-200'>
        <CardContent className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <AlertCircle className='h-6 w-6 text-red-500' />
            <div>
              <h3 className='font-semibold text-red-700'>Erro no Preview</h3>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          </div>
          <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
            {getFileIcon()}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {file.name}
              </p>
              <p className='text-xs text-gray-500'>
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <div className='flex gap-2 mt-4'>
            <Button variant='outline' onClick={onRemove} className='flex-1'>
              Remove
            </Button>
            <Button onClick={onConfirm} className='flex-1'>
              Confirm Upload
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>File Preview</CardTitle>
          <Button variant='ghost' size='sm' onClick={onRemove}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Preview do arquivo */}
        <div className='border rounded-lg overflow-hidden bg-gray-50'>
          {file.type.startsWith('image/') ? (
            <img
              src={preview!}
              alt={file.name}
              className='w-full h-48 object-cover'
            />
          ) : file.type === 'application/pdf' ? (
            <div className='p-4 text-center'>
              <img
                src={preview!}
                alt='PDF Preview'
                className='mx-auto max-w-full h-48 object-contain'
              />
            </div>
          ) : (
            <div className='p-8 text-center'>
              {getFileIcon()}
              <p className='text-sm text-gray-500 mt-2'>
                Preview not available
              </p>
            </div>
          )}
        </div>

        {/* Informações do arquivo */}
        <div className='space-y-2'>
          <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
            {getFileIcon()}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {file.name}
              </p>
              <p className='text-xs text-gray-500'>
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            <Badge variant='secondary' className='text-xs'>
              {file.type || 'Unknown type'}
            </Badge>
            <Badge variant='outline' className='text-xs'>
              {file.lastModified
                ? new Date(file.lastModified).toLocaleDateString('pt-BR')
                : 'Unknown date'}
            </Badge>
          </div>
        </div>

        {/* Ações */}
        <div className='flex gap-2'>
          <Button variant='outline' onClick={onRemove} className='flex-1'>
            Remove
          </Button>
          <Button onClick={onConfirm} className='flex-1'>
            Confirm Upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
