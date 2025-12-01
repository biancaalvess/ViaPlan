// ============================================================================
// SERVIÇO DE API ROBUSTO COM FALLBACK E RETRY
// ============================================================================

import { API_CONFIG, getAuthHeaders } from '../config/api';

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isServerError?: boolean;
}

class ApiService {
  private baseURL: string;
  private isOffline: boolean = false;
  private defaultTimeout: number = 10000;
  private defaultRetries: number = 2;
  private defaultRetryDelay: number = 1000;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.baseURL;
    console.log(`🚀 ApiService inicializado com baseURL: ${this.baseURL}`);
  }

  /**
   * Fazer requisição HTTP com retry automático e fallback
   */
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      skipAuth = false,
      ...requestOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...requestOptions.headers as Record<string, string>
    };

    // Adicionar headers de autenticação se necessário
    if (!skipAuth) {
      const authHeaders = getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    // Log apenas em desenvolvimento e para requisições importantes
    if (import.meta.env.DEV && !url.includes('/stats')) {
      console.log(`📡 Fazendo requisição: ${requestOptions.method || 'GET'} ${url}`);
    }

    let lastError: ApiError | null = null;

    // Tentar a requisição com retry
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.makeRequest(url, {
          ...requestOptions,
          headers
        }, timeout);

        // Sucesso - resetar status offline
        this.isOffline = false;
        
        const data = await this.parseResponse<T>(response);
        
        if (attempt > 0) {
          console.log(`✅ Requisição bem-sucedida após ${attempt} tentativas`);
        }
        
        return data;

      } catch (error) {
        lastError = this.createApiError(error);
        
        // Log apenas se não for erro de conexão ou se for a última tentativa
        if (!lastError.isNetworkError || attempt === retries) {
          console.warn(`⚠️ Tentativa ${attempt + 1}/${retries + 1} falhou:`, lastError.message);
        }

        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt); // Backoff exponencial
          // Log apenas em desenvolvimento
          if (import.meta.env.DEV && !lastError.isNetworkError) {
            console.log(`⏰ Aguardando ${delay}ms antes da próxima tentativa...`);
          }
          await this.sleep(delay);
        }
      }
    }

    // Todas as tentativas falharam
    this.isOffline = true;
    
    // Log apenas se não for erro de conexão (para não poluir o console)
    if (!lastError?.isNetworkError) {
      console.error(`❌ Todas as tentativas falharam para ${url}`);
    }
    
    throw lastError;
  }

  /**
   * Fazer requisição GET
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Fazer requisição POST
   */
  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * Fazer requisição PUT
   */
  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * Fazer requisição DELETE
   */
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload de arquivo
   */
  async upload<T>(endpoint: string, formData: FormData, options?: ApiRequestOptions): Promise<T> {
    const uploadOptions = { ...options };
    
    // Remover Content-Type para FormData (o browser define automaticamente)
    if (uploadOptions.headers) {
      const headers = { ...uploadOptions.headers } as Record<string, string>;
      delete headers['Content-Type'];
      uploadOptions.headers = headers;
    }

    return this.request<T>(endpoint, {
      ...uploadOptions,
      method: 'POST',
      body: formData,
      timeout: 300000 // 5 minutos para uploads
    });
  }

  /**
   * Testar conectividade
   */
  async testConnectivity(): Promise<{ isConnected: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      await this.request('/health', { 
        skipAuth: true, 
        timeout: 5000,
        retries: 0 
      });
      
      const responseTime = Date.now() - startTime;
      return { isConnected: true, responseTime };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { 
        isConnected: false, 
        responseTime, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  /**
   * Verificar se a API está offline
   */
  isApiOffline(): boolean {
    return this.isOffline;
  }

  /**
   * Forçar status online (útil após reconexão)
   */
  setOnline(): void {
    this.isOffline = false;
    console.log('🟢 Status da API definido como online');
  }

  /**
   * Obter URL base atual
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Atualizar URL base
   */
  setBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
    console.log(`🔄 BaseURL atualizada para: ${this.baseURL}`);
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private async makeRequest(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Se não conseguir fazer parse do JSON, usar mensagem padrão
      }

      const error: ApiError = new Error(errorMessage) as ApiError;
      error.status = response.status;
      error.statusText = response.statusText;
      error.isServerError = response.status >= 500;
      
      throw error;
    }

    try {
      return await response.json();
    } catch (error) {
      // Se a resposta não for JSON válido, retornar como texto
      const text = await response.text();
      return text as unknown as T;
    }
  }

  private createApiError(error: any): ApiError {
    if (error.name === 'AbortError') {
      const apiError: ApiError = new Error('Timeout na requisição') as ApiError;
      apiError.isTimeoutError = true;
      return apiError;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      const apiError: ApiError = new Error('Erro de rede - verifique sua conexão') as ApiError;
      apiError.isNetworkError = true;
      return apiError;
    }

    // Se já é um ApiError, retornar como está
    if (error.status !== undefined) {
      return error as ApiError;
    }

    // Criar novo ApiError
    const apiError: ApiError = new Error(error.message || 'Erro desconhecido') as ApiError;
    return apiError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const apiService = new ApiService();

export default ApiService;