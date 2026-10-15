// Cloudflare Pages Middleware for Domain & Subdomain Routing

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // 1. If accessing via admin subdomain (e.g. admin.ofonitechaiacademy.online)
  if (hostname.startsWith('admin.')) {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return Response.redirect(`${url.origin}/admin/`, 302);
    }
  }

  return context.next();
}
