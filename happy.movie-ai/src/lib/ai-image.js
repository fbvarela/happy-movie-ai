import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export function getImageModel() {
  if (process.env.OPENAI_API_KEY) return openai.image('dall-e-3');
  if (process.env.GEMINI_API_KEY) return google.image('imagen-3.0-generate-001');
  throw new Error('No image generation provider key found. Set OPENAI_API_KEY or GEMINI_API_KEY.');
}
