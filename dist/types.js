import { z } from "zod";
export const InvokeBodySchema = z.object({
    question: z.string().min(1),
    documentPath: z.string().optional(),
    documentText: z.string().optional(),
    promptType: z.enum(["default", "detailed", "concise", "technical"]).optional()
}).refine(data => !!(data.documentPath || data.documentText), {
    message: "Either documentPath or documentText must be provided",
    path: ["documentPath", "documentText"]
});
export const FileUploadBodySchema = z.object({
    question: z.string().min(1),
    promptType: z.enum(["default", "detailed", "concise", "technical"]).optional()
});
//# sourceMappingURL=types.js.map