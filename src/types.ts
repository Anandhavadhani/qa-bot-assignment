import { z } from 'zod';

export const PromptTypeEnum = z.enum(['default', 'detailed', 'concise', 'technical']);
export type PromptType = z.infer<typeof PromptTypeEnum>;

export const InvokeSchema = z.object({
  documentText: z.string().min(1, 'Document text cannot be empty'),
  question: z.string().min(1, 'Question cannot be empty'),
  promptType: PromptTypeEnum.default('default'),
});

export type InvokeRequest = z.infer<typeof InvokeSchema>;

export const FileUploadSchema = z.object({
  filePath: z.string().min(1, 'File path cannot be empty'),
  question: z.string().min(1, 'Question cannot be empty'),
  promptType: PromptTypeEnum.default('default'),
});

export type FileUploadRequest = z.infer<typeof FileUploadSchema>;

export interface QAResponse {
  answer: string;
  model: string;
  responseTime: number;
  promptType: PromptType;
}

export interface HealthResponse {
  status: string;
  model: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  requestId: string;
}
