// Cloudflare Pages Middleware for Domain & Subdomain Routing

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // 1. If accessing via admin subdomain (e.g. admin.ofonitechaiacademy.online)
  if (hostname.startsWith('admin.')) {
    // If accessing root or index.html, serve /admin content
    if (url.pathname === '/' || url.pathname === '/index.html') {
      try {
        if (context.env && context.env.ASSETS) {
          const res = await context.env.ASSETS.fetch(new Request(new URL('/admin', url.origin), context.request));
          if (res.status === 200) {
            return res;
          }
        }
      } catch (e) {
        console.warn('ASSETS fetch fallback:', e);
      }
      return Response.redirect(`${url.origin}/admin`, 302);
    }
  }

  return context.next();
}
