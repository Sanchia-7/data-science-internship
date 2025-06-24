import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    console.log("Prediction API: Starting prediction request...")
    console.log("Current working directory:", process.cwd())

    // Get absolute paths
    const projectRoot = process.cwd()
    const modelPath = path.resolve(projectRoot, "models", "xgb_model.onnx")  // Ensure ONNX model is used
    const scalerPath = path.resolve(projectRoot, "models", "scaler.onnx")  // Scaler in .onxx
    const encodersPath = path.resolve(projectRoot, "models", "label_encoders.pkl")  // Encoders in .pkl

    console.log("Checking paths:")
    console.log("Model path:", modelPath)
    console.log("Scaler path:", scalerPath)
    console.log("Encoders path:", encodersPath)

    // Check if files exist
    const modelExists = fs.existsSync(modelPath)
    const scalerExists = fs.existsSync(scalerPath)
    const encodersExists = fs.existsSync(encodersPath)

    console.log("File existence check:")
    console.log("Model exists:", modelExists)
    console.log("Scaler exists:", scalerExists)
    console.log("Encoders exists:", encodersExists)

    if (!modelExists || !scalerExists || !encodersExists) {
      const missingFiles = []
      if (!modelExists) missingFiles.push("xgb_model.onnx")
      if (!scalerExists) missingFiles.push("scaler.onnx")
      if (!encodersExists) missingFiles.push("label_encoders.pkl")

      // Try to list what's actually in the models directory
      const modelsDir = path.resolve(projectRoot, "models")
      let actualFiles = []
      try {
        if (fs.existsSync(modelsDir)) {
          actualFiles = fs.readdirSync(modelsDir)
          console.log("Files in models directory:", actualFiles)
        } else {
          console.log("Models directory does not exist")
        }
      } catch (e) {
        console.log("Error reading models directory:", e)
      }

      return NextResponse.json(
        {
          error: `Model files missing: ${missingFiles.join(", ")}. Please run the training script first.`,
          success: false,
          missingFiles,
          actualFiles,
          modelsDir,
          paths: { modelPath, scalerPath, encodersPath },
        },
        { status: 404 },
      )
    }

    const body = await request.json()
    console.log("Request body:", body)

    const { category, subCategory, city, region, state, discount, month, year, dayOfWeek, isWeekend, profitMargin } =
      body

    // Create a more robust prediction script
    const predictionScript = `\
import sys
import os
import onnxruntime as ort
import joblib
import numpy as np
import json

def main():
    try:
        # Set paths using forward slashes (works on both Windows and Unix)
        model_path = r"${modelPath.replace(/\\/g, "/")}"
        scaler_path = r"${scalerPath.replace(/\\/g, "/")}"
        encoders_path = r"${encodersPath.replace(/\\/g, "/")}"
        
        print(f"Python working directory: {os.getcwd()}")
        print(f"Loading ONNX model from: {model_path}")
        print(f"Loading scaler from: {scaler_path}")
        print(f"Loading encoders from: {encoders_path}")
        
        # Verify files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
        if not os.path.exists(encoders_path):
            raise FileNotFoundError(f"Encoders file not found: {encoders_path}")
        
        # Load ONNX model using ONNX Runtime
        sess = ort.InferenceSession(model_path)

        print("Model loaded successfully with ONNX Runtime")

        # Prepare input data - match exact feature order from training
        input_features = [
            ${category},       # Category
            ${city},           # City
            ${region},         # Region
            ${profitMargin * 100},  # Profit as absolute value estimate (optional scaling)
            ${discount},       # Discount
            ${subCategory},    # SubCategory
        ]

        input_data = np.array([input_features], dtype=np.float32)  # Ensure input is in float32 format
        print(f"Input features: {input_features}")
        print(f"Input data shape: {input_data.shape}")

        # Run inference with ONNX Runtime
        inputs = {sess.get_inputs()[0].name: input_data}
        outputs = sess.run(None, inputs)

        # Get prediction result (first output)
        prediction = outputs[0][0]
        print(f"Raw prediction: {prediction}")

        # Ensure positive prediction and reasonable bounds
        prediction = max(prediction, 100)  # Minimum ₹100
        prediction = min(prediction, 100000)  # Maximum ₹100,000

        result = {
            'prediction': float(prediction),
            'success': True,
            'input_features': input_features,
            'model_type': 'XGBRegressor (ONNX)'
        }

        print("PREDICTION_RESULT:", json.dumps(result))
        return result

    except Exception as e:
        import traceback
        error_result = {
            'error': str(e),
            'success': False,
            'traceback': traceback.format_exc()
        }
        print("PREDICTION_ERROR:", json.dumps(error_result))
        return error_result

if __name__ == "__main__":
    main()
`

    // Use '/tmp' for serverless environments (e.g., AWS Lambda or Vercel)
    const tempDir = process.env.LAMBDA_TASK_ROOT || '/tmp';  // Fallback to '/tmp' if running on Vercel or AWS Lambda
    const scriptPath = path.resolve(tempDir, 'temp_predict.py');  // Write to /tmp directory

    // Ensure the '/tmp' directory exists and create the Python script in that directory
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });  // Create directory if it doesn't exist

    // Write temporary Python script
    fs.writeFileSync(scriptPath, predictionScript);
    console.log("Temporary script written to:", scriptPath)

    // Execute Python script
    return new Promise((resolve) => {
      const python = spawn("python", [scriptPath], {
        cwd: projectRoot,
        env: { ...process.env, PYTHONPATH: projectRoot },
      })

      let output = ""
      let error = ""

      python.stdout.on("data", (data) => {
        const dataStr = data.toString()
        console.log("Python stdout:", dataStr)
        output += dataStr
      })

      python.stderr.on("data", (data) => {
        const errorStr = data.toString()
        console.log("Python stderr:", errorStr)
        error += errorStr
      })

      python.on("close", (code) => {
        console.log("Python process closed with code:", code)

        // Clean up temp file
        try {
          fs.unlinkSync(scriptPath)
        } catch (e) {
          console.error("Error cleaning up temp file:", e)
        }

        // Look for the result in the output
        const lines = output.split("\n")
        let result = null

        for (const line of lines) {
          if (line.startsWith("PREDICTION_RESULT:")) {
            try {
              result = JSON.parse(line.replace("PREDICTION_RESULT:", ""))
              break
            } catch (e) {
              console.error("Error parsing result:", e)
            }
          } else if (line.startsWith("PREDICTION_ERROR:")) {
            try {
              result = JSON.parse(line.replace("PREDICTION_ERROR:", ""))
              break
            } catch (e) {
              console.error("Error parsing error:", e)
            }
          }
        }

        if (result) {
          console.log("Final result:", result)
          resolve(NextResponse.json(result))
        } else {
          console.log("No valid result found in output")
          resolve(
            NextResponse.json({
              error: "Failed to get prediction result",
              success: false,
              output: output,
              stderr: error,
              code: code,
            }),
          )
        }
      })

      python.on("error", (err) => {
        console.error("Failed to start Python process:", err)
        resolve(
          NextResponse.json({
            error: "Failed to start Python process: " + err.message,
            success: false,
          }),
        )
      })
    })
  } catch (error) {
    console.error("Prediction API: Outer catch error:", error)
    return NextResponse.json(
      {
        error: "Prediction failed: " + error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
