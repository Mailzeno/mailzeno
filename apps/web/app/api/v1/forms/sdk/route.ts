function getAppUrl(req: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(req: Request) {
  const appUrl = getAppUrl(req);
  const sdkUrl = `${appUrl}/mz.forms.js`;
  const script = `(function(){
  var src = ${JSON.stringify(sdkUrl)};
  if (document.querySelector('script[data-mz-forms-loader]')) return;

  var s = document.createElement('script');
  s.src = src;
  s.defer = true;
  s.setAttribute('data-mz-forms-loader', '1');
  document.head.appendChild(s);
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
