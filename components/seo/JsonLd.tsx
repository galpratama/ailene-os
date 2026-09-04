// Emits one @graph script so every node can cross-reference the others by @id.
export default function JsonLd({ graph }: { graph: object[] }) {
  const payload = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });

  return (
    <script
      type="application/ld+json"
      // Schema comes from our own modules, never from user input.
      dangerouslySetInnerHTML={{ __html: payload.replace(/</g, "\u003c") }}
    />
  );
}
