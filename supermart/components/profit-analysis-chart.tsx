"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfitAnalysisChartProps {
  data?: Record<string, number>
}

export function ProfitAnalysisChart({ data }: ProfitAnalysisChartProps) {
  // Format data for chart
  const chartData = data
    ? Object.entries(data)
        .map(([category, profit]) => ({
          category: `Category ${category}`,
          profit,
          margin: profit / (profit * 5), // Estimate margin based on profit
        }))
        .sort((a, b) => b.profit - a.profit)
    : []

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Profit Analysis by Category</CardTitle>
          <CardDescription className="text-sm">Profitability breakdown across product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No profit data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Profit Analysis by Category</CardTitle>
        <CardDescription className="text-sm">Profitability breakdown across product categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            profit: {
              label: "Profit (₹)",
              color: "hsl(var(--chart-4))",
            },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`₹${value.toLocaleString()}`, "Profit"]}
              />
              <Bar dataKey="profit" fill="var(--color-profit)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
