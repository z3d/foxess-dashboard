export function onRequest() {
  return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
