import { anthropic } from '@ai-sdk/anthropic';
import { google }    from '@ai-sdk/google';
import { openai }    from '@ai-sdk/openai';

export function getVisionModel() {
  if (process.env.ANTHROPIC_API_KEY) return anthropic('claude-sonnet-4-5');
  if (process.env.GEMINI_API_KEY)    return google('gemini-2.0-flash');
  if (process.env.OPENAI_API_KEY)    return openai('gpt-4o-mini');
  throw new Error('No vision-capable AI provider key found. Set ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY.');
}
