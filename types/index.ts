// Types for the promptHelper application

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  iconName: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  description: string;
  category: "frontier" | "reasoning" | "opensource" | "specialized";
  strengths: string[];
  models: string[];
  selectedModel: string;
  webUrl: string;
}

export interface Domain {
  id: string;
  name: string;
  iconName: string;
  description: string;
  color: string;
  examples: string[];
}

export interface PromptStrategy {
  id: string;
  name: string;
  iconName: string;
  description: string;
  benefit: string;
}

export interface PromptMetrics {
  roleDetected: boolean;
  constraintsDetected: boolean;
  outputFormatDetected: boolean;
  savingsPercentage: number;
}

export interface GeneratedPrompt {
  id: string;
  originalInput: string;
  enhancedPrompt: string;
  aiModel: string;
  aiProvider: string;
  domain: string;
  strategy?: string;
  tokensBefore: number;
  tokensAfter: number;
  savedAt: string;
  tips: string[];
  metrics?: PromptMetrics;
}

export interface GenerateRequest {
  userInput: string;
  aiModelId: string;
  domainId: string;
  strategyId?: string;
  targetModel?: string;
}

export interface GenerateResponse {
  enhancedPrompt: string;
  tips: string[];
  tokensBefore: number;
  tokensAfter: number;
  metrics?: PromptMetrics;
}
