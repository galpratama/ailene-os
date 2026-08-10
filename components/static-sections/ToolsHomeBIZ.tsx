const tools = [
  { name: "ChatGPT", icon: "openai" },
  { name: "Gemini", icon: "googlegemini" },
  { name: "Perplexity", icon: "perplexity" },
  { name: "Claude", icon: "anthropic" },
  { name: "Copilot", icon: "githubcopilot" },
  { name: "Cursor", icon: "cursor" },
  { name: "Notion AI", icon: "notion" },
  { name: "Zapier", icon: "zapier" },
];

export default function ToolsHomeBIZ() {
  const repeatedTools = [...tools, ...tools];

  return (
    <section className="overflow-hidden border-y border-biz-forest/10 bg-biz-paper py-9.5 sm:py-11">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <p className="text-center text-[13px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">
          Belajar dengan tools apapun
        </p>
        <div className="mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="biz-marquee flex w-max [animation:biz-marquee-reverse_38s_linear_infinite] hover:[animation-play-state:paused]">
            {repeatedTools.map((tool, index) => (
              <span
                key={`${tool.name}-${index}`}
                aria-hidden={index >= tools.length}
                className="flex min-w-41 items-center justify-center gap-2.5 px-5 text-sm font-semibold text-biz-forest/65 sm:min-w-48"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.simpleicons.org/${tool.icon}/062319`}
                  alt=""
                  loading="lazy"
                  className="size-5 object-contain opacity-70"
                />
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
