// Stage and outcome reason codes share the API's stage_code rule: a letter, then lowercase letters, digits, or underscores, 40 at most.
export const CATALOG_CODE_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;

export function codeFromName(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
    .replace(/_+$/g, "");
}
