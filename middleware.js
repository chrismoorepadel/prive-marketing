export const config = {
  matcher: [
    '/((?!password\\.html|api/auth|styles|js|data|assets|_vercel|favicon\\.ico).*)'
  ]
};

export default function middleware(req) {
  const cookieHeader = req.headers.get('cookie') || '';
  if (cookieHeader.includes('prive-access=granted')) return;
  return Response.redirect(new URL('/password.html', req.url), 302);
}
