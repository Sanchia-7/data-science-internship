//data-science-internship/supermart/utils/predict.ts
import * as ort from "onnxruntime-web";

export async function predictWithONNX(features: number[]): Promise<number> {
  const session = await ort.InferenceSession.create("/model/supermart.onnx");
  const inputTensor = new ort.Tensor("float32", new Float32Array(features), [1, features.length]);

  const feeds = { float_input: inputTensor }; // must match training
  const results = await session.run(feeds);
  const output = Object.values(results)[0];

  return Number(output.data[0]); // your predicted sales value
}
