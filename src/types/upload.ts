export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'processing';
  error?: string;
  id?: string;
  pages?: PDFPage[];
}

export interface PDFPage {
  id?: string;
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  url: string;
  imageUrl?: string;
  ocrText?: string;
  sheetId?: string;
  references?: any[];
}

export interface UploadedPage {
  id: string;
  pageNumber: number;
  url: string;
  thumbnail?: string;
}

export interface SheetReference {
  id: string;
  name: string;
  pageNumber: number;
}

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
} 