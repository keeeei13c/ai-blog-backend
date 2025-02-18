import OpenAI from "openai";

export type OpenAIResponse = {
  success: boolean;
  data?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o") {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
    this.model = model;
  }

  async createCompletion(prompt: string): Promise<OpenAIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt,
          }
        ],
        response_format: { type: "text" },
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return {
        success: true,
        data: response.choices[0].message.content ?? undefined,
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0,
        }
      };
    } catch (err) {
      const error = err as Error;
      console.error("OpenAI API error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}