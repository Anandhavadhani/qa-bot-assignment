import { PromptType } from './types';

const systemPrompts: Record<PromptType, string> = {
  default:
    'You are a helpful QA assistant. Provide accurate answers and cite the relevant sections from the document when applicable.',
  detailed:
    'You are a thorough QA assistant. Provide comprehensive analysis with full context, caveats, and nuances. Include any assumptions or limitations in your analysis.',
  concise:
    'You are a concise QA assistant. Provide brief, direct answers without unnecessary elaboration. Get straight to the point.',
  technical:
    'You are a technical QA assistant. Focus on depth, domain-specific terminology, and technical accuracy. Provide detailed technical insights.',
};

type MinimalModel = unknown;

type Chain = {
  invoke(input: { document: string; question: string }): Promise<string>;
};

const chainCache = new Map<PromptType, Chain>();
const currentModel = new Map<PromptType, { invoke(input: unknown): Promise<unknown> }>();

export function buildChain(model: MinimalModel, promptType: PromptType): Chain {
  // Always update model for this prompt type so cached chain uses latest model
  currentModel.set(promptType, model as unknown as { invoke(input: unknown): Promise<unknown> });

  const cached = chainCache.get(promptType);
  if (cached) return cached;

  const systemMessage = systemPrompts[promptType];

  const chain: Chain = {
    async invoke({ document, question }) {
      const prompt = `${systemMessage}\n\nDocument:\n${document}\n\nQuestion: ${question}`;

      const invoker = currentModel.get(promptType);
      if (!invoker) throw new Error('No model available for this prompt type');

      const resp = await invoker.invoke({ input: prompt });

      if (typeof resp === 'string') return resp;

      if (resp && typeof resp === 'object') {
        // extract common fields if present
        // @ts-expect-error runtime extraction
        if (typeof resp.text === 'string') return resp.text;
        // @ts-expect-error runtime extraction
        if (typeof resp.content === 'string') return resp.content;
      }

      throw new Error('Chain did not return a string output');
    },
  };

  chainCache.set(promptType, chain);
  return chain;
}

export async function runChain(chain: Chain, document: string, question: string): Promise<string> {
  return chain.invoke({ document, question });
}
