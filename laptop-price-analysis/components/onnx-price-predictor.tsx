//data-science-internship/laptop-price-analysis/components/onnx-price-predictor.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calculator, TrendingUp, AlertCircle, Zap, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { laptopPredictor, type ModelInput } from "@/lib/onnx-model"

export function ONNXPricePredictor() {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<{ price: number; confidence: number } | null>(null)

  const [specs, setSpecs] = useState<ModelInput>({
    ram: 8,
    storage: 256,
    inches: 14,
    cpu_freq: 2.5,
    weight: 1.5,
    screen_w: 1920,
    screen_h: 1080,
    touchscreen: false,
    ips: false,
    retina: false,
    company: "Dell",
    cpu_company: "Intel",
    gpu_company: "Intel",
    storage_type: "SSD",
    os: "Windows 10",
  })

  useEffect(() => {
    const checkModelStatus = () => {
      if (laptopPredictor.isModelLoaded()) {
        setModelLoaded(true)
        setLoading(false)
      } else {
        setTimeout(checkModelStatus, 500)
      }
    }

    setLoading(true)
    checkModelStatus()
  }, [])

  const handlePredict = async () => {
    if (!modelLoaded) {
      setError("Model is still loading. Please wait.")
      return
    }

    setPredicting(true)
    setError(null)

    try {
      const result = await laptopPredictor.predict(specs)
      setPrediction(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed")
    } finally {
      setPredicting(false)
    }
  }

  const updateSpecs = (key: keyof ModelInput, value: any) => {
    setSpecs((prev) => ({ ...prev, [key]: value }))
    setPrediction(null) // Clear previous prediction
  }

  const handleQuickPreset = (preset: "budget" | "mid" | "high") => {
    const presets = {
      budget: {
        ram: 8,
        storage: 256,
        inches: 15.6,
        cpu_freq: 2.1,
        weight: 2.2,
        screen_w: 1366,
        screen_h: 768,
        touchscreen: false,
        ips: false,
        retina: false,
        company: "Acer",
        cpu_company: "Intel",
        gpu_company: "Intel",
        storage_type: "HDD",
        os: "Windows 10",
      },
      mid: {
        ram: 16,
        storage: 512,
        inches: 14,
        cpu_freq: 2.8,
        weight: 1.5,
        screen_w: 1920,
        screen_h: 1080,
        touchscreen: true,
        ips: true,
        retina: false,
        company: "Dell",
        cpu_company: "Intel",
        gpu_company: "Intel",
        storage_type: "SSD",
        os: "Windows 10",
      },
      high: {
        ram: 32,
        storage: 1024,
        inches: 16,
        cpu_freq: 3.2,
        weight: 1.8,
        screen_w: 3072,
        screen_h: 1920,
        touchscreen: true,
        ips: true,
        retina: true,
        company: "Apple",
        cpu_company: "Intel",
        gpu_company: "AMD",
        storage_type: "SSD",
        os: "Mac OS X",
      },
    }

    setSpecs(presets[preset])
    setPrediction(null)
  }



  
  return (
    <div className="space-y-6">
      {/* Model Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading ONNX model...</span>
                </>
              ) : modelLoaded ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">Model loaded successfully</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">Model failed to load</span>
                </>
              )}
            </div>
            <Badge variant={modelLoaded ? "default" : "secondary"}>{modelLoaded ? "Ready" : "Loading"}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Laptop Specifications
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleQuickPreset("budget")}>
                Budget Preset
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickPreset("mid")}>
                Mid-range Preset
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickPreset("high")}>
                High-end Preset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ram">RAM (GB)</Label>
                <Select
                  value={specs.ram.toString()}
                  onValueChange={(value) => updateSpecs("ram", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 GB</SelectItem>
                    <SelectItem value="4">4 GB</SelectItem>
                    <SelectItem value="8">8 GB</SelectItem>
                    <SelectItem value="16">16 GB</SelectItem>
                    <SelectItem value="32">32 GB</SelectItem>
                    <SelectItem value="64">64 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Select
                  value={specs.storage.toString()}
                  onValueChange={(value) => updateSpecs("storage", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128 GB</SelectItem>
                    <SelectItem value="256">256 GB</SelectItem>
                    <SelectItem value="512">512 GB</SelectItem>
                    <SelectItem value="1024">1 TB</SelectItem>
                    <SelectItem value="2048">2 TB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inches">Screen Size (inches)</Label>
                <Input
                  id="inches"
                  type="number"
                  step="0.1"
                  min="10"
                  max="18"
                  value={specs.inches}
                  onChange={(e) => updateSpecs("inches", Number.parseFloat(e.target.value) || 14)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpu_freq">CPU Frequency (GHz)</Label>
                <Input
                  id="cpu_freq"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={specs.cpu_freq}
                  onChange={(e) => updateSpecs("cpu_freq", Number.parseFloat(e.target.value) || 2.5)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={specs.weight}
                  onChange={(e) => updateSpecs("weight", Number.parseFloat(e.target.value) || 1.5)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage_type">Storage Type</Label>
                <Select value={specs.storage_type} onValueChange={(value) => updateSpecs("storage_type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDD">HDD</SelectItem>
                    <SelectItem value="SSD">SSD</SelectItem>
                    <SelectItem value="Flash Storage">Flash Storage</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Brand</Label>
                <Select value={specs.company} onValueChange={(value) => updateSpecs("company", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acer">Acer</SelectItem>
                    <SelectItem value="Apple">Apple</SelectItem>
                    <SelectItem value="Asus">Asus</SelectItem>
                    <SelectItem value="Dell">Dell</SelectItem>
                    <SelectItem value="HP">HP</SelectItem>
                    <SelectItem value="Lenovo">Lenovo</SelectItem>
                    <SelectItem value="Microsoft">Microsoft</SelectItem>
                    <SelectItem value="MSI">MSI</SelectItem>
                    <SelectItem value="Razer">Razer</SelectItem>
                    <SelectItem value="Samsung">Samsung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpu_company">CPU Brand</Label>
                <Select value={specs.cpu_company} onValueChange={(value) => updateSpecs("cpu_company", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intel">Intel</SelectItem>
                    <SelectItem value="AMD">AMD</SelectItem>
                    <SelectItem value="Samsung">Samsung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpu_company">GPU Brand</Label>
                <Select value={specs.gpu_company} onValueChange={(value) => updateSpecs("gpu_company", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intel">Intel</SelectItem>
                    <SelectItem value="AMD">AMD</SelectItem>
                    <SelectItem value="Nvidia">Nvidia</SelectItem>
                    <SelectItem value="ARM">ARM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="os">Operating System</Label>
                <Select value={specs.os} onValueChange={(value) => updateSpecs("os", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Windows 10">Windows 10</SelectItem>
                    <SelectItem value="Windows 7">Windows 7</SelectItem>
                    <SelectItem value="Mac OS X">Mac OS X</SelectItem>
                    <SelectItem value="macOS">macOS</SelectItem>
                    <SelectItem value="Linux">Linux</SelectItem>
                    <SelectItem value="Chrome OS">Chrome OS</SelectItem>
                    <SelectItem value="Android">Android</SelectItem>
                    <SelectItem value="No OS">No OS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="screen_w">Screen Width (px)</Label>
                <Input
                  id="screen_w"
                  type="number"
                  min="800"
                  max="4000"
                  value={specs.screen_w}
                  onChange={(e) => updateSpecs("screen_w", Number.parseInt(e.target.value) || 1920)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="screen_h">Screen Height (px)</Label>
                <Input
                  id="screen_h"
                  type="number"
                  min="600"
                  max="3000"
                  value={specs.screen_h}
                  onChange={(e) => updateSpecs("screen_h", Number.parseInt(e.target.value) || 1080)}
                />
              </div>
            </div>

            {/* Feature Checkboxes */}
            <div className="space-y-3">
              <Label>Display Features</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="touchscreen"
                    checked={specs.touchscreen}
                    onCheckedChange={(checked) => updateSpecs("touchscreen", checked)}
                  />
                  <Label htmlFor="touchscreen" className="text-sm">
                    Touchscreen
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ips" checked={specs.ips} onCheckedChange={(checked) => updateSpecs("ips", checked)} />
                  <Label htmlFor="ips" className="text-sm">
                    IPS Panel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="retina"
                    checked={specs.retina}
                    onCheckedChange={(checked) => updateSpecs("retina", checked)}
                  />
                  <Label htmlFor="retina" className="text-sm">
                    Retina Display
                  </Label>
                </div>
              </div>
            </div>

            <Button onClick={handlePredict} disabled={!modelLoaded || predicting} className="w-full">
              {predicting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Predict Price (Client-side AI)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Price Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!modelLoaded && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please ensure your model.onnx file is placed in the public folder of your project.
                </AlertDescription>
              </Alert>
            )}

            {prediction ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">€{prediction.price.toLocaleString()}</div>
                  <div className="text-lg text-gray-600">
                    ≈ ${Math.round(prediction.price * 1.1).toLocaleString()} USD
                  </div>
                </div>

                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-sm">
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>

                {/* <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-bold italic text-center">Prediction successful!</p>
                </div> */}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Configuration Summary:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>RAM: {specs.ram}GB</div>
                    <div>
                      Storage: {specs.storage}GB {specs.storage_type}
                    </div>
                    <div>
                      Screen: {specs.inches}" ({specs.screen_w}x{specs.screen_h})
                    </div>
                    <div>
                      CPU: {specs.cpu_freq}GHz {specs.cpu_company}
                    </div>
                    <div>Weight: {specs.weight}kg</div>
                    <div>GPU: {specs.gpu_company}</div>
                    <div>Brand: {specs.company}</div>
                    <div>OS: {specs.os}</div>
                    <div>
                      Features:{" "}
                      {[specs.touchscreen && "Touch", specs.ips && "IPS", specs.retina && "Retina"]
                        .filter(Boolean)
                        .join(", ") || "Standard"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Configure laptop specifications and click "Predict Price" to see the AI-powered price estimate.</p>
                {modelLoaded && <p className="text-sm mt-2 text-green-600">✨ Model ready for instant predictions!</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
