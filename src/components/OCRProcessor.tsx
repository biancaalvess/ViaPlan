import Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  timestamp: Date;
  error?: string;
}

export interface OCRProcessingOptions {
  language?: string;
  quality?: 'fast' | 'accurate';
  enableCache?: boolean;
}

class OCRProcessor {
  private worker: Tesseract.Worker | null = null;
  private cache = new Map<string, OCRResult>();
  private processingQueue: Map<string, Promise<OCRResult>> = new Map();
  private isInitialized = false;

  async initialize(options: OCRProcessingOptions = {}) {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker({
        logger: m => {
          if (m.status === 'initializing tesseract') {
            console.log('Initializing OCR engine...');
          }
        }
      });

      await this.worker.loadLanguage(options.language || 'eng');
      await this.worker.initialize(options.language || 'eng');
      
      if (options.quality === 'accurate') {
        await this.worker.setParameters({
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,()-_/\\',
        });
      }

      this.isInitialized = true;
      console.log('OCR Processor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR processor:', error);
      throw error;
    }
  }

  async processImage(
    imageData: ImageData | HTMLCanvasElement | HTMLImageElement | File,
    options: OCRProcessingOptions = {}
  ): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize(options);
    }

    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(imageData, options);

    // Check cache first
    if (options.enableCache !== false && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      console.log('OCR result retrieved from cache');
      return cached;
    }

    // Check if already processing
    if (this.processingQueue.has(cacheKey)) {
      console.log('OCR already processing this image, waiting...');
      return await this.processingQueue.get(cacheKey)!;
    }

    // Create processing promise
    const processingPromise = this.performOCR(imageData, options, startTime);
    this.processingQueue.set(cacheKey, processingPromise);

    try {
      const result = await processingPromise;
      
      // Cache the result
      if (options.enableCache !== false) {
        this.cache.set(cacheKey, result);
        this.cleanupCache();
      }

      return result;
    } finally {
      this.processingQueue.delete(cacheKey);
    }
  }

  private async performOCR(
    imageData: ImageData | HTMLCanvasElement | HTMLImageElement | File,
    options: OCRProcessingOptions,
    startTime: number
  ): Promise<OCRResult> {
    try {
      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      const result = await this.worker.recognize(imageData);
      const processingTime = Date.now() - startTime;

      const ocrResult: OCRResult = {
        text: result.data.text,
        confidence: result.data.confidence,
        processingTime,
        timestamp: new Date()
      };

      console.log(`OCR completed in ${processingTime}ms with confidence: ${result.data.confidence}%`);
      return ocrResult;

    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateCacheKey(
    imageData: ImageData | HTMLCanvasElement | HTMLImageElement | File,
    options: OCRProcessingOptions
  ): string {
    if (imageData instanceof File) {
      return `${imageData.name}_${imageData.size}_${imageData.lastModified}_${options.language || 'eng'}_${options.quality || 'fast'}`;
    }
    
    // For other types, use a hash of the data
    const dataString = JSON.stringify({
      type: imageData.constructor.name,
      options: options
    });
    return btoa(dataString).slice(0, 32);
  }

  private cleanupCache() {
    const maxCacheSize = 100;
    if (this.cache.size > maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime());
      
      // Remove oldest entries
      const toRemove = entries.slice(maxCacheSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
      console.log(`Cleaned up ${toRemove.length} cached OCR results`);
    }
  }

  async processBatch(
    images: (ImageData | HTMLCanvasElement | HTMLImageElement | File)[],
    options: OCRProcessingOptions = {}
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];
    const batchSize = 3; // Process 3 images concurrently

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const batchPromises = batch.map(image => this.processImage(image, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to process image ${i + index}:`, result.reason);
          // Add error result
          results.push({
            text: '',
            confidence: 0,
            processingTime: 0,
            timestamp: new Date(),
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
          });
        }
      });

      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < images.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      this.cache.clear();
      this.processingQueue.clear();
      console.log('OCR Processor terminated');
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      queueSize: this.processingQueue.size,
      isInitialized: this.isInitialized
    };
  }

  clearCache() {
    this.cache.clear();
    console.log('OCR cache cleared');
  }
}

// Export singleton instance
export const ocrProcessor = new OCRProcessor();

// Export the class for testing
export { OCRProcessor as OCRProcessorClass };
