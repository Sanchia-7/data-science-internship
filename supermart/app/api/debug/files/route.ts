import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    files: {},
    directories: {},
  }

  // Check for required files
  const requiredFiles = [
    "data/new_orders.csv",
    "data/processed/analytics.json",
    "data/processed/subcategories_sales_by_category.json",
    "data/processed/subcategory_by_category.json",
    "data/processed/model_metrics.json",
    "models/xgb_model.pkl",
    "models/scaler.pkl",
    "models/label_encoders.pkl",
  ]

  for (const filePath of requiredFiles) {
    const fullPath = path.join(process.cwd(), filePath)
    try {
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath)
        debug.files[filePath] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          fullPath: fullPath,
        }

        // For JSON files, try to parse and show structure
        if (filePath.endsWith(".json")) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8")
            const parsed = JSON.parse(content)
            debug.files[filePath].keys = Object.keys(parsed)
            debug.files[filePath].sampleData = Object.keys(parsed).reduce((acc, key) => {
              const value = parsed[key]
              if (typeof value === "object" && value !== null) {
                acc[key] = Array.isArray(value) ? `Array(${value.length})` : `Object(${Object.keys(value).length})`
              } else {
                acc[key] = typeof value
              }
              return acc
            }, {})
          } catch (e) {
            debug.files[filePath].parseError = e.message
          }
        }
      } else {
        debug.files[filePath] = {
          exists: false,
          fullPath: fullPath,
        }
      }
    } catch (error) {
      debug.files[filePath] = {
        exists: false,
        error: error.message,
        fullPath: fullPath,
      }
    }
  }

  // Check directories
  const requiredDirs = ["data", "data/processed", "models", "scripts"]
  for (const dirPath of requiredDirs) {
    const fullPath = path.join(process.cwd(), dirPath)
    try {
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath)
        debug.directories[dirPath] = {
          exists: true,
          files: files,
          fullPath: fullPath,
        }
      } else {
        debug.directories[dirPath] = {
          exists: false,
          fullPath: fullPath,
        }
      }
    } catch (error) {
      debug.directories[dirPath] = {
        exists: false,
        error: error.message,
        fullPath: fullPath,
      }
    }
  }

  return NextResponse.json(debug, { status: 200 })
}
