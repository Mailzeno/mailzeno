import { SMTP_PROVIDERS } from "../config/providers";

export function resolveLogo(host: string) {
  const match = SMTP_PROVIDERS.find(
    (p) => p.host && host.includes(p.host)
  );

  return match?.logo || "/providers/mailzeno.svg";
}
