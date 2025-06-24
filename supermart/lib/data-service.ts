import fs from "fs"
import path from "path"

export interface AnalyticsData {
  monthly_sales: Array<{ date: string; Sales: number }>
  category_sales: Record<string, number>
  region_sales: Record<string, number>
  profit_by_category: Record<string, number>
  top_cities: Record<string, number>
  total_sales: number
  total_orders: number
  avg_order_value: number
  total_profit: number
  unique_cities: number
}

export interface ModelMetrics {
  lr_mse: number
  lr_r2: number
  xgb_mse: number
  xgb_r2: number
  best_params: Record<string, any>
  feature_names: string[]
}

export type SubcategorySalesData = Record<string, number>         // "index|Subcategory": Sales
export type SubcategoryMap = Record<string, string[]>             // "CategoryName": [Subcategory1, Subcategory2, ...]

class DataService {
  private static instance: DataService

  private analyticsData: AnalyticsData | null = null
  private modelMetrics: ModelMetrics | null = null
  private subcategorySales: SubcategorySalesData | null = null
  private subcategoryMap: SubcategoryMap | null = null

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  async loadAnalyticsData(): Promise<AnalyticsData | null> {
    if (this.analyticsData) return this.analyticsData

    try {
      const analyticsPath = path.join(process.cwd(), "data", "processed", "analytics.json")
      if (!fs.existsSync(analyticsPath)) return null

      const data = fs.readFileSync(analyticsPath, "utf-8")
      this.analyticsData = JSON.parse(data)
      return this.analyticsData
    } catch (error) {
      console.error("Error loading analytics data:", error)
      return null
    }
  }

  async loadModelMetrics(): Promise<ModelMetrics | null> {
    if (this.modelMetrics) return this.modelMetrics

    try {
      const metricsPath = path.join(process.cwd(), "data", "processed", "model_metrics.json")
      if (!fs.existsSync(metricsPath)) return null

      const data = fs.readFileSync(metricsPath, "utf-8")
      this.modelMetrics = JSON.parse(data)
      return this.modelMetrics
    } catch (error) {
      console.error("Error loading model metrics:", error)
      return null
    }
  }

  async loadSubcategorySales(): Promise<SubcategorySalesData | null> {
    if (this.subcategorySales) return this.subcategorySales

    try {
      const filePath = path.join(process.cwd(), "data", "processed", "subcategories_sales_by_category.json")
      if (!fs.existsSync(filePath)) return null

      const data = fs.readFileSync(filePath, "utf-8")
      this.subcategorySales = JSON.parse(data)
      return this.subcategorySales
    } catch (error) {
      console.error("Error loading subcategory sales data:", error)
      return null
    }
  }

  async loadSubcategoryMap(): Promise<SubcategoryMap | null> {
    if (this.subcategoryMap) return this.subcategoryMap

    try {
      const filePath = path.join(process.cwd(), "data", "processed", "subcategory_by_category.json")
      if (!fs.existsSync(filePath)) return null

      const data = fs.readFileSync(filePath, "utf-8")
      this.subcategoryMap = JSON.parse(data)
      return this.subcategoryMap
    } catch (error) {
      console.error("Error loading subcategory map:", error)
      return null
    }
  }

  clearCache(): void {
    this.analyticsData = null
    this.modelMetrics = null
    this.subcategorySales = null
    this.subcategoryMap = null
  }
}

export const dataService = DataService.getInstance()
