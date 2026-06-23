import { createChatModel } from "./model.js";
const PROMPTS = {
    default: (doc, q) => `You are a helpful assistant. Use the provided document to answer the question. Cite sections when relevant.\n\nDOCUMENT:\n${doc}\n\nQUESTION:\n${q}`,
    detailed: (doc, q) => `You are an expert analyst. Provide a comprehensive answer with context, assumptions, and caveats. Use the DOCUMENT below.\n\nDOCUMENT:\n${doc}\n\nQUESTION:\n${q}`,
    concise: (doc, q) => `Answer briefly and directly using the DOCUMENT. No extra commentary.\n\nDOCUMENT:\n${doc}\n\nQUESTION:\n${q}`,
    technical: (doc, q) => `You are a domain expert. Provide a precise, technical answer using industry terminology where appropriate. Reference the DOCUMENT.\n\nDOCUMENT:\n${doc}\n\nQUESTION:\n${q}`
};
export async function invokeChain(document, question, promptType = "default") {
    const provider = process.env.MODEL_PROVIDER || "openai";
    const modelName = process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL || process.env.GROQ_MODEL || "gpt-4";
    const template = PROMPTS[promptType] ?? PROMPTS["default"];
    const prompt = template(document, question);
    try {
        const model = createChatModel();
        let text;
        // Use invoke() with the prompt string for modern LangChain ChatModels
        try {
            const response = await model.invoke(prompt);
            // Extract text from response - handles both BaseMessage and string responses
            text = typeof response === "string" ? response : response?.content;
        }
        catch (e1) {
            console.error("First invoke attempt failed:", e1?.message || e1);
            // Fallback: try passing as BaseMessage array with call method
            try {
                if (typeof model.call === "function") {
                    const result = await model.call({ messages: [{ role: "user", content: prompt }] });
                    text = typeof result === "string" ? result : result?.content;
                }
            }
            catch (e2) {
                console.error("Call method failed:", e2?.message || e2);
                // ignore; let later fallback handle it
            }
        }
        if (!text) {
            // Fallback to a basic synthetic answer if model call failed
            const snippet = document.slice(0, 800).replace(/\s+/g, " ");
            text = `Simulated answer for promptType=${promptType}:\nQ: ${question}\n---\nSource excerpt:\n${snippet}`;
        }
        return {
            output: text,
            model: modelName,
            provider,
            promptType
        };
    }
    catch (err) {
        // On error, return a safe message
        return {
            output: `Error invoking model: ${err?.message ?? "unknown"}`,
            model: modelName,
            provider,
            promptType
        };
    }
}
//# sourceMappingURL=chain.js.map