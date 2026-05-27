import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config/index.js';
import { initLangSmith } from '../config/langsmith.js';
import { AppError } from '../utils/apiResponse.js';

initLangSmith();

const LENGTH_INSTRUCTIONS = {
  short: 'Keep the summary very concise (2-4 sentences or 3-5 bullet points).',
  medium: 'Provide a balanced summary (1-2 paragraphs or 6-10 bullet points).',
  long: 'Provide a comprehensive summary with full detail and context.',
};

const TYPE_INSTRUCTIONS = {
  short: 'Write a brief executive summary capturing only the main idea.',
  detailed: 'Write a thorough, well-structured detailed summary covering all major points.',
  bullets: 'Format the output as clear bullet points covering all key topics.',
  insights: 'Extract and list the key insights, takeaways, and actionable conclusions.',
};

const getMaxTokens = (length) => {
  if (length === 'long') return 2048;
  if (length === 'medium') return 1024;
  return 512;
};

const getModel = (maxTokens) => {
  if (!config.groq.apiKey) {
    throw new AppError('Groq API key is not configured', 500);
  }
  return new ChatGroq({
    apiKey: config.groq.apiKey,
    model: config.groq.model,
    temperature: 0.3,
    maxTokens,
  });
};

export const generateSummary = async ({
  content,
  summaryType = 'short',
  length = 'medium',
  sourceType = 'text',
}) => {
  const typeInstruction = TYPE_INSTRUCTIONS[summaryType] || TYPE_INSTRUCTIONS.short;
  const lengthInstruction = LENGTH_INSTRUCTIONS[length] || LENGTH_INSTRUCTIONS.medium;

  const systemPrompt = `You are an expert content summarizer. ${typeInstruction} ${lengthInstruction}
Respond in clear, professional English. Do not include preamble like "Here is the summary".`;

  const userPrompt = `Summarize the following content:\n\n${content}`;
  const maxTokens = getMaxTokens(length);
  const model = getModel(maxTokens);

  try {
    const response = await model.invoke(
      [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)],
      {
        runName: `summarize-${sourceType}`,
        tags: ['summarize', sourceType, summaryType, length],
        metadata: {
          summaryType,
          length,
          sourceType,
          contentLength: content.length,
          model: config.groq.model,
        },
      }
    );

    const summary =
      typeof response.content === 'string'
        ? response.content.trim()
        : String(response.content || '').trim();

    if (!summary) {
      throw new AppError('Failed to generate summary from AI', 502);
    }

    const usage = response.response_metadata?.token_usage || response.usage_metadata || {};

    return {
      summary,
      model: config.groq.model,
      usage: {
        prompt_tokens: usage.input_tokens ?? usage.prompt_tokens,
        completion_tokens: usage.output_tokens ?? usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
      langsmithTraced: config.langsmith.enabled,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    const msg = error?.message || 'Groq API request failed';
    throw new AppError(msg, error?.status || 502);
  }
};
