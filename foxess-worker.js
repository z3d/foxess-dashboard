/**
 * FoxESS Cloud API Proxy Worker
 *
 * Environment variables required:
 * - FOXESS_API_KEY: Your FoxESS API key
 * - FOXESS_DEVICE_SN: Your inverter serial number
 * - ALLOWED_ORIGIN: Allowed origin for CORS (e.g., https://yourdomain.com or *)
 */

const FOXESS_API_BASE = 'https://www.foxesscloud.com';

// MD5 implementation for signature generation
function md5(string) {
  function md5cycle(x, k) {
    var a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function md51(s) {
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s) {
    var md5blks = [],
      i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  var hex_chr = '0123456789abcdef'.split('');

  function rhex(n) {
    var s = '',
      j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
    return s;
  }

  function hex(x) {
    for (var i = 0; i < x.length; i++) x[i] = rhex(x[i]);
    return x.join('');
  }

  function add32(a, b) {
    return (a + b) & 0xffffffff;
  }

  return hex(md51(string));
}

// Generate FoxESS API signature
function generateSignature(path, token, timestamp) {
  var signatureString = path + '\r\n' + token + '\r\n' + timestamp;
  return md5(signatureString);
}

// Create headers for FoxESS API requests
function createFoxESSHeaders(path, apiKey) {
  var timestamp = Date.now().toString();
  var signature = generateSignature(path, apiKey, timestamp);

  return {
    'Content-Type': 'application/json',
    'token': apiKey,
    'timestamp': timestamp,
    'signature': signature,
    'lang': 'en'
  };
}

// Handle CORS
function corsHeaders(origin, allowedOrigin) {
  var allowed = allowedOrigin === '*' || origin === allowedOrigin;
  return {
    'Access-Control-Allow-Origin': allowed ? (allowedOrigin === '*' ? '*' : origin) : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

// Fetch real-time data from FoxESS
async function fetchRealtimeData(env) {
  var path = '/op/v0/device/real/query';
  var headers = createFoxESSHeaders(path, env.FOXESS_API_KEY);

  var variables = [
    'SoC',
    'pvPower',
    'loadsPower',
    'batChargePower',
    'batDischargePower',
    'feedinPower',
    'gridConsumptionPower',
    'batTemperature',
    'RVolt'
  ];

  var body = {
    sn: env.FOXESS_DEVICE_SN,
    variables: variables
  };

  var response = await fetch(FOXESS_API_BASE + path, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });

  return response.json();
}

// Fetch report data from FoxESS
async function fetchReportData(env, reportType) {
  var path = '/op/v0/device/report/query';
  var headers = createFoxESSHeaders(path, env.FOXESS_API_KEY);

  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();

  var dimension;
  switch (reportType) {
    case 'month':
      dimension = 'month';
      break;
    case 'year':
      dimension = 'year';
      break;
    case 'day':
    default:
      dimension = 'day';
  }

  var variables = [
    'generation',
    'feedin',
    'gridConsumption',
    'chargeEnergyToTal',
    'dischargeEnergyToTal'
  ];

  var body = {
    sn: env.FOXESS_DEVICE_SN,
    dimension: dimension,
    variables: variables,
    year: year,
    month: month,
    day: day
  };

  var response = await fetch(FOXESS_API_BASE + path, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });

  return response.json();
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var origin = request.headers.get('Origin') || '';
    var cors = corsHeaders(origin, env.ALLOWED_ORIGIN || '*');

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: Object.assign({}, cors, { 'Content-Type': 'application/json' })
      });
    }

    // Debug endpoint - tests all signature formats against real API
    if (url.pathname === '/api/debug') {
      var debugPath = '/op/v0/device/real/query';
      var body = JSON.stringify({ sn: env.FOXESS_DEVICE_SN, variables: ['SoC'] });
      var results = {};

      // Test CRLF format
      var ts1 = Date.now().toString();
      var sig1 = md5(debugPath + '\r\n' + env.FOXESS_API_KEY + '\r\n' + ts1);
      try {
        var resp1 = await fetch(FOXESS_API_BASE + debugPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'token': env.FOXESS_API_KEY, 'timestamp': ts1, 'signature': sig1, 'lang': 'en' },
          body: body
        });
        results.CRLF = await resp1.json();
      } catch (e) { results.CRLF = { error: e.message }; }

      // Test LF format
      var ts2 = Date.now().toString();
      var sig2 = md5(debugPath + '\n' + env.FOXESS_API_KEY + '\n' + ts2);
      try {
        var resp2 = await fetch(FOXESS_API_BASE + debugPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'token': env.FOXESS_API_KEY, 'timestamp': ts2, 'signature': sig2, 'lang': 'en' },
          body: body
        });
        results.LF = await resp2.json();
      } catch (e) { results.LF = { error: e.message }; }

      // Test no separator
      var ts3 = Date.now().toString();
      var sig3 = md5(debugPath + env.FOXESS_API_KEY + ts3);
      try {
        var resp3 = await fetch(FOXESS_API_BASE + debugPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'token': env.FOXESS_API_KEY, 'timestamp': ts3, 'signature': sig3, 'lang': 'en' },
          body: body
        });
        results.NoSep = await resp3.json();
      } catch (e) { results.NoSep = { error: e.message }; }

      return new Response(JSON.stringify(results, null, 2), {
        headers: Object.assign({}, cors, { 'Content-Type': 'application/json' })
      });
    }

    // Real-time data endpoint
    if (url.pathname === '/api/realtime') {
      try {
        var data = await fetchRealtimeData(env);
        return new Response(JSON.stringify(data), {
          headers: Object.assign({}, cors, { 'Content-Type': 'application/json' })
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: Object.assign({}, cors, { 'Content-Type': 'application/json' })
        });
      }
    }

    // Report data endpoint
    if (url.pathname === '/api/report') {
      try {
        var reportType = url.searchParams.get('type') || 'day';
        var reportData = await fetchReportData(env, reportType);
        return new Response(JSON.stringify(reportData), {
          headers: Object.assign({}, cors, { 'Content-Type': 'application/json' })
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: Object.assign({}, cors, { 'Content-Type': 'application/json' })
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: Object.assign({}, cors, { 'Content-Type': 'application/json' })
    });
  }
};
