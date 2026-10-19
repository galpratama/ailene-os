import Script from "next/script";

// No-op until NEXT_PUBLIC_CLARITY_PROJECT_ID is set; loads once the page is idle, queueing clarity() calls until then.
export default function MicrosoftClarityBIZ() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) return null;

  return (
    <Script id="microsoft-clarity-init" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${projectId}");`}
    </Script>
  );
}
