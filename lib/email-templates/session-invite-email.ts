export function buildSessionInviteApplyUrl(sessionId: number): string {
  const bizHost =
    process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
      ? "http://biz.example.com:3000"
      : "https://biz.ailene.id";
  return `${bizHost}/class-sessions/${sessionId}`;
}

export function buildSessionInviteEmailHtml(params: {
  trainerName: string;
  className: string;
  sessionName: string;
  difficulty: "BEGINNER" | "ADVANCED";
  applyUrl: string;
}): string {
  const { trainerName, className, sessionName, difficulty, applyUrl } =
    params;
  const difficultyLabel = difficulty === "ADVANCED" ? "Advanced" : "Beginner";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0;font-size:12px;font-weight:700;color:#d97706;letter-spacing:0.04em;text-transform:uppercase;">Ailene Trainer Pool</p>
                <h1 style="margin:8px 0 0 0;font-size:20px;color:#111827;">Sesi kelas baru terbuka untuk kamu</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0 32px;">
                <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#374151;">
                  Halo ${trainerName}, sesi kelas B2B baru sudah dibuka dan sesuai dengan level kamu. Buruan apply sebelum kuota penuh.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin-bottom:20px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;">Kelas</p>
                      <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#111827;">${className}</p>
                      <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;">Sesi</p>
                      <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#111827;">${sessionName}</p>
                      <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;">Level kesulitan</p>
                      <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">${difficultyLabel}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px;background-color:#111827;">
                      <a href="${applyUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Lihat &amp; apply sesi ini</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 28px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                  Kamu menerima email ini karena terdaftar di Ailene Trainer Pool dan memenuhi syarat untuk sesi ini.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
