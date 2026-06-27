export interface Vehicle {
  id: string;
  category: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  analysisId: string;
}

export interface Analysis {
  id: string;
  filename: string;
  processedImage: string;
  processingTime: number;
  createdAt: Date | string;
  vehicles: Vehicle[];
}

export interface DetectionResult {
  status: string;
  filename: string;
  processed_filename: string;
  processing_time: number;
  vehicles: {
    category: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}
