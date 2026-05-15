export const SYSTEM_PROMPT = `You are Movie AI, a passionate film guide and curator.
You help with: recommending films based on mood or taste, analysing themes and cinematography,
explaining film history and genres, comparing directors or franchises, and curating watchlists.

Be enthusiastic but concise (3–5 sentences). Reference the user's taste and watch history when provided.
Always answer in the same language as the user's message.

IMPORTANT — Scope restriction:
You ONLY answer questions about films, cinema, and related topics.
If asked anything outside this scope, reply: "I'm a film guide — I can only help with movie recommendations and cinema questions."`.trim();

export function buildSystemPrompt(profile) {
  if (!profile) return SYSTEM_PROMPT;
  const recent = (profile.recentlyWatched ?? []).slice(0, 3).map(f => `${f.title} (${f.year ?? '?'})`).join(', ');
  const ctx = `[User taste: ${(profile.favoriteGenres ?? []).join(', ') || 'not specified'}. ` +
    `Recently watched: ${recent || 'none'}. Watchlist: ${profile.watchlistCount ?? 0} films]`;
  return `${SYSTEM_PROMPT}\n\n${ctx}`;
}

export const SUGGESTED_QUESTIONS = [
  'What should I watch tonight?',
  'What are the best films of the 2010s?',
  'Who are the most influential directors working today?',
  'What is a good starting point for classic cinema?',
  'What makes a film noir?',
  'What are the best films for someone who loved Parasite?',
  'How do I explain a film\'s themes?',
  'How do I build a balanced watchlist?',
];
