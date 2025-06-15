export interface SalaryRecord {
  id: string
  work_year: number
  experience_level: string
  employment_type: string
  job_title: string
  salary: number
  salary_currency: string
  salary_in_usd: number
  employee_residence: string
  remote_ratio: number
  company_location: string
  company_size: string
}

export function parseCSV(csvText: string): SalaryRecord[] {
  const lines = csvText.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, ""))

  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map((v) => v.replace(/"/g, ""))
    const record: any = {}

    headers.forEach((header, i) => {
      const value = values[i] || ""

      switch (header) {
        case "work_year":
          record[header] = Number.parseInt(value) || 2022
          break
        case "salary":
        case "salary_in_usd":
          record[header] = Number.parseInt(value) || 0
          break
        case "remote_ratio":
          record[header] = Number.parseInt(value) || 0
          break
        default:
          record[header] = value
      }
    })

    record.id = record[""] || `record-${index}`
    return record as SalaryRecord
  })
}

export function getExperienceLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    EN: "Entry Level",
    MI: "Mid Level",
    SE: "Senior Level",
    EX: "Executive Level",
  }
  return labels[level] || level
}

export function getEmploymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FT: "Full Time",
    PT: "Part Time",
    CT: "Contract",
    FL: "Freelance",
  }
  return labels[type] || type
}

export function getCompanySizeLabel(size: string): string {
  const labels: Record<string, string> = {
    S: "Small",
    M: "Medium",
    L: "Large",
  }
  return labels[size] || size
}
