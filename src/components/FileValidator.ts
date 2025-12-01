export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileSize: number;
  fileType: string;
  securityScore: number;
  processingTime: number;
}

export interface ValidationOptions {
  maxSizeMB: number;
  allowedTypes: string[];
  validateContent: boolean;
  enableVirusScan: boolean;
  maxFilesPerMinute: number;
  requireSanitization: boolean;
}

export class FileValidator {
  private static uploadHistory = new Map<string, number[]>();
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute

  static validateFiles(files: File[], options: ValidationOptions): FileValidationResult[] {
    const startTime = Date.now();
    
    return files.map(file => {
      const result = this.validateFile(file, options);
      result.processingTime = Date.now() - startTime;
      return result;
    });
  }

  static validateFile(file: File, options: ValidationOptions): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let securityScore = 100;

    // Basic file validation
    if (!this.validateFileSize(file, options.maxSizeMB)) {
      errors.push(`Tamanho do arquivo excede o limite de ${options.maxSizeMB}MB`);
      securityScore -= 20;
    }

    if (!this.validateFileType(file, options.allowedTypes)) {
      errors.push('Tipo de arquivo não permitido');
      securityScore -= 30;
    }

    if (!this.validateFileName(file)) {
      errors.push('Nome do arquivo contém caracteres inválidos');
      securityScore -= 15;
    }

    // Rate limiting
    if (!this.checkRateLimit(file.name)) {
      errors.push('Muitos uploads em pouco tempo. Aguarde um momento.');
      securityScore -= 25;
    }

