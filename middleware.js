export const config = {
  matcher: [
    '/((?!password|api/auth|styles|js|data|assets|_vercel|favicon).*)'
  ]
};

export default function middleware(req) {
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader.includes('prive-access=granted')) return;
  return Response.redirect(new URL('/password', req.url), 302);
}
