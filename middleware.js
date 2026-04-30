export const config = {
  matcher: [
    '/((?!password\\.html|api/auth|styles|js|data|assets|_vercel|favicon\\.ico).*)'
  ]
};

export default function middleware(req) {
  const cookie = req.cookies.get('prive-access');
  if (cookie?.value === 'granted') return;
  const url = new URL('/password.html', req.url);
  return Response.redirect(url, 302);
}
