import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Server,
  FileText,
  CheckCircle,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PLAN_CONFIG } from "@/lib/plans";
import { Button } from "@/components/ui/button";


export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayISO = new Date().toISOString().split("T")[0];

  const [
    { data: stats7 },
    { data: stats30 },
    { count: smtpCount },
    { count: templateCount },
    { data: profile },
    { data: logs },
    { count: emailsTodayCount },
  ] = await Promise.all([
    supabase.rpc("get_email_stats", { days: 7 }),
    supabase.rpc("get_email_stats", { days: 30 }),
    supabase.from("smtp_accounts").select("*", { count: "exact", head: true }),
    supabase.from("templates").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("emails_log")
      .select("status, created_at, to_email")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("emails_log")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO),
  ]);

  /* ---------------- Derived Metrics ---------------- */

  const emailsToday = emailsTodayCount ?? 0;
  const totalCount = logs?.length ?? 0;
  const successCount =
    logs?.filter((e) => e.status === "sent").length ?? 0;

  const deliveryRate =
    totalCount > 0
      ? Math.round((successCount / totalCount) * 100)
      : 0;

  const userPlan = profile?.plan === "pro" ? "pro" : "free";
const planConfig = PLAN_CONFIG[userPlan];

const dailyLimit = planConfig.dailyLimit;
  const usagePercent = Math.min(
    (emailsToday / dailyLimit) * 100,
    100
  );

  const noSMTP = !smtpCount;
  const showUpgradeWarning =
    profile?.plan !== "pro" && usagePercent >= 80;

  /* -------------------------------------------------------------------------- */

  return (
    <div className="space-y-8 md:space-y-10 px-4 md:px-0">

      {/* Alerts */}
      <div className="space-y-4">
        {noSMTP && (
          <AlertBox
            text="No SMTP configured. Add one to start sending emails."
            link="/dashboard/smtp/new"
            linkText="Add SMTP"
          />
        )}

        {showUpgradeWarning && (
          <UpgradeBox usagePercent={usagePercent} />
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor your email infrastructure.
            </p>
          </div>

          <UsageBar
            plan={userPlan}
            usage={emailsToday}
            limit={dailyLimit}
            percent={usagePercent}
          />
        </div>

        <Button
          asChild
          size="lg"
          variant={"main"}
          disabled={noSMTP}
          className="w-full sm:w-auto"
        >
          <Link href="/dashboard/send">
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Emails Today" value={emailsToday} icon={Mail} />
        <StatCard label="SMTP Accounts" value={smtpCount ?? 0} icon={Server} />
        <StatCard label="Templates" value={templateCount ?? 0} icon={FileText} />
        <StatCard
          label="Delivery Rate"
          value={`${deliveryRate}%`}
          icon={CheckCircle}
        />
      </div>

      {/* Recent Logs */}
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">
            Recent Activity
          </h2>

          <div className="space-y-3 text-sm">
            {logs?.slice(0, 5).map((log, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b pb-2 last:border-none"
              >
                <span className="truncate">
                  {log.to_email}
                </span>
                <span
                  className={
                    log.status === "sent"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {log.status}
                </span>
              </div>
            ))}

            {logs?.length === 0 && (
              <p className="text-muted-foreground">
                No emails sent yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENTS                                   */
/* -------------------------------------------------------------------------- */

function AlertBox({
  text,
  link,
  linkText,
}: {
  text: string;
  link: string;
  linkText: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>{text}</span>
      </div>
      <Link
        href={link}
        className="sm:ml-auto text-sm font-medium underline"
      >
        {linkText}
      </Link>
    </div>
  );
}

function UpgradeBox({ usagePercent }: { usagePercent: number }) {
  return (
    <div className="bg-muted border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="font-medium">
          You're nearing your daily limit
        </p>
        <p className="text-sm text-muted-foreground">
          Upgrade to Pro for 2000 emails/day
        </p>
      </div>
      <Button asChild>
        <Link href="/billing">Upgrade</Link>
      </Button>
    </div>
  );
}

function UsageBar({
  plan,
  usage,
  limit,
  percent,
}: any) {
  return (
    <div className="flex flex-col gap-2 max-w-sm">
      <div className="flex items-center gap-3">
        <span className="text-xs bg-muted px-3 py-1 rounded-full capitalize">
          {plan ?? "free"} plan
        </span>
      </div>

      <div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {usage} / {limit} emails today
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: any) {
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition">
      <CardContent className="p-6 space-y-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-2xl md:text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
