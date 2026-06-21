export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const acceptHeader = request.headers.get('Accept') || '';

    // Explicitly bypass Worker for SEO and social graph assets to avoid crawler/cache issues
    const seoRoutes = ['/sitemap.xml', '/robots.txt', '/og-image.png'];
    if (seoRoutes.includes(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    // If the requester explicitly prefers text/markdown for the root page
    if ((url.pathname === '/' || url.pathname === '/index.html') && acceptHeader.includes('text/markdown')) {
      const llmsUrl = new URL(request.url);
      llmsUrl.pathname = '/llms.txt';
      
      // Fetch the asset via the Worker's ASSETS binding
      const response = await env.ASSETS.fetch(new Request(llmsUrl, request));

      if (response.ok) {
        const markdownContent = await response.text();
        return new Response(markdownContent, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }
    }

    // Otherwise, proceed to fetch the static asset normally
    return env.ASSETS.fetch(request);
  }
};
