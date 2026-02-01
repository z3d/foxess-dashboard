import { corsHeaders } from '../lib/foxess.js';

export async function onRequest(context) {
  var origin = context.request.headers.get('Origin') || '';
  var cors = corsHeaders(origin, context.env.ALLOWED_ORIGIN || '*');

  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  // Store cors headers for downstream handlers
  context.data.cors = cors;

  // Run the route handler
  var response = await context.next();

  // Add CORS headers to the response
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
