import { NextResponse } from "next/server"
import { parseCSV, type SalaryRecord } from "@/lib/data-utils"
   import { promises as fs } from "fs"
import path from "path"
let cachedData: SalaryRecord[] | null = null

async function getData(): Promise<SalaryRecord[]> {
  if (cachedData) {
    return cachedData
  }

  try {
    const filePath = path.join(process.cwd(), "public", "data", "salaries.csv")
const csvText = await fs.readFile(filePath, "utf8")
    cachedData = parseCSV(csvText)
    return cachedData
  } catch (error) {
    console.error("Error loading CSV data:", error)
    return []
  }
}

export async function GET() {
  try {
    const data = await getData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 })
  }
}
