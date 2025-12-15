export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AppState {
  view: 'home' | 'camera' | 'preview' | 'analysis';
  imageSrc: string | null;
  location: Coordinates | null;
  locationError: string | null;
  analysisResult: string | null;
  isAnalyzing: boolean;
  error: string | null;
}

export enum CameraFacingMode {
  USER = 'user',
  ENVIRONMENT = 'environment'
}