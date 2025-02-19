export type OpenAICompletionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type OpenAICompletionRequest = {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
};