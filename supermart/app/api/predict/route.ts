import { NextRequest, NextResponse } from "next/server";
import * as ort from "onnxruntime-node"; // Import ONNX Runtime for Node.js
import path from "path";
import fs from "fs";

// Endpoint for prediction
export async function POST(request: NextRequest) {
  try {
    // Extract input features from the request body
    const body = await request.json();
    console.log("Request body:", body);

    // Prepare the input features for prediction
    const input_features = [
      body.category,          // Category
      body.city,              // City
      body.region,            // Region
      body.profitMargin * 100, // Profit Margin (scaled)
      body.discount,          // Discount
      body.subCategory        // SubCategory
    ];

    const input_data = new ort.Tensor('float32', new Float32Array(input_features), [1, input_features.length]);

    // Load the ONNX model and scaler from the public directory
    const modelPath = path.resolve(process.cwd(), "public", "models", "xgb_model.onnx");
    const scalerPath = path.resolve(process.cwd(), "public", "models", "scaler.onnx");

    // Check if the model and scaler files exist in the public directory
    if (!fs.existsSync(modelPath) || !fs.existsSync(scalerPath)) {
      return NextResponse.json(
        { success: false, error: "Model or scaler file is missing" },
        { status: 500 }
      );
    }

    // Run inference using ONNX Runtime for model
    const modelSession = await ort.InferenceSession.create(modelPath);

    // Prepare the input tensor for the model
    const feeds = { input: input_data };

    // Get the model outputs
    const results = await modelSession.run(feeds);
    console.log("Model outputs:", results);

    // Access the 'variable' output tensor
    const predictionTensor = results.variable;
    if (!predictionTensor) {
      throw new Error("Model did not return 'variable' tensor");
    }

    // Get the prediction value from the tensor
    const prediction = predictionTensor.data[0];
    console.log("Raw prediction:", prediction);

    // Apply bounds to the prediction
    const boundedPrediction = Math.min(Math.max(prediction, 100), 100000);

    return NextResponse.json({
      success: true,
      prediction: boundedPrediction,
      input_features,
      model_type: "XGBRegressor (ONNX)"
    });

  } catch (error) {
    console.error("Error during prediction:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
