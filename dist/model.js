import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
export function getModelInfo() {
    const provider = process.env.MODEL_PROVIDER || "openai";
    const model = (process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL || process.env.GROQ_MODEL || "gpt-4");
    const temperature = Number(process.env.TEMPERATURE ?? 0.1);
    return { provider, model, temperature };
}
export function createChatModel() {
    const provider = process.env.MODEL_PROVIDER || "openai";
    const temperature = Number(process.env.TEMPERATURE ?? 0.1);
    if (provider === "openai") {
        const modelName = process.env.OPENAI_MODEL || "gpt-4";
        return new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, modelName, temperature });
    }
    if (provider === "anthropic") {
        const modelName = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
        return new ChatAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY, modelName, temperature });
    }
    throw new Error(`Unsupported MODEL_PROVIDER: ${provider}`);
}
//# sourceMappingURL=model.js.map