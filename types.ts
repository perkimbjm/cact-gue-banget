
export type Generation = "Gen X" | "Gen Y" | "Gen Z";

export interface UserProfile {
  nickname: string;
  age: number;
  gender: "Male" | "Female";
  occupation: string;
  generation: Generation;
}

export interface Question {
  id: number;
  text: string;
  type: "mcq" | "text";
  options?: string[];
  category: string;
  isRecall?: boolean;
}

export interface AnalysisResult {
  mbti: string;
  temperament: string; // Sanguine, Choleric, Melancholic, Phlegmatic
  finalProfile: {
    hexacoSummary: string;
    hspLevel: string;
    synthesis: string;
    keyTraits: string[];
  };
  narrative: {
    tone: string;
    humorousContent: string;
    summary: string;
  };
}