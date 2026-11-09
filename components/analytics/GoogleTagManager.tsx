import Script from "next/script";

// The existing container uses the legacy gtm.js start event; newer containers can share the page's gtag queue.
export default function GoogleTagManager({
  gtmId,
  initialize = true,
}: {
  gtmId: string;
  initialize?: boolean;
}) {
  return (
    <>
      {initialize && (
        <Script id={`gtm-init-${gtmId}`} strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});`}
        </Script>
      )}
      <Script
        id={`gtm-src-${gtmId}`}
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        strategy="lazyOnload"
      />
    </>
  );
}
