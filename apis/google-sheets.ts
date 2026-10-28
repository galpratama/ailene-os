import "server-only";

import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SHEETS_BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

// The spreadsheet must be shared with this service account's email as Editor.
function serviceAccount() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !privateKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured");
  }
  // A single-line env value keeps the key's line breaks as escaped "\n".
  return { email, privateKey: privateKey.replace(/\\n/g, "\n") };
}

// Service-account OAuth: a self-signed RS256 JWT is exchanged for a one-hour access token.
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { email, privateKey } = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const unsigned = [
    base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64Url(
      JSON.stringify({
        iss: email,
        scope: SHEETS_SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      })
    ),
  ].join(".");
  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${base64Url(signature)}`,
    }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || typeof data?.access_token !== "string") {
    throw new Error(`token request failed (${response.status})`);
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

function sheetRange(sheetName: string, cells: string) {
  return encodeURIComponent(`'${sheetName.replace(/'/g, "''")}'!${cells}`);
}

// Writes `header` first while row 1 is empty; RAW keeps an answer starting with "=" as text, not a formula.
export async function appendSheetRows(
  spreadsheetId: string,
  sheetName: string,
  rows: string[][],
  header?: string[]
): Promise<boolean> {
  try {
    const token = await getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let values = rows;
    if (header) {
      const firstRow = await fetch(
        `${SHEETS_BASE_URL}/${spreadsheetId}/values/${sheetRange(sheetName, "A1:A1")}`,
        { headers, cache: "no-store" }
      );
      if (!firstRow.ok) {
        throw new Error(`header read failed (${firstRow.status})`);
      }
      const existing = await firstRow.json();
      if (!existing?.values?.length) values = [header, ...rows];
    }

    const response = await fetch(
      `${SHEETS_BASE_URL}/${spreadsheetId}/values/${sheetRange(sheetName, "A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ values }),
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error(
        `append failed (${response.status}): ${await response.text()}`
      );
    }
    return true;
  } catch (err) {
    console.error("appendSheetRows:", sheetName, err);
    return false;
  }
}
