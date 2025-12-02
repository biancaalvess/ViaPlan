import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
// Import PDF.js with stable configuration
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker to use CDN with dynamic version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PDFUploadProps {
  projectId?: number;
  onUploadComplete?: (imageUrl: string, pages?: PDFPage[]) => void;
  onFileSelect?: (fileUrl: string) => void; // Nova prop para seleção de arquivo
}

import { UploadProgress, PDFPage } from '../types/upload';

const PDFUpload: React.FC<PDFUploadProps> = ({
  projectId = 1,
  onUploadComplete,
  onFileSelect,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const processPDF = async (file: File, fileName: string) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Load PDF document
      const pdf = await pdfjsLib.getDocument({
        data: uint8Array,
      }).promise;

      const totalPages = pdf.numPages;
      const pages: PDFPage[] = [];

      // Process all pages
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageUrl = canvas.toDataURL('image/png');

          pages.push({
            pageNumber: pageNum,
            imageUrl: imageUrl,
            width: viewport.width,
            height: viewport.height,
            scale: 1.5,
            url: imageUrl,
          });
        }
      }

      // Pass the first page as default and all pages
      if (onUploadComplete) {
        onUploadComplete(pages[0]?.imageUrl || '', pages);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {
        // Para takeoff, criar URL do objeto blob imediatamente
        if (onFileSelect && file.type === 'application/pdf') {
          setIsUploading(true);
          try {
            const fileUrl = URL.createObjectURL(file);
            onFileSelect(fileUrl);
            console.log('PDF carregado com sucesso:', file.name);
          } catch (error) {
            console.error('Erro ao processar PDF:', error);
          } finally {
            setIsUploading(false);
          }
          return;
        }

        // Para outros casos, usar o processamento completo
        if (onUploadComplete) {
          processPDF(file, file.name);
        }
      });
    },
    [projectId, onFileSelect, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  return (
    <div className='w-full max-w-full'>
      {/* Botão de upload - sempre visível */}
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
          {isUploading
            ? 'Carregando...'
            : isDragActive
              ? 'Solte o PDF aqui...'
              : 'Upload'}
        </Button>
      </div>

      {/* Progresso dos uploads - minimizável */}
      {/* The progress bar and upload list are removed as per the simplified component */}
    </div>
  );
};

export default PDFUpload;
