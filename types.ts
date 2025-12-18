
export interface AnalysisResult {
  crop: string;
  disease: string;
  confidence: number;
  isPlant: boolean;
  description: string;
  symptoms: string[];
  recommendations: string[];
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  image: string;
  result: AnalysisResult;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
