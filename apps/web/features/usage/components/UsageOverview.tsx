"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


interface UsageData {
  today: number
  month: number
  plan: string
  limit: number | null
}

export function UsageOverview() {
  const [data, setData] = useState<UsageData | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/usage")
      if (!res.ok) return
      const json = await res.json()
      setData(json)
    }

    fetchData()
  }, [])

  if (!data) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}


  const percent =
    data.limit && data.limit > 0
      ? Math.min((data.month / data.limit) * 100, 100)
      : 0

  const nearLimit = percent >= 80

  return (
    <div className="space-y-6">

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Today" value={data.today} />
        <StatCard label="This Month" value={data.month} />
        <StatCard label="Plan" value={data.plan} capitalize />
        <StatCard
          label="Monthly Limit"
          value={data.limit === null ? "Unlimited" : data.limit}
        />
      </div>

      {/* Progress Bar */}
      {data.limit !== null && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Monthly Usage</span>
              <span>
                {data.month} / {data.limit}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>

            {nearLimit && (
              <p className="text-sm text-yellow-600">
                ⚠ You're nearing your monthly limit.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  capitalize,
}: {
  label: string
  value: any
  capitalize?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-xl font-semibold ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
