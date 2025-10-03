// Defines the possible input formats for analysis.
export enum InputType {
  ARTICLE = 'ARTICLE',
  IMAGE = 'IMAGE',
}

// Defines the possible verdicts for an analysis.
export enum Verdict {
  REAL = 'REAL',
  LIKELY_REAL = 'LIKELY_REAL',
  UNCERTAIN = 'UNCERTAIN',
  LIKELY_FAKE = 'LIKELY_FAKE',
  FAKE = 'FAKE',
}

// Defines the structure for a corroborating source.
export interface AnalysisSource {
  url: string;
  title: string;
}

// Defines the structure for a complete analysis result.
export interface AnalysisResult {
  verdict: Verdict;
  summary: string;
  confidence: number;
  reasoning: string[];
  sources: AnalysisSource[];
}

// Defines the structure for a saved history item.
export interface HistoryItem extends AnalysisResult {
  id: string;
  timestamp: string;
  inputType: InputType;
  input: string; // For text snippet, URL, or image name
}
