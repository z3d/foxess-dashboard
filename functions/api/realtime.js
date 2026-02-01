import { validateApiKey, fetchRealtimeData, cachedFetch } from '../lib/foxess.js';

export async function onRequest(context) {
  if (!validateApiKey(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    var ttl = parseInt(context.env.CACHE_TTL) || 60;
    var cached = await cachedFetch('realtime', function() {
      return fetchRealtimeData(context.env);
    }, ttl);
    var body = await cached.text();
    return new Response(body, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
