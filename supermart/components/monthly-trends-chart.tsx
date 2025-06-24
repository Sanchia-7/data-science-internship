"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NARChartProps {
  data?: Array<{ date: string; Sales: number }>
}

export function MonthlyTrendsChart({ data }: NARChartProps) {
  const chartData = data
    ?.map((item) => {
      const date = new Date(item.date)
      const profit = item.Sales * 0.2
      const discount = Math.random() * 0.1 + 0.15

      return {
        month: date.toLocaleString("default", { month: "short" }),
        sales: item.Sales,
        profit,
        fullDate: date,
      }
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">NAR Chart</CardTitle>
          <CardDescription className="text-sm">Sales and profit trends showing seasonal patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No trends data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Monthly Sales vs Profit Chart</CardTitle>
        <CardDescription className="text-sm">Sales and profit trends showing seasonal patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: { label: "Sales (₹)", color: "hsl(var(--chart-1))" },
            profit: { label: "Profit (₹)", color: "hsl(var(--chart-2))" },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="sales"
                stackId="a"
                fill="var(--color-sales)"
              />
              <Bar
                dataKey="profit"
                stackId="a"
                fill="var(--color-profit)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
