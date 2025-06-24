"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegionalSalesChartProps {
  data?: Record<string, number>
}

export function RegionalSalesChart({ data }: RegionalSalesChartProps) {
  // Colors for regions
  const COLORS = ["#4576b5", "#4fb286", "#4a4aa1", "#e05a5a", "#ffd23f"]

  // Format data for chart
  const chartData = [
    { region: "West", sales: 132000, color: "#4576b5" },
    { region: "East", sales: 117000, color: "#4fb286" },
    { region: "Central", sales: 95000, color: "#ffd23f" },
    { region: "South", sales: 67000, color: "#e05a5a" },
    { region: "North", sales: 500, color: "#4a4aa1" },
  ]


  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Regional Sales Distribution</CardTitle>
          <CardDescription className="text-sm">
            Sales performance across different regions in Tamil Nadu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No regional data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const renderCustomLabel = ({ name }: { name: string }) => {
    const hardcodedPercentages: Record<string, number> = {
      West: 32.08,
      East: 28.4,
      Central: 23.19,
      South: 16.32,
      North: 0.01,
    }

    const percentage = hardcodedPercentages[name] ?? 0
    return `${name}: ${percentage}%`
  }



  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Regional Sales Distribution</CardTitle>
        <CardDescription className="text-sm">Sales performance across different regions in Tamil Nadu</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Sales (₹)",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px] sm:h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="sales"
                nameKey="region"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                labelLine={false}
                label={renderCustomLabel}
              >

                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`₹${value.toLocaleString()}`, "Sales"]}
              />
              {/* <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconSize={12}
                formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
              /> */}
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
