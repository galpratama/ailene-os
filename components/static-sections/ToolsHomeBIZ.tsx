import PageMargin from "@/components/layouts/PageMargin";

const tools = [
  { name: "ChatGPT", icon: "chatgpt", color: "seagreen" },
  { name: "Gemini", icon: "googlegemini", color: "mediumpurple" },
  { name: "Perplexity", icon: "perplexity", color: "darkturquoise" },
  { name: "Claude", icon: "anthropic", color: "coral" },
  { name: "Copilot", icon: "githubcopilot", color: "royalblue" },
  { name: "Cursor", icon: "cursor", color: "blueviolet" },
  { name: "Notion AI", icon: "notion", color: "slategray" },
  { name: "Zapier", icon: "zapier", color: "orangered" },
];

export default function ToolsHomeBIZ() {
  const repeatedTools = [...tools, ...tools];

  return (
    <section className="overflow-hidden border-y border-biz-forest/10 bg-biz-paper py-9.5 sm:py-11">
      <PageMargin>
        <div className="flex justify-center">
          <p className="biz-topic-label text-center">Belajar dengan tools apapun</p>
        </div>
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
                  src={
                    tool.icon === "chatgpt"
                      ? "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64"
                      : `https://cdn.simpleicons.org/${tool.icon}/${tool.color}`
                  }
                  alt=""
                  loading="lazy"
                  className="size-5 object-contain opacity-100"
                />
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      </PageMargin>
    </section>
  );
}
