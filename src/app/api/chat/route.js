import { streamText } from 'ai';
import { getTextModel } from '@/lib/ai';
import { getDb } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/session';
import { buildSystemPrompt } from '@/lib/chat-config';

/**
 * Fetch the user's movie profile for personalised context.
 * Queries watch_history (recent films) and watchlist (count).
 * Returns null if the user is not authenticated or queries fail.
 */
async function getMovieProfile(userId) {
  try {
    const sql = getDb();
    const [recentRows, watchlistRows] = await Promise.all([
      sql`
        SELECT title, watched_at
        FROM watch_history
        WHERE user_id = ${userId}
        ORDER BY watched_at DESC
        LIMIT 5
      `,
      sql`
        SELECT COUNT(*) AS count
        FROM watchlist
        WHERE user_id = ${userId}
      `,
    ]);

    return {
      favoriteGenres: [],           // no genre column yet in watch_history
      recentlyWatched: recentRows.map(r => ({ title: r.title, year: null })),
      watchlistCount: parseInt(watchlistRows[0]?.count) || 0,
    };
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return Response.json({ error: 'message required' }, { status: 400 });
    }

    let profile = null;
    try {
      const user = await getAuthUser(req);
      if (user?.id) profile = await getMovieProfile(user.id);
    } catch {}

    const model = getTextModel();

    const result = streamText({
      model,
      system: buildSystemPrompt(profile),
      messages: [
        ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
      maxTokens: 800,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of (await result).textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error';
          controller.enqueue(encoder.encode(`\x00ERROR:${msg}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.json({ error: 'Chat failed' }, { status: 500 });
  }
}
