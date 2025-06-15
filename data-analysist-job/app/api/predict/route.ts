// import { NextResponse } from "next/server"
// import { parseCSV } from "@/lib/data-utils"
// import { SalaryPredictor, type PredictionFeatures } from "@/lib/ml-utils"
//    import { promises as fs } from "fs"
// import path from "path"
// let predictor: SalaryPredictor | null = null

// async function getPredictor(): Promise<SalaryPredictor> {
//   if (predictor) {
//     return predictor
//   }

//   try {
//     const response = await fetch(
//       process.env.VERCEL_URL
//         ? `https://${process.env.VERCEL_URL}/data/salaries.csv`
//         : "http://localhost:3000/data/salaries.csv",
//     )
//     const csvText = await response.text()
//     const data = parseCSV(csvText)

//     predictor = new SalaryPredictor()
//     predictor.train(data)

//     return predictor
//   } catch (error) {
//     console.error("Error initializing predictor:", error)
//     throw new Error("Failed to initialize salary predictor")
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const features: PredictionFeatures = await request.json()

//     // Validate required fields
//     const requiredFields = [
//       "work_year",
//       "experience_level",
//       "employment_type",
//       "job_title",
//       "company_size",
//       "remote_ratio",
//       "company_location",
//     ]
//     for (const field of requiredFields) {
//       if (!(field in features)) {
//         return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
//       }
//     }

//     const predictor = await getPredictor()
//     const result = predictor.predict(features)

//     return NextResponse.json(result)
//   } catch (error) {
//     console.error("Prediction error:", error)
//     return NextResponse.json({ error: "Failed to generate prediction" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server"
import { parseCSV } from "@/lib/data-utils"
import { SalaryPredictor, type PredictionFeatures } from "@/lib/ml-utils"
import { promises as fs } from "fs"
import path from "path"

let predictor: SalaryPredictor | null = null

async function getPredictor(): Promise<SalaryPredictor> {
  if (predictor) return predictor

  try {
    const filePath = path.join(process.cwd(), "public", "data", "salaries.csv")
    const csvText = await fs.readFile(filePath, "utf8")
    const data = parseCSV(csvText)

    predictor = new SalaryPredictor()
    predictor.train(data)
    return predictor
  } catch (error) {
    console.error("Error initializing predictor:", error)
    throw new Error("Failed to initialize salary predictor")
  }
}

export async function POST(request: Request) {
  try {
    const features: PredictionFeatures = await request.json()

    const requiredFields = [
      "work_year", "experience_level", "employment_type",
      "job_title", "company_size", "remote_ratio", "company_location"
    ]

    for (const field of requiredFields) {
      if (!(field in features)) {
        console.error("Missing field:", field)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const predictor = await getPredictor()
    const result = predictor.predict(features)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("Prediction error:", error.message || error)
    return NextResponse.json({ error: "Failed to generate prediction", details: error.message }, { status: 500 })
  }
}