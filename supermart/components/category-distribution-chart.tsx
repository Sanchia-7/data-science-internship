"use client"

import React, { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SubcategoryData {
  [key: string]: number // key = "CategoryIndex|Subcategory"
}

interface CategoryDistributionChartProps {
  data?: SubcategoryData
}

const categoryNames = [
  "Beverages",
  "Egg, Meat & Fish",
  "Food Grains",
  "Fruits & Veggies",
  "Oil & Masala",
  "Snacks & Branded",
  "Kitchen & Garden",
  "Gourmet Food",
  "Baby Care",
  "Cleaning",
  "Beauty & Hygiene",
]

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
  "#a4de6c", "#d0ed57", "#fa8072", "#b084cc", "#ffb6b9",
]

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories")

const chartData = useMemo(() => {
  if (!data) return []

  const result: Record<string, { subcategory: string; sales: number; profit: number }> = {}

  Object.entries(data).forEach(([key, sales]) => {
    const [catIdx, subcat] = key.split("|")
    const category = categoryNames[parseInt(catIdx)] || `Category ${catIdx}`
    const profit = sales * 0.2

    const shouldInclude =
      selectedCategory === "All Categories" || selectedCategory === category

    if (!shouldInclude) return

    if (!result[subcat]) {
      result[subcat] = { subcategory: subcat, sales: 0, profit: 0 }
    }

    result[subcat].sales += sales
    result[subcat].profit += profit
  })

  return Object.values(result).sort((a, b) => b.sales - a.sales)
}, [data, selectedCategory])

  const allCategoryData = useMemo(() => {
    if (!data) return {}

    const grouped: Record<string, Array<{ subcategory: string; sales: number; profit: number }>> = {}

    Object.entries(data).forEach(([key, sales]) => {
      const [catIdx, subcat] = key.split("|")
      const category = categoryNames[parseInt(catIdx)] || `Category ${catIdx}`
      const profit = sales * 0.2

      if (!grouped[category]) grouped[category] = []
      grouped[category].push({ subcategory: subcat, sales, profit })
    })

    return grouped
  }, [data])

  
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sales by Subcategory</CardTitle>
          <CardDescription className="text-sm">Revenue distribution across subcategories</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No subcategory data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Sales vs Profit by Subcategory</CardTitle>
        <CardDescription className="text-sm">Select a category to view detailed breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 w-64">
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              {Object.keys(allCategoryData).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {selectedCategory && chartData.length > 0 && (
          <ChartContainer
            config={{
              sales: { label: "Sales (₹)", color: "hsl(var(--chart-1))" },
              profit: { label: "Profit (₹)", color: "hsl(var(--chart-2))" },
            }}
            className="h-[350px] sm:h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subcategory"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                  interval={0}
                />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} fontSize={12} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: any, name: string) => [`₹${value.toLocaleString()}`, name]}
                />
                <Legend verticalAlign="top" align="right" />
                <Bar dataKey="sales" fill={COLORS[0]} name="Sales" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill={COLORS[1]} name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
