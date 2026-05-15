import { streamText } from "ai";
import { getTextModel } from "@/lib/ai";
import { aiLimiter } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are a movie recommendation assistant for HappyMovie, a free movie streaming app.

IMPORTANT RULES:
- Recommend movies that are likely available for free — public domain classics, older films, or well-known titles commonly found on free platforms (Internet Archive, YouTube, Tubi, Pluto TV, Plex).
- Focus on movies released before 2000, especially classics, cult films, film noir, silent era, golden age Hollywood, and well-known indie films.
- You CAN recommend newer movies if they're widely known to be available on free ad-supported platforms.
- Always return EXACTLY the JSON format specified below. No markdown, no extra text outside the JSON.

OUTPUT FORMAT:
Return a JSON array of movie recommendations. Each object must have:
- "title": exact movie title
- "year": release year (number)
- "imdbId": IMDb ID if you know it (e.g. "tt0068646"), or null
- "reason": 1-2 sentence explanation of why this fits the request

Example:
[
  {"title": "The Third Man", "year": 1949, "imdbId": "tt0041959", "reason": "A masterpiece of noir cinema with stunning cinematography and a legendary performance by Orson Welles."},
  {"title": "Nosferatu", "year": 1922, "imdbId": "tt0013442", "reason": "The original vampire film, a silent era classic that defined horror cinema."}
]

Return 5-8 recommendations per request. Vary your suggestions — don't always recommend the same popular films.`;

export async function POST(request) {
  try {
    const limit = aiLimiter(request);
    if (!limit.ok) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages } = await request.json();

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const model = getTextModel();

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      onError: (err) => console.error("Recommend stream error:", err),
    });

    return result.toDataStreamResponse({
      getErrorMessage: (err) => {
        console.error("Recommend stream error (data stream):", err);
        return err instanceof Error ? err.message : "Failed to generate recommendations";
      },
    });
  } catch (err) {
    console.error("Recommend API error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate recommendations" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