    // Content validation
    if (options.validateContent) {
      const contentValidation = this.validateFileContent(file);
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors);
        securityScore -= contentValidation.securityPenalty;
      }
      if (contentValidation.warnings.length > 0) {
        warnings.push(...contentValidation.warnings);
        securityScore -= contentValidation.warningPenalty;
      }
    }

    // Virus scan simulation
    if (options.enableVirusScan) {
      const virusScanResult = this.simulateVirusScan(file);
      if (!virusScanResult.isClean) {
        errors.push('Arquivo suspeito detectado');
        securityScore -= 40;
      }
    }

    // Security score adjustments
    if (securityScore < 0) securityScore = 0;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileSize: file.size,
      fileType: file.type,
      securityScore,
      processingTime: 0
    };
  }

  private static validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  private static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type) || 
           allowedTypes.some(type => file.name.toLowerCase().endsWith(type.split('/')[1]));
  }

  private static validateFileName(file: File): boolean {
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    const invalidNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    
    const fileName = file.name.toUpperCase();
    const nameWithoutExt = fileName.split('.')[0];
    
    return !invalidChars.test(file.name) && 
           !invalidNames.includes(nameWithoutExt) &&
           file.name.length <= 255;
  }

  private static checkRateLimit(fileName: string): boolean {
    const now = Date.now();
    const userKey = this.getUserKey(); // In real app, get from auth context
    
    if (!this.uploadHistory.has(userKey)) {
      this.uploadHistory.set(userKey, []);
    }
    
    const userHistory = this.uploadHistory.get(userKey)!;
    
    // Remove old entries outside the window
    const recentUploads = userHistory.filter(timestamp => now - timestamp < this.RATE_LIMIT_WINDOW);
    
    if (recentUploads.length >= 10) { // Max 10 files per minute
      return false;
    }
    
    // Add current upload
    recentUploads.push(now);
    this.uploadHistory.set(userKey, recentUploads);
    
    return true;
  }

  private static getUserKey(): string {
    // In a real application, this would get the user ID from authentication context
    // TODO: Implementar chave real de usuário quando disponível
    return 'user-123';
  }

  private static validateFileContent(file: File): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    securityPenalty: number;
    warningPenalty: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let securityPenalty = 0;
    let warningPenalty = 0;

    // Check for suspicious file patterns
    if (file.type === 'application/pdf') {
      const pdfValidation = this.validatePDFContent(file);
      if (!pdfValidation.isValid) {
        errors.push(...pdfValidation.errors);
        securityPenalty += pdfValidation.securityPenalty;
      }
    }

    // Check for executable content in text files
    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const textValidation = this.validateTextContent(file);
      if (!textValidation.isValid) {
        errors.push(...textValidation.errors);
        securityPenalty += textValidation.securityPenalty;
      }
    }

    // Check for image metadata
    if (file.type.startsWith('image/')) {
      const imageValidation = this.validateImageContent(file);
      if (!imageValidation.isValid) {
        warnings.push(...imageValidation.warnings);
        warningPenalty += imageValidation.warningPenalty;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      securityPenalty,
      warningPenalty
    };
  }

  private static validatePDFContent(file: File): {
    isValid: boolean;
    errors: string[];
    securityPenalty: number;
  } {
    const errors: string[] = [];
    let securityPenalty = 0;

    // Check file size for potential PDF bombs
    if (file.size > 50 * 1024 * 1024) { // 50MB
      errors.push('PDF muito grande - possível PDF bomb');
      securityPenalty += 25;
    }

    // Check for suspicious PDF features (would need actual PDF parsing in real implementation)
    // For now, we'll simulate some checks
    if (file.name.toLowerCase().includes('suspicious')) {
      errors.push('Nome do arquivo suspeito');
      securityPenalty += 15;
    }

    return {
      isValid: errors.length === 0,
      errors,
      securityPenalty
    };
  }

  private static validateTextContent(file: File): {
    isValid: boolean;
    errors: string[];
    securityPenalty: number;
  } {
    const errors: string[] = [];
    let securityPenalty = 0;

    // Check for executable content patterns
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /document\./gi,
      /window\./gi
    ];

    // In a real implementation, you would read the file content and check for these patterns
    // For now, we'll simulate the check
    if (file.name.toLowerCase().includes('script')) {
      errors.push('Arquivo de texto contém conteúdo suspeito');
      securityPenalty += 20;
    }

    return {
      isValid: errors.length === 0,
      errors,
      securityPenalty
    };
  }

  private static validateImageContent(file: File): {
    isValid: boolean;
    warnings: string[];
    warningPenalty: number;
  } {
    const warnings: string[] = [];
    let warningPenalty = 0;

    // Check for very large images
    if (file.size > 10 * 1024 * 1024) { // 10MB
      warnings.push('Imagem muito grande - pode causar problemas de performance');
      warningPenalty += 10;
    }

    // Check for unusual aspect ratios
    // In a real implementation, you would check the actual image dimensions
    if (file.name.toLowerCase().includes('wide')) {
      warnings.push('Imagem com proporção incomum');
      warningPenalty += 5;
    }

    return {
      isValid: true,
      warnings,
      warningPenalty
    };
  }

  private static simulateVirusScan(file: File): { isClean: boolean } {
    // Simulate virus scan with random results
    // In a real implementation, this would integrate with an antivirus service
    const suspiciousNames = ['virus', 'malware', 'trojan', 'backdoor', 'keylogger'];
    const fileName = file.name.toLowerCase();
    
    const isSuspicious = suspiciousNames.some(name => fileName.includes(name));
    
    // 99.9% of files should pass (realistic virus detection rate)
    const randomCheck = Math.random() > 0.001;
    
    return {
      isClean: !isSuspicious && randomCheck
    };
  }

  static sanitizeFileName(fileName: string): string {
    // Remove or replace dangerous characters
    return fileName
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .substring(0, 255);
  }

  static sanitizeTextContent(text: string): string {
    // Remove potentially dangerous HTML/script content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/eval\s*\(/gi, '')
      .trim();
  }

  static getValidationStats(): {
    totalValidations: number;
    averageSecurityScore: number;
    rateLimitHits: number;
  } {
    let totalValidations = 0;
    let totalSecurityScore = 0;
    let rateLimitHits = 0;

    this.uploadHistory.forEach(history => {
      totalValidations += history.length;
      // Calculate rate limit hits
      const now = Date.now();
      const recentUploads = history.filter(timestamp => now - timestamp < this.RATE_LIMIT_WINDOW);
      if (recentUploads.length >= 10) {
        rateLimitHits++;
      }
    });

    return {
      totalValidations,
      averageSecurityScore: totalValidations > 0 ? totalSecurityScore / totalValidations : 0,
      rateLimitHits
    };
  }

  static clearValidationHistory(): void {
    this.uploadHistory.clear();
  }
}
