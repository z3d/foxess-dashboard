import { validateApiKey, fetchReportData, cachedFetch } from '../lib/foxess.js';

export async function onRequest(context) {
  if (!validateApiKey(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    var url = new URL(context.request.url);
    var reportType = url.searchParams.get('type') || 'day';
    var ttl = parseInt(context.env.CACHE_TTL) || 60;
    var cached = await cachedFetch('report-' + reportType, function() {
      return fetchReportData(context.env, reportType);
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
