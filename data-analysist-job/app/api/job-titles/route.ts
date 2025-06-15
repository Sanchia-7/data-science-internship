import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/data-utils"
   import { promises as fs } from "fs"
import path from "path"
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "salaries.csv")
const csvText = await fs.readFile(filePath, "utf8")
    const data = parseCSV(csvText)

    const jobTitles = [...new Set(data.map((record) => record.job_title))].filter((title) => title).sort()

    return NextResponse.json(jobTitles)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load job titles" }, { status: 500 })
  }
}
