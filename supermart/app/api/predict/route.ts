import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    console.log("Prediction API: Starting prediction request...");
    console.log("Current working directory:", process.cwd());

    // Get absolute paths for model, scaler, encoders
    const projectRoot = process.cwd();
    const modelPath = path.resolve(projectRoot, "models", "xgb_model.onnx");
    const scalerPath = path.resolve(projectRoot, "models", "scaler.onnx");
    const encodersPath = path.resolve(projectRoot, "models", "label_encoders.pkl");

    // Log paths for debugging
    console.log("Checking paths:");
    console.log("Model path:", modelPath);
    console.log("Scaler path:", scalerPath);
    console.log("Encoders path:", encodersPath);

    // Check if files exist
    const modelExists = fs.existsSync(modelPath);
    const scalerExists = fs.existsSync(scalerPath);
    const encodersExists = fs.existsSync(encodersPath);

    if (!modelExists || !scalerExists || !encodersExists) {
      const missingFiles = [];
      if (!modelExists) missingFiles.push("xgb_model.onnx");
      if (!scalerExists) missingFiles.push("scaler.onnx");
      if (!encodersExists) missingFiles.push("label_encoders.pkl");

      return NextResponse.json(
        { error: `Model files missing: ${missingFiles.join(", ")}` },
        { status: 404 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { category, subCategory, city, region, state, discount, month, year, dayOfWeek, isWeekend, profitMargin } = body;

    // Create the prediction script in Python (ensure ONNX runtime is used)
    const predictionScript = `\
import os
import json
import joblib
import numpy as np
import onnxruntime as ort

def main():
    try:
        # Paths
        model_path = r"${modelPath.replace(/\\/g, "/")}"
        scaler_path = r"${scalerPath.replace(/\\/g, "/")}"
        encoders_path = r"${encodersPath.replace(/\\/g, "/")}"

        # Load model and scaler
        sess = ort.InferenceSession(model_path)
        scaler = joblib.load(scaler_path)

        # Input features
        input_features = [${category}, ${city}, ${region}, ${profitMargin * 100}, ${discount}, ${subCategory}]
        input_data = np.array([input_features], dtype=np.float32)

        # Run inference
        inputs = {sess.get_inputs()[0].name: input_data}
        outputs = sess.run(None, inputs)

        # Prediction
        prediction = outputs[0][0]
        prediction = max(prediction, 100)
        prediction = min(prediction, 100000)

        result = {
            "prediction": float(prediction),
            "success": True,
            "input_features": input_features,
            "model_type": "XGBRegressor (ONNX)"
        }
        
        print("PREDICTION_RESULT:", json.dumps(result))
        return result

    except Exception as e:
        error_result = {
            "error": str(e),
            "success": False
        }
        print("PREDICTION_ERROR:", json.dumps(error_result))
        return error_result

if __name__ == "__main__":
    main()
`;

    // Use '/tmp' for serverless environments (e.g., AWS Lambda or Vercel)
    const tempDir = process.env.LAMBDA_TASK_ROOT || '/tmp'; // Vercel specific directory
    const scriptPath = path.resolve(tempDir, 'temp_predict.py'); // Ensure script is written in '/tmp'

    // Write the prediction script
    fs.writeFileSync(scriptPath, predictionScript);
    console.log("Temporary script written to:", scriptPath);

    // Execute the Python script using 'python'
    return new Promise((resolve) => {
      const python = spawn("python", [scriptPath], {
        cwd: projectRoot,
        env: { ...process.env, PYTHONPATH: projectRoot },
      });

      let output = "";
      let error = "";

      python.stdout.on("data", (data) => {
        const dataStr = data.toString();
        console.log("Python stdout:", dataStr);
        output += dataStr;
      });

      python.stderr.on("data", (data) => {
        const errorStr = data.toString();
        console.log("Python stderr:", errorStr);
        error += errorStr;
      });

      python.on("close", (code) => {
        console.log("Python process closed with code:", code);

        // Clean up the temporary file after execution
        try {
          fs.unlinkSync(scriptPath);
        } catch (e) {
          console.error("Error cleaning up temp file:", e);
        }

        // Look for the result in the output
        const lines = output.split("\n");
        let result = null;

        for (const line of lines) {
          if (line.startsWith("PREDICTION_RESULT:")) {
            try {
              result = JSON.parse(line.replace("PREDICTION_RESULT:", ""));
              break;
            } catch (e) {
              console.error("Error parsing result:", e);
            }
          }
        }

        if (result) {
          console.log("Final result:", result);
          resolve(NextResponse.json(result));
        } else {
          console.log("No valid result found in output");
          resolve(NextResponse.json({ error: "Failed to get prediction result", success: false, output, stderr: error, code }));
        }
      });

      python.on("error", (err) => {
        console.error("Failed to start Python process:", err);
        resolve(NextResponse.json({ error: "Failed to start Python process: " + err.message, success: false }));
      });
    });
  } catch (error) {
    console.error("Prediction API: Outer catch error:", error);
    return NextResponse.json({ error: "Prediction failed: " + error.message, success: false }, { status: 500 });
  }
}
