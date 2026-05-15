import { anthropic } from '@ai-sdk/anthropic';
import { cohere }    from '@ai-sdk/cohere';
import { google }    from '@ai-sdk/google';

export function getTextModel() {
  if (process.env.COHERE_API_KEY)    return cohere('command-r-plus-08-2024');
  if (process.env.ANTHROPIC_API_KEY) return anthropic('claude-sonnet-4-5');
  if (process.env.GEMINI_API_KEY)    return google('gemini-2.0-flash');
  throw new Error('No text AI provider key found. Set COHERE_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY.');
}
