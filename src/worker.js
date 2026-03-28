import { corsHeaders, validateApiKey, fetchRealtimeData, fetchReportData, cachedFetch } from './lib/foxess.js';

// Fetch solar production forecast from forecast.solar (two planes, summed)
async function fetchSolarForecast() {
  var planes = [
    { kwp: 4.44, dec: 22, az: 180 },
    { kwp: 5.56, dec: 22, az: -90 }
  ];
  var lat = -27.5938;
  var lon = 153.0979;
  var base = 'https://api.forecast.solar/estimate/watthours/day';

  var results = await Promise.all(planes.map(function(p) {
    var url = base + '/' + lat + '/' + lon + '/' + p.dec + '/' + p.az + '/' + p.kwp;
    return fetch(url).then(function(r) { return r.json(); });
  }));

  // Each result.result is { "YYYY-MM-DD": watt_hours, ... }
  var totals = {};
  for (var i = 0; i < results.length; i++) {
    var data = results[i].result || {};
    var keys = Object.keys(data);
    for (var j = 0; j < keys.length; j++) {
      var day = keys[j];
      totals[day] = (totals[day] || 0) + data[day];
    }
  }

  // Get today and tomorrow dates in AEST (UTC+10)
  var nowAest = new Date(Date.now() + 10 * 3600000);
  var todayStr = nowAest.toISOString().substring(0, 10);
  var tmrw = new Date(nowAest.getTime() + 86400000);
  var tmrwStr = tmrw.toISOString().substring(0, 10);

  return {
    today: Math.round((totals[todayStr] || 0) / 100) / 10,
    tomorrow: Math.round((totals[tmrwStr] || 0) / 100) / 10
  };
}

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
          var ttl = parseInt(env.CACHE_TTL) || 120;
          var cached = await cachedFetch('realtime', function() {
            return fetchRealtimeData(env);
          }, ttl);
          var body = await cached.text();
          response = new Response(body, {
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
          var ttl2 = parseInt(env.CACHE_TTL) || 120;
          var cached2 = await cachedFetch('report-' + reportType, function() {
            return fetchReportData(env, reportType);
          }, ttl2);
          var body2 = await cached2.text();
          response = new Response(body2, {
            headers: { 'Content-Type': 'application/json' }
          });
        }

      } else if (path === '/api/daily-generation') {
        if (!validateApiKey(request, env)) {
          response = new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          // Default to yesterday in AEST (UTC+10)
          var dateParam = url.searchParams.get('date');
          var dateKey;
          var genDate;
          if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
            // Use the date string directly as the key; parse as UTC for the API call
            dateKey = dateParam;
            var parts = dateParam.split('-');
            genDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
          } else {
            // Default to yesterday in AEST (UTC+10)
            var nowAest2 = new Date(Date.now() + 10 * 3600000);
            var yest = new Date(nowAest2.getTime() - 86400000);
            dateKey = yest.toISOString().substring(0, 10);
            genDate = new Date(Date.UTC(parseInt(dateKey.substring(0, 4)), parseInt(dateKey.substring(5, 7)) - 1, parseInt(dateKey.substring(8, 10))));
          }
          // Use short TTL for today (data still accumulating), long TTL for past dates
          var nowAestDate = new Date(Date.now() + 10 * 3600000).toISOString().substring(0, 10);
          var genTtl = (dateKey === nowAestDate) ? 300 : 21600;
          var cached4 = await cachedFetch('daily-gen-' + dateKey, function() {
            return fetchReportData(env, 'day', genDate).then(function(data) {
              var total = 0;
              if (data && data.result) {
                for (var g = 0; g < data.result.length; g++) {
                  if (data.result[g].variable === 'generation' && data.result[g].data) {
                    var pts = data.result[g].data;
                    for (var h = 0; h < pts.length; h++) {
                      total += pts[h].value || 0;
                    }
                  }
                }
              }
              return { date: dateKey, generation: Math.round(total * 10) / 10 };
            });
          }, genTtl);
          var body4 = await cached4.text();
          response = new Response(body4, {
            headers: { 'Content-Type': 'application/json' }
          });
        }

      } else if (path === '/api/solar-forecast') {
        var cached3 = await cachedFetch('solar-forecast', function() {
          return fetchSolarForecast();
        }, 3600);
        var body3 = await cached3.text();
        response = new Response(body3, {
          headers: { 'Content-Type': 'application/json' }
        });

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
