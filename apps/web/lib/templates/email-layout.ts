export type EmailTheme =
  | "indigo"
  | "green"
  | "red"
  | "pink"
  | "blue"
  | "orange";

const themeColors: Record<
  EmailTheme,
  { gradient: string; button: string; buttonText: string }
> = {
  indigo: {
    gradient: "linear-gradient(135deg,#4f46e5,#9333ea)",
    button: "#4f46e5",
    buttonText: "#ffffff",
  },
  green: {
    gradient: "linear-gradient(135deg,#16a34a,#22c55e)",
    button: "#16a34a",
    buttonText: "#ffffff",
  },
  red: {
    gradient: "linear-gradient(135deg,#dc2626,#f97316)",
    button: "#dc2626",
    buttonText: "#ffffff",
  },
  pink: {
    gradient: "linear-gradient(135deg,#ec4899,#f43f5e)",
    button: "#ec4899",
    buttonText: "#ffffff",
  },
  blue: {
    gradient: "linear-gradient(135deg,#0891b2,#06b6d4)",
    button: "#0891b2",
    buttonText: "#ffffff",
  },
  orange: {
    gradient: "linear-gradient(135deg,#ea580c,#f97316)",
    button: "#ea580c",
    buttonText: "#ffffff",
  },
};

export function buildEmailTemplate({
  theme = "indigo",
  companyName = "Your Company",
  logoUrl,
  preheader,
  title,
  subtitle,
  content,
  buttonText,
  buttonUrl,
  footerText,
}: {
  theme?: EmailTheme;
  companyName?: string;
  logoUrl?: string;
  preheader?: string;
  title: string;
  subtitle?: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}) {
  const colors = themeColors[theme];
  const year = new Date().getFullYear();

  return `
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${preheader || ""}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:36px 32px;text-align:center;background:${colors.gradient};color:#ffffff;">
              
              ${
                logoUrl
                  ? `<img src="${logoUrl}" alt="${companyName}" width="120" style="margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />`
                  : ""
              }

              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.3px;">
                ${title}
              </h1>

              ${
                subtitle
                  ? `<p style="margin:10px 0 0 0;font-size:14px;opacity:0.9;">
                      ${subtitle}
                    </p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 32px;font-size:15px;line-height:1.7;color:#374151;">
              
              ${content}

              ${
                buttonText && buttonUrl
                  ? `
                <div style="text-align:center;margin-top:32px;">
                  <a href="${buttonUrl}" 
                     target="_blank"
                     style="display:inline-block;
                            padding:14px 28px;
                            background:${colors.button};
                            color:${colors.buttonText};
                            text-decoration:none;
                            border-radius:8px;
                            font-weight:600;
                            font-size:14px;
                            border:1px solid ${colors.button};
                            box-shadow:0 4px 14px rgba(0,0,0,0.1);">
                    ${buttonText}
                  </a>
                </div>
              `
                  : ""
              }

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px;text-align:center;font-size:12px;color:#9ca3af;background:#f9fafb;">
              ${
                footerText ||
                `© ${year} ${companyName}. All rights reserved.`
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `;
}
