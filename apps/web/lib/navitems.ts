import {
  BarChart,
  FileText,
  LayoutDashboard,
  ScrollText,
  Send,
  Server,
  Settings,
  Shield,
  Key,
} from "lucide-react";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Send Email", href: "/dashboard/send", icon: Send },
];

const configNav = [
  { name: "Templates", href: "/dashboard/templates", icon: FileText },
  { name: "SMTP", href: "/dashboard/smtp", icon: Server },
];

const analyticsNav = [
  { name: "Logs", href: "/dashboard/logs", icon: ScrollText },
  { name: "Usage", href: "/dashboard/usage", icon: BarChart },
];

const systemNav = [
  { name: "API Keys", href: "/dashboard/api", icon: Key }, 
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Security", href: "/dashboard/security", icon: Shield },
];

export const navItems = {
  mainNav,
  configNav,
  analyticsNav,
  systemNav,
};
