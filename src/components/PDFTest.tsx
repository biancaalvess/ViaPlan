import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const PDFTest: React.FC = () => {
  const [pdfjsVersion, setPdfjsVersion] = useState<string>('');
  const [workerSrc, setWorkerSrc] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testPDFJS = async () => {
    try {
      setError('');

      // Importar PDF.js dinamicamente
      const pdfjsLib = await import('pdfjs-dist');

      // Configurar worker do CDN com versão dinâmica
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      setPdfjsVersion(pdfjsLib.version);
      setWorkerSrc(pdfjsLib.GlobalWorkerOptions.workerSrc);

      console.log('✅ PDF.js configurado com sucesso');
      console.log('📄 Versão:', pdfjsLib.version);
      console.log('🔧 Worker:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    } catch (err) {
      setError(`Erro ao configurar PDF.js: ${err}`);
      console.error(' Erro ao configurar PDF.js:', err);
    }
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Teste do PDF.js</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button onClick={testPDFJS} className='w-full'>
          Testar Configuração do PDF.js
        </Button>

        {pdfjsVersion && (
          <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-sm text-green-800'>
              <strong>Versão:</strong> {pdfjsVersion}
            </p>
            <p className='text-sm text-green-800'>
              <strong>Worker:</strong> {workerSrc}
            </p>
          </div>
        )}

        {error && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
