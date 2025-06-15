import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/data-utils"
import { promises as fs } from "fs"
import path from "path"
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobTitle = searchParams.get("job_title")
    const workYear = searchParams.get("work_year")
    const experienceLevel = searchParams.get("experience_level")



    const filePath = path.join(process.cwd(), "public", "data", "salaries.csv")
    const csvText = await fs.readFile(filePath, "utf8")

    const data = parseCSV(csvText)

    let filteredData = data

    if (jobTitle) {
      filteredData = filteredData.filter((record) => record.job_title === jobTitle)
    }

    if (workYear) {
      filteredData = filteredData.filter((record) => record.work_year === Number.parseInt(workYear))
    }

    if (experienceLevel) {
      filteredData = filteredData.filter((record) => record.experience_level === experienceLevel)
    }

    // Calculate analytics
    const analytics = {
      // Average salary by experience level
      salaryByExperience: Object.entries(
        filteredData.reduce(
          (acc, record) => {
            const level = record.experience_level
            if (!acc[level]) acc[level] = { total: 0, count: 0 }
            acc[level].total += record.salary_in_usd
            acc[level].count += 1
            return acc
          },
          {} as Record<string, { total: number; count: number }>,
        ),
      ).map(([level, data]) => ({
        experience_level: level,
        salary: Math.round(data.total / data.count),
      })),

      // Top paying job titles
      topJobTitles: Object.entries(
        data.reduce(
          (acc, record) => {
            const title = record.job_title
            if (!acc[title]) acc[title] = { total: 0, count: 0 }
            acc[title].total += record.salary_in_usd
            acc[title].count += 1
            return acc
          },
          {} as Record<string, { total: number; count: number }>,
        ),
      )
        .map(([title, data]) => ({
          job_title: title,
          salary: Math.round(data.total / data.count),
          count: data.count,
        }))
        .sort((a, b) => b.salary - a.salary)
        .slice(0, 15),

      // Yearly trends
      yearlyTrends: Object.entries(
        (jobTitle ? filteredData : data).reduce(
          (acc, record) => {
            const year = record.work_year
            if (!acc[year]) acc[year] = { total: 0, count: 0 }
            acc[year].total += record.salary_in_usd
            acc[year].count += 1
            return acc
          },
          {} as Record<number, { total: number; count: number }>,
        ),
      )
        .map(([year, data]) => ({
          work_year: Number.parseInt(year),
          salary: Math.round(data.total / data.count),
        }))
        .sort((a, b) => a.work_year - b.work_year),

      // Company size distribution
      companySizeDistribution: Object.entries(
        filteredData.reduce(
          (acc, record) => {
            const size = record.company_size
            acc[size] = (acc[size] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
      ).map(([size, count]) => ({
        company_size: size,
        count,
      })),

      // Remote work analysis
      remoteWorkAnalysis: Object.entries(
        filteredData.reduce(
          (acc, record) => {
            const ratio = record.remote_ratio
            const bucket = ratio === 0 ? "On-site" : ratio === 50 ? "Hybrid" : ratio === 100 ? "Remote" : "Other"
            if (!acc[bucket]) acc[bucket] = { total: 0, count: 0 }
            acc[bucket].total += record.salary_in_usd
            acc[bucket].count += 1
            return acc
          },
          {} as Record<string, { total: number; count: number }>,
        ),
      ).map(([type, data]) => ({
        work_type: type,
        salary: Math.round(data.total / data.count),
        count: data.count,
      })),

      // Location-based salary analysis
      locationAnalysis: Object.entries(
        filteredData.reduce(
          (acc, record) => {
            const loc = record.company_location
            if (!acc[loc]) acc[loc] = { total: 0, count: 0 }
            acc[loc].total += record.salary_in_usd
            acc[loc].count += 1
            return acc
          },
          {} as Record<string, { total: number; count: number }>
        )
      ).map(([location, data]) => ({
        location,
        salary: Math.round(data.total / data.count),
        count: data.count,
      })).sort((a, b) => b.salary - a.salary),

    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 })
  }
}
