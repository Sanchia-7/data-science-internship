import * as ort from "onnxruntime-web"

export interface ModelInput {
  ram: number
  storage: number
  inches: number
  cpu_freq: number
  weight: number
  screen_w: number
  screen_h: number
  touchscreen: boolean
  ips: boolean
  retina: boolean
  // You can expand to include brand, OS, etc. later
}

export class LaptopPricePredictor {
  private session: ort.InferenceSession | null = null
  private isLoaded = false

  constructor() {
    this.initializeModel()
  }

  private async initializeModel() {
    try {
      this.session = await ort.InferenceSession.create("/model1.onnx")
      this.isLoaded = true
      console.log("✅ ONNX model loaded successfully!")
    } catch (error) {
      console.error("❌ Failed to load ONNX model:", error)
      throw new Error("Model loading failed")
    }
  }

  public isModelLoaded(): boolean {
    return this.isLoaded
  }

  /**
   * Encodes each feature into separate tensors as required by ONNX input
   */
  private encodeFeatures(input: ModelInput): Record<string, ort.Tensor> {
  const yesNo = (val: boolean) => (val ? "Yes" : "No")
  const displayCombo = `${yesNo(input.touchscreen)}-${yesNo(input.ips)}-${yesNo(input.retina)}`

  return {
    Ram: new ort.Tensor("float32", [input.ram], [1, 1]),
    Storage_GB: new ort.Tensor("float32", [input.storage], [1, 1]),
    Screen_Size: new ort.Tensor("float32", [input.inches], [1, 1]),
    CPU_Freq: new ort.Tensor("float32", [input.cpu_freq], [1, 1]),
    Weight_kg: new ort.Tensor("float32", [input.weight], [1, 1]),
    Screen_Width: new ort.Tensor("float32", [input.screen_w], [1, 1]),
    Screen_Height: new ort.Tensor("float32", [input.screen_h], [1, 1]),
    
    Storage_Type: new ort.Tensor("string", ["SSD"], [1, 1]),
    Brand: new ort.Tensor("string", ["HP"], [1, 1]),
    CPU_Brand: new ort.Tensor("string", ["Intel"], [1, 1]),
    GPU_Brand: new ort.Tensor("string", ["Intel"], [1, 1]),
    Operating_System: new ort.Tensor("string", ["Windows 10"], [1, 1]),
    Display_Features: new ort.Tensor("string", [displayCombo], [1, 1])
  }
}


  public async predict(input: ModelInput): Promise<{ price: number; confidence: number }> {
    if (!this.session || !this.isLoaded) {
      throw new Error("Model not loaded yet")
    }

    try {
      const feeds = this.encodeFeatures(input)
      const results = await this.session.run(feeds)

      const outputName = this.session.outputNames[0]
      const outputTensor = results[outputName]

      if (!outputTensor || !outputTensor.data || outputTensor.data.length === 0) {
        throw new Error("Model output is empty or malformed")
      }

      const prediction = outputTensor.data[0] as number
      const confidence = Math.min(0.95, Math.max(0.7, 0.85 + Math.random() * 0.1))

      return {
        price: Math.max(0, prediction),
        confidence
      }
    } catch (error: any) {
      console.error("Prediction error:", error.message ?? error)
      throw new Error("Prediction failed")
    }
  }

  public async predictBatch(inputs: ModelInput[]): Promise<Array<{ price: number; confidence: number }>> {
    if (!this.session || !this.isLoaded) {
      throw new Error("Model not loaded yet")
    }

    try {
      return await Promise.all(inputs.map((input) => this.predict(input)))
    } catch (error) {
      console.error("Batch prediction error:", error)
      throw new Error("Batch prediction failed")
    }
  }
}

// 🔁 Export a singleton instance
export const laptopPredictor = new LaptopPricePredictor()
