export type APIResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type GenerateRequest = {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
};