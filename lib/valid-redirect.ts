export function isValidRedirectUrl(url: string): boolean {
  try {
    if (url.startsWith("/")) {
      return !url.startsWith("//");
    }
    const redirect = new URL(url);
    const allowedDomains =
      process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
        ? ["os.example.com:3000"]
        : ["os.ailene.id"];

    return allowedDomains.includes(redirect.host);
  } catch {
    return false;
  }
}
