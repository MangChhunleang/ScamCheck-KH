export type ActiveTab = 'checker' | 'learn' | 'help' | 'history' | 'report' | 'about';
export type Language = 'km' | 'en';

export interface LinkAnalysisResult {
  hasLink: boolean;
  detectedLinks: string[];
  domains: string[];
  linkRiskScore: number;
  linkRiskLevel: 'Low' | 'Medium' | 'High';
  linkWarningSignalsKm: string[];
  linkWarningSignalsEn: string[];
  linkSafeAdviceKm: string[];
  linkSafeAdviceEn: string[];
}

export interface ScanResult {
  detected_type: string;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_score: number;
  confidence: 'Low' | 'Medium' | 'High';
  detected_signals: string[];
  reasons_km: string[];
  reasons_en: string[];
  safe_next_steps_km: string[];
  safe_next_steps_en: string[];
  summary_km?: string;
  summary_en?: string;
  disclaimer_km: string;
  disclaimer_en: string;
  link_analysis?: LinkAnalysisResult;
  explanation_source?: 'gemini' | 'fallback';
  id?: string;
}

export interface FeedbackRecord {
  id: string;
  scamCheckId: string;
  userId?: string | null;
  isCorrect: boolean;
  comment?: string | null;
  createdAt: string;
}

export interface Lesson {
  id: string;
  titleKm: string;
  titleEn: string;
  contentKm: string;
  contentEn: string;
  category: string;
  categoryEn: string;
}

/**
 * Shape stored in localStorage for Recent Checks history.
 * Never stores full message content.
 */
export interface LocalHistoryItem {
  id: string;
  inputPreview: string;
  detectedType: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  detectedSignals: string[];
  createdAt: number; // Unix timestamp ms
}

export const LOCAL_HISTORY_KEY = 'scamcheck_kh_history';
export const LOCAL_HISTORY_MAX = 30;
