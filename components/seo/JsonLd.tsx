// Emits one @graph script so every node can cross-reference the others by @id.
export default function JsonLd({ graph }: { graph: object[] }) {
  const payload = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });

  return (
    <script
      type="application/ld+json"
      // Article graphs carry CMS text, so escape "<" to keep a "</script>" in a title from closing the tag.
      dangerouslySetInnerHTML={{ __html: payload.replace(/</g, "\\u003c") }}
    />
  );
}
