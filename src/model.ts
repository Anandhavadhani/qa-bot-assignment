import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGroq } from '@langchain/groq';

type ModelProvider = 'openai' | 'anthropic' | 'groq';
type LLMModel = ChatOpenAI | ChatAnthropic | ChatGroq;

function getTemperature(): number {
  const tempStr = process.env.TEMPERATURE ?? '0.7';
  const temperature = parseFloat(tempStr);

  if (Number.isNaN(temperature)) {
    throw new Error(
      `Invalid TEMPERATURE: "${tempStr}" is not a valid number`
    );
  }

  if (temperature < 0 || temperature > 2) {
    throw new Error(
      `TEMPERATURE must be between 0 and 2, got ${temperature}`
    );
  }

  return temperature;
}

export function getModel(): LLMModel {
  const provider = (process.env.MODEL_PROVIDER ?? 'openai').toLowerCase() as ModelProvider;
  const temperature = getTemperature();

  switch (provider) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for OpenAI provider');
      }
      return new ChatOpenAI({
        openAIApiKey: apiKey,
        temperature,
        modelName: 'gpt-4-turbo',
      });
    }

    case 'anthropic': {
      const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.CLAUDE_API_KEY;
      if (!apiKey) {
        throw new Error(
          'ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable is required for Anthropic provider'
        );
      }
      return new ChatAnthropic({
        anthropicApiKey: apiKey,
        temperature,
        modelName: 'claude-3-sonnet-20240229',
      });
    }

    case 'groq': {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is required for Groq provider');
      }
      return new ChatGroq({
        apiKey,
        temperature,
        modelName: 'mixtral-8x7b-32768',
      });
    }

    default:
      throw new Error(
        `Unknown MODEL_PROVIDER: "${provider}". Supported: openai, anthropic, groq`
      );
  }
}

export function getModelName(): string {
  const provider = (process.env.MODEL_PROVIDER ?? 'openai').toLowerCase() as ModelProvider;
  switch (provider) {
    case 'openai':
      return 'gpt-4-turbo';
    case 'anthropic':
      return 'claude-3-sonnet-20240229';
    case 'groq':
      return 'mixtral-8x7b-32768';
    default:
      return 'unknown';
  }
}
