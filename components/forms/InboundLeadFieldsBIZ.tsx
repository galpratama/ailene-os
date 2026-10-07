import type { InboundLeadPayload } from "@/apis/sales";
import { leadNeeds } from "@/lib/biz-content";

const fieldClass =
  "min-h-11 w-full rounded-lg border border-biz-forest/15 bg-white px-3.5 text-sm text-biz-ink outline-none placeholder:text-biz-muted/55 focus:border-biz-forest-light focus:ring-3 focus:ring-biz-lime/25";

const labelClass = "grid gap-2 text-xs font-semibold text-biz-ink";

// The API still requires a unique company name, so a person-level key stands in for it.
export function toInboundLeadPayload(form: HTMLFormElement): InboundLeadPayload {
  const data = new FormData(form);
  const text = (key: string) => String(data.get(key) ?? "").trim();
  const name = text("name");
  const email = text("email");

  return {
    company_name: `${name} (${email})`.slice(0, 255),
    contact: {
      full_name: name,
      email: email || null,
      phone: text("phone") || null,
    },
    note: text("need") || null,
  };
}

export default function InboundLeadFieldsBIZ() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className={labelClass}>
        Nama
        <input
          name="name"
          required
          maxLength={255}
          placeholder="Nama kamu"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        No WhatsApp
        <input
          name="phone"
          type="tel"
          required
          maxLength={64}
          placeholder="08xxxxxxxxxx"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={255}
          placeholder="nama@perusahaan.com"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Kebutuhan saat ini
        <select name="need" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Pilih kebutuhan
          </option>
          {leadNeeds.map((need) => (
            <option key={need} value={need}>
              {need}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
