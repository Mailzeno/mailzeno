import { UsageOverview } from "@/features/usage/components/UsageOverview"
import { UsageChart } from "@/features/usage/components/UsageChart"

export default function UsagePage() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-4xl space-y-8 py-10">
        <div>
          <h1 className="text-2xl font-semibold">Usage</h1>
          <p className="text-muted-foreground text-sm">
            Monitor your email sending activity and plan limits.
          </p>
        </div>

        <UsageOverview />
        <UsageChart />
      </div>
    </div>
  )
}
