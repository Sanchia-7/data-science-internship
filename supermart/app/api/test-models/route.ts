import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"

export async function GET() {
  try {
    const projectRoot = process.cwd()
    console.log("Project root:", projectRoot)

    const modelPath = path.resolve(projectRoot, "models", "xgb_model.pkl")
    const scalerPath = path.resolve(projectRoot, "models", "scaler.pkl")
    const encodersPath = path.resolve(projectRoot, "models", "label_encoders.pkl")

    const result = {
      projectRoot,
      paths: {
        model: modelPath,
        scaler: scalerPath,
        encoders: encodersPath,
      },
      exists: {
        model: fs.existsSync(modelPath),
        scaler: fs.existsSync(scalerPath),
        encoders: fs.existsSync(encodersPath),
      },
      sizes: {},
      modelsDirectory: {
        exists: false,
        files: [],
      },
    }

    // Get file sizes if they exist
    if (result.exists.model) {
      result.sizes.model = fs.statSync(modelPath).size
    }
    if (result.exists.scaler) {
      result.sizes.scaler = fs.statSync(scalerPath).size
    }
    if (result.exists.encoders) {
      result.sizes.encoders = fs.statSync(encodersPath).size
    }

    // Check models directory
    const modelsDir = path.resolve(projectRoot, "models")
    if (fs.existsSync(modelsDir)) {
      result.modelsDirectory.exists = true
      result.modelsDirectory.files = fs.readdirSync(modelsDir)
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
