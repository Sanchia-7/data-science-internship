"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SalesOverviewChartProps {
  data?: Array<{ date: string; Sales: number }>
}

export function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  // Format data for chart
  const chartData = data
    ?.map((item) => {
      const date = new Date(item.date)
      return {
        month: date.toLocaleString("default", { month: "short" }),
        sales: item.Sales,
        fullDate: date,
      }
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sales Overview</CardTitle>
          <CardDescription className="text-sm">Monthly sales performance across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No sales data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Sales Overview</CardTitle>
        <CardDescription className="text-sm">Monthly sales performance across all categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Sales (₹)",
              color: "rgb(34, 127, 14)", // Tailwind green-500
            },
          }}
          className="h-[350px] sm:h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} tick={{ fontSize: 12 }} />
              <YAxis
                fontSize={12}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`₹${value.toLocaleString()}`, "Sales"]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="var(--color-sales)"
                strokeWidth={2}
                dot={{ fill: "var(--color-sales)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
