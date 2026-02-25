"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import AnalyticsChart from "@/features/analytics/components/analyticsChart"

export function UsageChart() {
  const [stats7, setStats7] = useState<any[]>([])
  const [stats30, setStats30] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res7, res30] = await Promise.all([
          fetch("/api/usage?range=7"),
          fetch("/api/usage?range=30"),
        ])

        const data7 = await res7.json()
        const data30 = await res30.json()

        setStats7(data7.daily || [])
        setStats30(data30.daily || [])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>

          <Skeleton className="h-[260px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <AnalyticsChart
      stats7={stats7}
      stats30={stats30}
    />
  )
}
