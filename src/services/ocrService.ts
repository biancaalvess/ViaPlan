import { API_CONFIG } from '../config/api';

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  processingTime: number;
  extractedSheetId?: string;
  extractedScale?: string;
  filename?: string;
  fileSize?: number;
  error?: string;
}

export interface OCRProcessingOptions {
  language?: string;
  quality?: 'fast' | 'accurate';
  enableCache?: boolean;
}

export interface BatchOCRResult {
  processed: Array<{
    filename: string;
    text: string;
    confidence: number;
    processingTime: number;
    extractedSheetId?: string;
    extractedScale?: string;
    fileSize: number;
  }>;
  errors: Array<{
    filename: string;
    error: string;
  }>;
  totalFiles: number;
  successful: number;
  failed: number;
}

export interface OCRStatus {
  status: 'active' | 'inactive';
  cacheSize: number;
  timestamp: string;
}

class OCRService {
  private baseUrl = '/api/ocr';

  /**
   * Process OCR on uploaded file
   */
  async processFile(
    file: File,
    options: OCRProcessingOptions = {}
  ): Promise<OCRResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.language) {
        formData.append('language', options.language);
      }
      if (options.quality) {
        formData.append('quality', options.quality);
      }
      if (options.enableCache !== undefined) {
        formData.append('enableCache', options.enableCache.toString());
      }

      const response = await api.post(`${this.baseUrl}/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('OCR processing error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        processingTime: 0,
        error: error.response?.data?.error || error.message || 'OCR processing failed',
      };
    }
  }

  /**
   * Process OCR on existing file by path
   */
  async processByPath(
    filePath: string,
    options: OCRProcessingOptions = {}
  ): Promise<OCRResult> {
    try {
      const response = await api.post(`${this.baseUrl}/process-path`, {
        filePath,
        ...options,
      });

      return response.data;
    } catch (error: any) {
      console.error('OCR processing by path error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        processingTime: 0,
        error: error.response?.data?.error || error.message || 'OCR processing failed',
      };
    }
  }

  /**
   * Batch process multiple files
   */
  async processBatch(
    files: File[],
    options: OCRProcessingOptions = {}
  ): Promise<{ success: boolean; data?: BatchOCRResult; error?: string }> {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      if (options.language) {
        formData.append('language', options.language);
      }
      if (options.quality) {
        formData.append('quality', options.quality);
      }
      if (options.enableCache !== undefined) {
        formData.append('enableCache', options.enableCache.toString());
      }

      const response = await api.post(`${this.baseUrl}/batch`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Batch OCR processing error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Batch OCR processing failed',
      };
    }
  }

  /**
   * Get OCR service status
   */
  async getStatus(): Promise<{ success: boolean; data?: OCRStatus; error?: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/status`);
      return response.data;
    } catch (error: any) {
      console.error('OCR status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to get OCR status',
      };
    }
  }

  /**
   * Initialize OCR service
   */
  async initialize(options: OCRProcessingOptions = {}): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/initialize`, options);
      return response.data;
    } catch (error: any) {
      console.error('OCR initialization error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to initialize OCR service',
      };
    }
  }

  /**
   * Clear OCR cache
   */
  async clearCache(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete(`${this.baseUrl}/cache`);
      return response.data;
    } catch (error: any) {
      console.error('OCR cache clear error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to clear OCR cache',
      };
    }
  }

  /**
   * Terminate OCR service
   */
  async terminate(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await api.delete(`${this.baseUrl}/terminate`);
      return response.data;
    } catch (error: any) {
      console.error('OCR termination error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to terminate OCR service',
      };
    }
  }

  /**
   * Extract sheet ID from text using regex
   */
  extractSheetId(text: string): string | null {
    const match = text.match(/(?:Sheet\s+)?([A-Z]\d+(?:\.\d+)?)/i);
    return match ? match[1] : null;
  }

  /**
   * Extract scale from text using regex
   */
  extractScale(text: string): string | null {
    const match = text.match(/(?:Scale\s+)?(\d+:\d+)/i);
    return match ? match[1] : null;
  }

  /**
   * Extract references from text using regex
   */
  extractReferences(text: string): string[] {
    const regex = /(?:See sheet|Veja folha|Referência|Reference)\s+([A-Z]\d+(?:\.\d+)?)/gi;
    const refs: string[] = [];
    let match;
    
    while ((match = regex.exec(text))) {
      if (!refs.includes(match[1])) {
        refs.push(match[1]);
      }
    }
    
    return refs;
  }

  /**
   * Analyze OCR text and extract structured information
   */
  analyzeOCRText(text: string): {
    sheetId: string | null;
    scale: string | null;
    references: string[];
    category: string;
    confidence: 'high' | 'medium' | 'low';
  } {
    const sheetId = this.extractSheetId(text);
    const scale = this.extractScale(text);
    const references = this.extractReferences(text);
    
    // Determine category based on text content
    let category = 'Geral';
    if (text.toLowerCase().includes('elétrica') || text.toLowerCase().includes('electrical')) {
      category = 'Elétrica';
    } else if (text.toLowerCase().includes('hidráulica') || text.toLowerCase().includes('hydraulic')) {
      category = 'Hidráulica';
    } else if (text.toLowerCase().includes('estrutural') || text.toLowerCase().includes('structural')) {
      category = 'Estrutural';
    } else if (text.toLowerCase().includes('arquitetura') || text.toLowerCase().includes('architecture')) {
      category = 'Arquitetura';
    }
    
    // Determine confidence based on extracted information
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (sheetId && scale && references.length > 0) {
      confidence = 'high';
    } else if (sheetId || scale || references.length > 0) {
      confidence = 'medium';
    }
    
    return {
      sheetId,
      scale,
      references,
      category,
      confidence,
    };
  }
}

export const ocrService = new OCRService();
export default ocrService;
