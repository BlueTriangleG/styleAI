/**
 * Interface for style recommendation items
 */
export interface StyleRecommendation {
  styleType:
    | 'casual_daily'
    | 'professional_work'
    | 'social_gathering'
    | 'outdoor_sports';
  imageUrl: string;
}

/**
 * Interface for analysis results
 */
export interface AnalysisResults {
  faceShape: string;
  skinTone: string;
  bodyType: string;
  styleMatch: string;
}

/**
 * Interface for history report data
 * Structured to display a user's past style reports with analysis results and recommendations
 */
export interface HistoryReportData {
  id: string;
  userId: string;
  uploadedImage: string; // Base64 or public URL
  bestFitImage: string;
  createdAt: string;
  analysisResult: string; // target_description as stringified summary
  otherStyleRecommendations: StyleRecommendation[];
}
