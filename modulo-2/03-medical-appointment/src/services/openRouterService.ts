import { HumanMessage, SystemMessage } from "langchain";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { config, type ModelConfig } from "../config.ts";

export class OpenRouterService {
  private config: ModelConfig;
  private llmClient: ChatOpenAI;

  constructor(configOverride?: ModelConfig) {
    this.config = configOverride ?? config;

    this.llmClient = new ChatOpenAI({
      apiKey: this.config.apiKey,
      modelName: this.config.models.at(0),
      temperature: this.config.temperature,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": this.config.httpReferer,
          "X-Title": this.config.xTitle,
        },
      },

      modelKwargs: {
        models: this.config.models,
        provider: this.config.provider,
      },

      tags: ["langsmith:nostream"],
    });
  }

  async generateStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodType<T>,
  ) {
    try {
      const structuredModel = this.llmClient.withStructuredOutput(schema, {
        method: "jsonSchema",
      });

      const data = await structuredModel.invoke(
        [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
        { tags: ["langsmith:nostream"] },
      );

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error("Error OpenRouterService", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
