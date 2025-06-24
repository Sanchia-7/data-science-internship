import { NextRequest, NextResponse } from "next/server";
import * as ort from "onnxruntime-node"; // Import ONNX Runtime
import path from "path";

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

    // Ensure input features are in the expected format for the model
    const input_data = new ort.Tensor('float32', new Float32Array(input_features), [1, input_features.length]);

    // Load the ONNX model (from the models folder)
    const modelPath = path.resolve(process.cwd(), "models", "xgb_model.onnx");

    // Run inference using ONNX Runtime
    const session = await ort.InferenceSession.create(modelPath);

    // Prepare the input tensor for the model
    const feeds = { input: input_data }; // Ensure the input name matches your model's expected input name

    // Get the model outputs
    const results = await session.run(feeds);

    // Log the available output tensors
    console.log("Model outputs:", results);

    // Check if 'variable' tensor exists and access its data
    const predictionTensor = results.variable;
    if (!predictionTensor) {
      throw new Error("Model did not return 'variable' tensor");
    }

    // Get the prediction value from the tensor
    const prediction = predictionTensor.data[0];
    console.log("Raw prediction:", prediction);

    // Apply bounds to the prediction
    const boundedPrediction = Math.min(Math.max(prediction, 100), 100000);  // Ensuring prediction is between 100 and 100000

    // Return the result
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
