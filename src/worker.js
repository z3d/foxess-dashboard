import { corsHeaders, validateApiKey, fetchDeviceDetail, fetchRealtimeData, fetchReportData, cachedFetch } from './lib/foxess.js';

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var path = url.pathname;

    // Only handle /api/* routes; static assets served automatically
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    var origin = request.headers.get('Origin') || '';
    var cors = corsHeaders(origin, env.ALLOWED_ORIGIN || '*');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    var response;
    try {
      if (path === '/api/health') {
        response = new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: { 'Content-Type': 'application/json' }
        });

      } else if (path === '/api/realtime') {
        if (!validateApiKey(request, env)) {
          response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          var ttl = parseInt(env.CACHE_TTL) || 60;
          var cached = await cachedFetch('realtime', function() {
            return fetchRealtimeData(env);
          }, ttl);
          var body = await cached.text();
          response = new Response(body, {
            headers: { 'Content-Type': 'application/json' }
          });
        }

      } else if (path === '/api/device-detail') {
        if (!validateApiKey(request, env)) {
          response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          var cachedDetail = await cachedFetch('device-detail', function() {
            return fetchDeviceDetail(env);
          }, 86400);
          var bodyDetail = await cachedDetail.text();
          console.log('[device-detail]', bodyDetail.substring(0, 500));
          response = new Response(bodyDetail, {
            headers: { 'Content-Type': 'application/json' }
          });
        }

      } else if (path === '/api/report') {
        if (!validateApiKey(request, env)) {
          response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          var reportType = url.searchParams.get('type') || 'day';
          var ttl2 = parseInt(env.CACHE_TTL) || 60;
          var cached2 = await cachedFetch('report-' + reportType, function() {
            return fetchReportData(env, reportType);
          }, ttl2);
          var body2 = await cached2.text();
          response = new Response(body2, {
            headers: { 'Content-Type': 'application/json' }
          });
        }

      } else {
        response = new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      response = new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add CORS headers to response
    var newHeaders = new Headers(response.headers);
    var keys = Object.keys(cors);
    for (var i = 0; i < keys.length; i++) {
      newHeaders.set(keys[i], cors[keys[i]]);
    }
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });
  }
};
