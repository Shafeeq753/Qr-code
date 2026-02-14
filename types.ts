
export interface QRMetadata {
  title: string;
  category: string;
  suggestedFileName: string;
  description: string;
}

export enum ExportFormat {
  PNG = 'image/png',
  JPEG = 'image/jpeg'
}

export interface QRState {
  url: string;
  metadata: QRMetadata | null;
  isGenerating: boolean;
  error: string | null;
}
