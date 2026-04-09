import { getFormBySlug } from "@/lib/services/forms.service";

function getAppUrl(req: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);

  if (!form) {
    return new Response("/* Form not found */", {
      status: 404,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  const appUrl = getAppUrl(req);
  const iframeSrc = `${appUrl}/f/${slug}`;

  const script = `(function () {
  var slug = ${JSON.stringify(slug)};
  var selector = '[data-mailzeno-form="' + slug + '"]';
  var host = ${JSON.stringify(appUrl)};
  var src = ${JSON.stringify(iframeSrc)};

  function createFrame(container) {
    if (!container || container.querySelector('iframe[data-mailzeno-embed]')) return;

    var iframe = document.createElement('iframe');
    iframe.setAttribute('data-mailzeno-embed', slug);
    iframe.src = src;
    iframe.loading = 'lazy';
    iframe.title = 'MailZeno Form';
    iframe.style.width = '100%';
    iframe.style.minHeight = container.getAttribute('data-height') || '640px';
    iframe.style.border = '0';
    iframe.style.borderRadius = container.getAttribute('data-radius') || '16px';
    iframe.style.background = 'transparent';

    container.appendChild(iframe);
  }

  function init() {
    var container = document.querySelector(selector);

    if (!container) {
      container = document.getElementById('mailzeno-form-' + slug);
    }

    if (!container) {
      container = document.createElement('div');
      container.setAttribute('data-mailzeno-form', slug);
      document.body.appendChild(container);
    }

    createFrame(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;

  return new Response(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
