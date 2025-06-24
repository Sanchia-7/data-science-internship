import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"

export async function GET() {
  try {
    // Get the root directory of the project
    const projectRoot = process.cwd()
    console.log("Project root:", projectRoot)

    // Define the paths to the model files
    const modelPath = path.resolve(projectRoot, "models", "xgb_model.onnx")
    const scalerPath = path.resolve(projectRoot, "models", "scaler.onnx")
    const encodersPath = path.resolve(projectRoot, "models", "label_encoders.pkl")

    // Initialize the result object with model information
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

    // Get file sizes for each model if they exist
    if (result.exists.model) {
      result.sizes.model = fs.statSync(modelPath).size
    }
    if (result.exists.scaler) {
      result.sizes.scaler = fs.statSync(scalerPath).size
    }
    if (result.exists.encoders) {
      result.sizes.encoders = fs.statSync(encodersPath).size
    }

    // Check if the models directory exists and list its contents
    const modelsDir = path.resolve(projectRoot, "models")
    if (fs.existsSync(modelsDir)) {
      result.modelsDirectory.exists = true
      result.modelsDirectory.files = fs.readdirSync(modelsDir)
    }

    // Return the result object as JSON
    return NextResponse.json(result)
  } catch (error) {
    // If there's an error, return an error message
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
