// Cloudflare Pages Middleware for Domain & Subdomain Routing

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // 1. If accessing via admin subdomain (e.g. admin.ofonitechaiacademy.online)
  if (hostname.startsWith('admin.')) {
    // If accessing root or index.html, rewrite to admin.html
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const adminReq = new Request(new URL('/admin.html', url), context.request);
      if (context.env && context.env.ASSETS) {
        return context.env.ASSETS.fetch(adminReq);
      }
      return context.next(adminReq);
    }
  }

  // 2. If accessing /admin or /admin/ directly on main domain
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    const adminReq = new Request(new URL('/admin.html', url), context.request);
    if (context.env && context.env.ASSETS) {
      return context.env.ASSETS.fetch(adminReq);
    }
    return context.next(adminReq);
  }

  return context.next();
}
