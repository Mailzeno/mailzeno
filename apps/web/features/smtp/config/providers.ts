export interface ProviderConfig {
  id: string;
  label: string;
  host: string;
  port: number | "";
  secure: boolean;
  logo: string; 
}


export const SMTP_PROVIDERS: ProviderConfig[] = [
  {
    id: "custom",
    label: "Custom SMTP",
    host: "",
    port: "",
    secure: true,
    logo: "/providers/mailzeno.svg",
  },
  {
    id: "gmail",
    label: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    logo: "/providers/gmail.svg",
  },
  {
    id: "outlook",
    label: "Outlook",
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    logo: "/providers/outlook.png",
  },
  {
    id: "zoho",
    label: "Zoho",
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    logo: "/providers/zoho.svg",
  },
   {
    id: "Yahoo",
    label: "Yahoo",
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    logo: "/providers/yahoo.svg",
  },
  {
    id: "ses",
    label: "Amazon SES",
    host: "",
    port: 587,
    secure: false,
    logo: "/providers/ses.svg",
  },
  {
    id: "mailgun",
    label: "Mailgun",
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    logo: "/providers/mailgun.svg",
  },
];
