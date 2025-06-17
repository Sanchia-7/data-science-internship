export interface LaptopData {
  Company: string
  Product: string
  TypeName: string
  Inches: number
  Ram: number
  OS: string
  Weight: number
  Price_euros: number
  Screen: string
  ScreenW: number
  ScreenH: number
  Touchscreen: boolean
  IPSpanel: boolean
  RetinaDisplay: boolean
  CPU_company: string
  CPU_freq: number
  CPU_model: string
  PrimaryStorage: number
  SecondaryStorage: number
  PrimaryStorageType: string
  SecondaryStorageType: string
  GPU_company: string
  GPU_model: string
}

export async function fetchLaptopData(): Promise<LaptopData[]> {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/laptop_prices-bKQ4DG3bU5N0mEY83MNPuwIQNRPF1G.csv",
    )
    const csvText = await response.text()

    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, ""))

    const data: LaptopData[] = lines.slice(1).map((line) => {
      const values = parseCSVLine(line)
      const laptop: any = {}

      headers.forEach((header, index) => {
        const value = values[index]?.replace(/"/g, "") || ""

        switch (header) {
          case "Inches":
          case "Ram":
          case "Weight":
          case "Price_euros":
          case "ScreenW":
          case "ScreenH":
          case "CPU_freq":
          case "PrimaryStorage":
          case "SecondaryStorage":
            laptop[header] = Number.parseFloat(value) || 0
            break
          case "Touchscreen":
          case "IPSpanel":
          case "RetinaDisplay":
            laptop[header] = value.toLowerCase() === "yes"
            break
          default:
            laptop[header] = value
        }
      })

      return laptop as LaptopData
    })

    return data.filter((laptop) => laptop.Price_euros > 0) // Filter out invalid entries
  } catch (error) {
    console.error("Error fetching laptop data:", error)
    return []
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}
