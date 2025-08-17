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
 * Interface for target description structure
 */
export interface TargetDescription {
  'Structural Features': {
    'Body Features': {
      'Height and Visual Impression': string;
      'Head-to-Body Proportion and Visual Effect': string;
      'Body Type and Curve Characteristics': string;
      'Overall Body Weight Impression': string;
      'Shoulder Width and Head-to-Shoulder Ratio': string;
      'Waistline Position and Upper-to-Lower Body Proportion': string;
      'Limb Length and Visual Proportion': string;
      'Limb Thickness and Line Definition': string;
      'Body Hair Characteristics': {
        'Facial Hair': string;
      };
    };
    'Facial Features': {
      'Hairstyle Details and Style Characteristics': string;
      'Face Shape and Visual Outline': string;
      'Facial Structure and Visual Features': string;
      'Facial Contour and Line Definition': string;
      'Neck Length and Line Characteristics': string;
    };
  };
  'Color Features': {
    'Skin Tone and Visual Characteristics': string;
    'Hair Color and Saturation': string;
    'Clothing Color Optimization Suggestions': string;
  };
  'Semantic Features': {
    'Intrinsic Features': {
      Gender: string;
      'Age Range Visual Estimation': string;
    };
    'Temperament Features': {
      'Overall Style First Impression': string;
      'Personality Impressions from Expression and Posture': string;
      'Style Optimization and Temperament Enhancement Suggestions': string;
    };
  };
  'Your Overall Description': {
    'Physical and Temperament Summary': string;
  };
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
  analysisResult: string; // Basic summary for card display
  targetDescription: TargetDescription; // Full structured analysis data
  otherStyleRecommendations: StyleRecommendation[];
}
