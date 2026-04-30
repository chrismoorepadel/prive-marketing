export const config = { runtime: 'edge' };

const PASSWORD = 'prive2026';

export default async function handler(req) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const entered = params.get('password') || '';

  if (entered === PASSWORD) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': 'prive-access=granted; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax'
      }
    });
  }

  return new Response(null, {
    status: 302,
    headers: { 'Location': '/password.html?error=1' }
  });
}
