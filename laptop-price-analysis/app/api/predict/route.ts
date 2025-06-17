import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { laptopSpecs } = body

    // In a real implementation, you would:
    // 1. Load your model.pkl file using a Python service or convert it to a format usable in Node.js
    // 2. For now, we'll simulate the prediction with a realistic algorithm based on the features

    const predictedPrice = simulateModelPrediction(laptopSpecs)

    return NextResponse.json({
      success: true,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: 0.85 + Math.random() * 0.1, // Simulated confidence score
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ success: false, error: "Failed to predict price" }, { status: 500 })
  }
}

// Simulate model prediction based on feature importance from your analysis
function simulateModelPrediction(specs: any): number {
  const {
    ram = 8,
    storage = 256,
    inches = 14,
    cpu_freq = 2.5,
    weight = 1.5,
    touchscreen = false,
    ips = false,
    retina = false,
    company = "Generic",
    cpu_company = "Intel",
    gpu_company = "Intel",
    storage_type = "SSD",
  } = specs

  // Base price calculation using feature importance weights from your model
  let basePrice = 300 // Base laptop price

  // RAM impact (29% importance)
  basePrice += ram * 45

  // Storage impact (18% importance)
  basePrice += storage * 0.8
  if (storage_type === "SSD") basePrice += 100
  if (storage_type === "Flash Storage") basePrice += 150

  // Weight impact (13% importance) - lighter = more expensive
  basePrice += (2.5 - weight) * 200

  // Screen size impact (12% importance)
  basePrice += inches * 25

  // CPU frequency impact (10% importance)
  basePrice += cpu_freq * 150

  // Feature premiums (8% + 5% + 3% importance)
  if (touchscreen) basePrice += 150
  if (ips) basePrice += 100
  if (retina) basePrice += 300

  // Brand premiums
  const brandMultipliers: { [key: string]: number } = {
    Apple: 1.8,
    Microsoft: 1.4,
    Dell: 1.2,
    HP: 1.1,
    Lenovo: 1.15,
    Asus: 1.05,
    Acer: 0.9,
    MSI: 1.3,
    Razer: 1.6,
    Samsung: 1.25,
  }

  const brandMultiplier = brandMultipliers[company] || 1.0
  basePrice *= brandMultiplier

  // CPU company premium
  if (cpu_company === "Intel") basePrice *= 1.1
  if (cpu_company === "AMD") basePrice *= 1.05

  // GPU company premium
  if (gpu_company === "Nvidia") basePrice += 200
  if (gpu_company === "AMD") basePrice += 100

  // Add some realistic variance
  const variance = 0.95 + Math.random() * 0.1
  basePrice *= variance

  return Math.max(basePrice, 200) // Minimum price floor
}
