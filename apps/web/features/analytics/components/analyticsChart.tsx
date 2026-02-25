"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

/* ---------- Normalize DB Aggregated Data ---------- */

function normalizeData(stats: any[] = [], days: number) {
  const today = new Date();
  const safeStats = Array.isArray(stats) ? stats : [];

  const map = new Map(
    safeStats.map((s) => [
      new Date(s.day).toISOString().split("T")[0],
      Number(s.count),
    ]),
  );

  return Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (days - 1 - i));
    const key = d.toISOString().split("T")[0];

    return {
      date: key.slice(5),
      count: map.get(key) ?? 0,
    };
  });
}

export default function AnalyticsChart({
  stats7 = [],
  stats30 = [],
}: {
  stats7?: any[];
  stats30?: any[];
}) {
  const [range, setRange] = useState<7 | 30>(7);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");

  /* Theme-safe primary color for SVG */
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue("--primary");
    if (primary) {
      setPrimaryColor(`${primary.trim()}`);
    }
  }, []);

  const data = useMemo(() => {
    return range === 7 ? normalizeData(stats7, 7) : normalizeData(stats30, 30);
  }, [range, stats7, stats30]);

  const total = data.reduce((acc, d) => acc + d.count, 0);

  const yesterday = data[data.length - 2]?.count ?? 0;
  const today = data[data.length - 1]?.count ?? 0;

  const trend =
    yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : 0;

  return (
    <div>
      <Card className="rounded-2xl border shadow-sm bg-card">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Email Activity ({range} Days)
              </p>

              <p className="text-2xl sm:text-3xl font-bold">{total}</p>

              <div
                className={`flex items-center gap-1 text-xs sm:text-sm font-medium mt-1 ${
                  trend >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                {trend >= 0 ? "+" : ""}
                {trend}% from yesterday
              </div>
            </div>

            {/* Toggle */}
            <div className="flex bg-muted rounded-lg p-1 w-fit">
              <button
                onClick={() => setRange(7)}
                className={`px-3 py-1 text-xs sm:text-sm rounded-md transition ${
                  range === 7
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setRange(30)}
                className={`px-3 py-1 text-xs sm:text-sm rounded-md transition ${
                  range === 30
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                30D
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={primaryColor}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={primaryColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={primaryColor}
                  strokeWidth={2.5}
                  fill="url(#colorEmails)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
