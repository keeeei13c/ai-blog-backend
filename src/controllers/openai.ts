import { Context } from "hono";
import { OpenAIService } from "../services/openai";
import { z } from "zod";
import { APIResponse, GenerateRequest } from "../types/openai";

const generateRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
});

export class AIController {
  private openaiService: OpenAIService;

  constructor(apiKey: string) {
    this.openaiService = new OpenAIService(apiKey);
  }

  generate = async (c: Context) => {
    try {
      const data = await c.req.json<GenerateRequest>();
      const validated = generateRequestSchema.parse(data);

      const result = await this.openaiService.createCompletion(
        validated.prompt
      );

      if (!result.success) {
        return c.json<APIResponse>({
          success: false,
          error: result.error,
        }, 500);
      }

      return c.json<APIResponse>({
        success: true,
        data: result.data,
        usage: result.usage,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json<APIResponse>({
          success: false,
          error: "Invalid request data",
        }, 400);
      }

      console.error("Generate error:", error);
      return c.json<APIResponse>({
        success: false,
        error: "Internal server error",
      }, 500);
    }
  };
}