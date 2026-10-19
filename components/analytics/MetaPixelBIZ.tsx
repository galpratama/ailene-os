import Script from "next/script";

// Renders nothing until BD/Marketing supplies NEXT_PUBLIC_META_PIXEL_ID — safe no-op, never breaks the page.
export default function MetaPixelBIZ() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!pixelId) return null;

  return (
    <>
      {/* Meta's own snippet minus the script tag: fbq queues calls now, and fbevents.js drains the queue once the page is idle. */}
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`!function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[]}(window);fbq("init","${pixelId}");fbq("track","PageView");`}
      </Script>
      <Script id="meta-pixel-src" src="https://connect.facebook.net/en_US/fbevents.js" strategy="lazyOnload" />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- must render without JS, so next/image isn't an option here */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
