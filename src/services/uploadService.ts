// ============================================================================
// SERVIÇO DE UPLOAD UNIFICADO - FRONTEND
// ============================================================================

import { API_CONFIG } from '../config/api';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface PlantUploadData {
  name: string;
  code: string;
  description?: string;
  project_id?: number;
  status?: string;
}

export interface TakeoffUploadData {
  projectId: number;
}

export class UploadService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  // ============================================================================
  // UPLOAD DE PLANTAS
  // ============================================================================

       async uploadPlant(
    file: File,
    data: PlantUploadData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const maxRetries = 3;
    let lastError: any;

    // Para arquivos grandes (>5MB), usar upload em chunks
    if (file.size > 5 * 1024 * 1024) {
      console.log(`📦 Arquivo grande detectado (${(file.size / (1024 * 1024)).toFixed(2)}MB), usando upload em chunks`);
      return this.uploadLargeFile(file, data, onProgress);
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} de upload`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', data.name);
        formData.append('code', data.code);
        
        if (data.description) {
          formData.append('description', data.description);
        }
        
        if (data.project_id) {
          formData.append('project_id', data.project_id.toString());
        }
        
        if (data.status) {
          formData.append('status', data.status);
        }

        // Usar endpoint relativo para aproveitar o proxy do Vite
        const response = await this.makeUploadRequest(
          '/api/upload/plants',
          formData,
          onProgress
        );

        if (response.success) {
          console.log(`✅ Upload concluído com sucesso na tentativa ${attempt}`);
          return response;
        } else {
          lastError = response.error;
          console.warn(`⚠️ Tentativa ${attempt} falhou:`, response.error);
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ Erro na tentativa ${attempt}:`, error);
      }

      // Aguardar antes da próxima tentativa (exponencial backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 1s, 2s, 4s, max 5s
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error(`❌ Todas as ${maxRetries} tentativas falharam`);
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : 'Erro após múltiplas tentativas'
    };
  }

  // ============================================================================
  // UPLOAD DE ARQUIVOS GRANDES EM CHUNKS
  // ============================================================================

  private async uploadLargeFile(
    file: File,
    data: PlantUploadData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      const chunkSize = 1024 * 1024; // 1MB por chunk
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;
      let totalUploaded = 0;

      console.log(`📦 Iniciando upload em ${totalChunks} chunks de ${(chunkSize / (1024 * 1024)).toFixed(2)}MB`);

      // Primeiro, criar sessão de upload
      const sessionResponse = await this.createUploadSession(file, data);
      if (!sessionResponse.success) {
        return sessionResponse;
      }

      const sessionId = sessionResponse.data.sessionId;

      // Upload dos chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const chunkResponse = await this.uploadChunk(chunk, chunkIndex, totalChunks, sessionId);
        if (!chunkResponse.success) {
          console.error(`❌ Falha no chunk ${chunkIndex + 1}/${totalChunks}`);
          return chunkResponse;
        }

        uploadedChunks++;
        totalUploaded += chunk.size;

        // Atualizar progresso
        if (onProgress) {
          const progress: UploadProgress = {
            loaded: totalUploaded,
            total: file.size,
            percentage: Math.round((totalUploaded / file.size) * 100)
          };
          onProgress(progress);
        }

        console.log(`📦 Chunk ${chunkIndex + 1}/${totalChunks} enviado (${(totalUploaded / (1024 * 1024)).toFixed(2)}MB/${(file.size / (1024 * 1024)).toFixed(2)}MB)`);

        // Pequena pausa entre chunks para estabilidade
        if (chunkIndex < totalChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Finalizar upload
      const finalizeResponse = await this.finalizeUpload(sessionId);
      if (!finalizeResponse.success) {
        return finalizeResponse;
      }

      console.log(`✅ Upload em chunks concluído com sucesso`);
      return {
        success: true,
        message: 'Upload em chunks concluído com sucesso',
        data: finalizeResponse.data
      };

    } catch (error) {
      console.error('❌ Erro no upload em chunks:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no upload em chunks'
      };
    }
  }

  private async createUploadSession(file: File, data: PlantUploadData): Promise<UploadResponse> {
    try {
      const response = await fetch('/api/upload/session', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          type: 'plants',
          metadata: data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(' Erro ao criar sessão de upload:', error);
      return {
        success: false,
        error: 'Erro ao criar sessão de upload'
      };
    }
  }

  private async uploadChunk(
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    sessionId: string
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(' Erro ao enviar chunk:', error);
      return {
        success: false,
        error: 'Erro ao enviar chunk'
      };
    }
  }

  private async finalizeUpload(sessionId: string): Promise<UploadResponse> {
    try {
      const response = await fetch('/api/upload/finalize', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(' Erro ao finalizar upload:', error);
      return {
        success: false,
        error: 'Erro ao finalizar upload'
      };
    }
  }

  // ============================================================================
  // UPLOAD DE TAKEOFF
  // ============================================================================

  async uploadTakeoff(
    file: File,
    data: TakeoffUploadData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.makeUploadRequest(
        `/api/upload/takeoff/${data.projectId}`,
        formData,
        onProgress
      );

      return response;
    } catch (error) {
      console.error('❌ Erro no upload de takeoff:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ============================================================================
  // UPLOAD GENÉRICO
  // ============================================================================

  async uploadFile(
    file: File,
    type: 'plants' | 'takeoff',
    metadata: any,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Adicionar metadados específicos do tipo
      if (type === 'plants') {
        formData.append('name', metadata.name);
        formData.append('code', metadata.code);
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.project_id) formData.append('project_id', metadata.project_id.toString());
        if (metadata.status) formData.append('status', metadata.status);
      } else if (type === 'takeoff') {
        // Para takeoff, o projectId vai na URL
      }

      const endpoint = type === 'plants' ? '/api/upload/plants' : `/api/upload/takeoff/${metadata.projectId}`;
      
      const response = await this.makeUploadRequest(endpoint, formData, onProgress);
      return response;
    } catch (error) {
      console.error('❌ Erro no upload genérico:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ============================================================================
  // UPLOAD COM DETECÇÃO AUTOMÁTICA
  // ============================================================================

  async uploadWithAutoDetection(
    file: File,
    metadata: any,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Adicionar todos os metadados disponíveis
      Object.keys(metadata).forEach(key => {
        if (metadata[key] !== undefined && metadata[key] !== null) {
          formData.append(key, metadata[key].toString());
        }
      });

      const response = await this.makeUploadRequest(
        '/api/upload/file',
        formData,
        onProgress
      );

      return response;
    } catch (error) {
      console.error('❌ Erro no upload com detecção automática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  private async makeUploadRequest(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // Usar endpoint relativo para aproveitar o proxy do Vite
      const url = endpoint.startsWith('http') ? endpoint : endpoint;

             // Configurar progresso
       if (onProgress) {
         xhr.upload.addEventListener('progress', (event) => {
           if (event.lengthComputable) {
             const progress: UploadProgress = {
               loaded: event.loaded,
               total: event.total,
               percentage: Math.round((event.loaded / event.total) * 100)
             };
             console.log(`📤 Upload progresso: ${progress.percentage}% (${progress.loaded}/${progress.total} bytes)`);
             onProgress(progress);
           }
         });
       }

               // Heartbeat para manter conexão ativa durante uploads longos
        let heartbeatInterval: NodeJS.Timeout;
        // Verificar se o arquivo é grande baseado no FormData
        const fileSize = formData.get('file') instanceof File ? (formData.get('file') as File).size : 0;
        if (fileSize > 10 * 1024 * 1024) { // Para arquivos > 10MB
          heartbeatInterval = setInterval(() => {
            if (xhr.readyState === XMLHttpRequest.OPENED || xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
              console.log('💓 Heartbeat: Mantendo conexão ativa...');
            }
          }, 30000); // A cada 30 segundos
        }

             // Configurar resposta
       xhr.addEventListener('load', () => {
         // Limpar heartbeat
         if (heartbeatInterval) {
           clearInterval(heartbeatInterval);
         }
         
         console.log(`📥 Upload concluído com status: ${xhr.status}`);
         if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve({
              success: true,
              message: 'Upload realizado com sucesso',
              data: { responseText: xhr.responseText }
            });
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            resolve({
              success: false,
              error: errorResponse.error || errorResponse.message || `Erro HTTP ${xhr.status}`,
              data: errorResponse
            });
          } catch (error) {
            resolve({
              success: false,
              error: `Erro HTTP ${xhr.status}: ${xhr.statusText}`
            });
          }
        }
      });

             // Configurar erro
       xhr.addEventListener('error', (event) => {
         // Limpar heartbeat
         if (heartbeatInterval) {
           clearInterval(heartbeatInterval);
         }
         
         console.error('❌ XMLHttpRequest error:', event);
         
         // Detectar tipo específico de erro
         let errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
         
         if (event.type === 'error') {
           if (xhr.status === 0) {
             errorMessage = 'Conexão interrompida. Verifique sua conexão de internet.';
           } else if (xhr.status >= 400) {
             errorMessage = `Erro HTTP ${xhr.status}: ${xhr.statusText}`;
           }
         }
         
         resolve({
           success: false,
           error: errorMessage
         });
       });

             // Configurar timeout
       xhr.addEventListener('timeout', () => {
         // Limpar heartbeat
         if (heartbeatInterval) {
           clearInterval(heartbeatInterval);
         }
         
         console.error('❌ XMLHttpRequest timeout após', xhr.timeout, 'ms');
         resolve({
           success: false,
           error: 'Timeout na requisição. Verifique sua conexão.'
         });
       });

                    // Configurar timeout
       xhr.timeout = 600000; // 10 minutos para uploads grandes

               // Configurações adicionais para estabilidade
        xhr.withCredentials = true; // Incluir cookies na requisição
        
        // Configurações para uploads grandes
        xhr.responseType = 'json';
        
        // ABRIR conexão PRIMEIRO
        xhr.open('POST', url);
      
      // Configurar headers de autenticação APÓS abrir a conexão
      const token = localStorage.getItem('devco-token') || localStorage.getItem('devco-test-session');
      if (token) {
        if (token.includes('.') || token.length > 100) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        } else {
          xhr.setRequestHeader('X-Devco-Session', token);
        }
      }

      // Enviar requisição
      xhr.send(formData);
    });
  }

  // ============================================================================
  // VERIFICAÇÃO DE ARQUIVOS
  // ============================================================================

  async checkFileStatus(filename: string, type: 'plants' | 'takeoff'): Promise<any> {
    try {
      const response = await fetch(`/api/upload/status/${type}/${filename}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(' Erro ao verificar status do arquivo:', error);
      throw error;
    }
  }

  async listFiles(type: 'plants' | 'takeoff'): Promise<any> {
    try {
      const response = await fetch(`/api/upload/files/${type}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(' Erro ao listar arquivos:', error);
      throw error;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('devco-token') || localStorage.getItem('devco-test-session');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      if (token.includes('.') || token.length > 100) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['X-Devco-Session'] = token;
      }
    }
    
    return headers;
  }

  // ============================================================================
  // VALIDAÇÕES
  // ============================================================================

  validateFile(file: File, type: 'plants' | 'takeoff'): { valid: boolean; error?: string } {
    // Validar tamanho
    const maxSize = type === 'plants' ? 50 * 1024 * 1024 : 200 * 1024 * 1024; // 50MB para plantas, 200MB para takeoff
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo para ${type}: ${maxSize / (1024 * 1024)}MB`
      };
    }

    // Validar tipo
    if (type === 'plants') {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/tiff',
        'image/bmp',
        'application/dwg',
        'application/dxf'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: 'Tipo de arquivo não suportado para plantas. Use PDF, imagens ou arquivos CAD.'
        };
      }
    } else {
      if (file.type !== 'application/pdf') {
        return {
          valid: false,
          error: 'Para takeoff, apenas arquivos PDF são permitidos.'
        };
      }
    }

    return { valid: true };
  }
}

// Instância singleton
export const uploadService = new UploadService();
