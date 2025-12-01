import React from 'react';
import { FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FileStatusIndicatorProps {
  fileName: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

const FileStatusIndicator: React.FC<FileStatusIndicatorProps> = ({
  fileName,
  status,
  progress,
  error,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Loader2 className='h-3 w-3 animate-spin text-red-500' />;
      case 'processing':
        return <Loader2 className='h-3 w-3 animate-spin text-red-500' />;
      case 'completed':
        return <CheckCircle className='h-3 w-3 text-green-500' />;
      case 'error':
        return <AlertCircle className='h-3 w-3 text-red-500' />;
      default:
        return <FileText className='h-3 w-3 text-gray-400' />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'text-red-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className='flex items-center space-x-2 p-2 bg-gray-50 rounded-md border border-gray-200'>
      {getStatusIcon()}

      <div className='flex-1 min-w-0'>
        <span className='text-xs text-gray-600 max-w-32 truncate block'>
          {fileName}
        </span>

        {status === 'error' && error && (
          <span className='text-xs text-red-500 block truncate'>{error}</span>
        )}
      </div>

      {/* Barra de progresso discreta */}
      {status !== 'completed' && status !== 'error' && (
        <div className='w-12 bg-gray-200 rounded-full h-1'>
          <div
            className='bg-red-500 h-1 rounded-full transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Porcentagem discreta */}
      {status !== 'completed' && status !== 'error' && (
        <span className='text-xs text-gray-500 w-8 text-right'>
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

export default FileStatusIndicator;
