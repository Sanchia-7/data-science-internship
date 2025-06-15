import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/data-utils"
import { promises as fs } from "fs"
import path from "path"
export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), "public/data/salaries.csv")
    const csvText = await fs.readFile(filePath, "utf-8")
    const data = parseCSV(csvText)

    
    const formData = {
      job_titles: [...new Set(data.map((r) => r.job_title))].filter(Boolean).sort(),
      company_locations: [...new Set(data.map((r) => r.company_location))].filter(Boolean).sort(),
      experience_levels: [
        { value: "EN", label: "Entry Level" },
        { value: "MI", label: "Mid Level" },
        { value: "SE", label: "Senior Level" },
        { value: "EX", label: "Executive Level" },
      ],
      employment_types: [
        { value: "FT", label: "Full Time" },
        { value: "PT", label: "Part Time" },
        { value: "CT", label: "Contract" },
        { value: "FL", label: "Freelance" },
      ],
      company_sizes: [
        { value: "S", label: "Small" },
        { value: "M", label: "Medium" },
        { value: "L", label: "Large" },
      ],
    }

    return NextResponse.json(formData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to load form data" }, { status: 500 })
  }
}
