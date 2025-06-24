import { NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

export async function GET() {
  try {
    console.log("Analytics API: Starting to load data...")
    const analyticsData = await dataService.loadAnalyticsData()

    if (!analyticsData) {
      console.log("Analytics API: No data returned from service")
      return NextResponse.json(
        { error: "Analytics data not available. Please run the training script first." },
        { status: 404 },
      )
    }

    console.log("Analytics API: Data loaded successfully")
    console.log("Analytics API: Keys in data:", Object.keys(analyticsData))

    // Log sample data for debugging
    if (analyticsData.category_sales) {
      console.log("Analytics API: Category sales sample:", analyticsData.category_sales)
    }
    if (analyticsData.region_sales) {
      console.log("Analytics API: Region sales sample:", analyticsData.region_sales)
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Analytics API: Error loading data:", error)
    return NextResponse.json(
      { error: "Failed to load analytics data. Please run the training script first." },
      { status: 500 },
    )
  }
}
