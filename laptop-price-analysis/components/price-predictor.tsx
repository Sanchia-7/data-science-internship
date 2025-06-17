"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calculator, TrendingUp, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PredictionSpecs {
  ram: number
  storage: number
  inches: number
  cpu_freq: number
  weight: number
  touchscreen: boolean
  ips: boolean
  retina: boolean
  company: string
  cpu_company: string
  gpu_company: string
  storage_type: string
}

interface PredictionResult {
  predictedPrice: number
  confidence: number
}

export function PricePredictor() {
  const [specs, setSpecs] = useState<PredictionSpecs>({
    ram: 8,
    storage: 256,
    inches: 14,
    cpu_freq: 2.5,
    weight: 1.5,
    touchscreen: false,
    ips: false,
    retina: false,
    company: "Dell",
    cpu_company: "Intel",
    gpu_company: "Intel",
    storage_type: "SSD",
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ laptopSpecs: specs }),
      })

      const data = await response.json()

      if (data.success) {
        setPrediction({
          predictedPrice: data.predictedPrice,
          confidence: data.confidence,
        })
      } else {
        setError(data.error || "Failed to predict price")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateSpecs = (key: keyof PredictionSpecs, value: any) => {
    setSpecs((prev) => ({ ...prev, [key]: value }))
    setPrediction(null) // Clear previous prediction
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Laptop Specifications
          </CardTitle>
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
                  <SelectItem value="Apple">Apple</SelectItem>
                  <SelectItem value="Dell">Dell</SelectItem>
                  <SelectItem value="HP">HP</SelectItem>
                  <SelectItem value="Lenovo">Lenovo</SelectItem>
                  <SelectItem value="Asus">Asus</SelectItem>
                  <SelectItem value="Acer">Acer</SelectItem>
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
                  <SelectItem value="Apple">Apple</SelectItem>
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
                  <SelectItem value="Apple">Apple</SelectItem>
                </SelectContent>
              </Select>
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

          <Button onClick={handlePredict} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Predict Price
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      <Card>
        <CardHeader>
          <CardTitle>Price Prediction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {prediction ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  €{prediction.predictedPrice.toLocaleString()}
                </div>
                <div className="text-lg text-gray-600">
                  ≈ ${Math.round(prediction.predictedPrice * 1.1).toLocaleString()} USD
                </div>
              </div>

              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Specification Summary:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>RAM: {specs.ram}GB</div>
                  <div>
                    Storage: {specs.storage}GB {specs.storage_type}
                  </div>
                  <div>Screen: {specs.inches}"</div>
                  <div>
                    CPU: {specs.cpu_freq}GHz {specs.cpu_company}
                  </div>
                  <div>Weight: {specs.weight}kg</div>
                  <div>GPU: {specs.gpu_company}</div>
                  <div>Brand: {specs.company}</div>
                  <div>
                    Features:{" "}
                    {[specs.touchscreen && "Touch", specs.ips && "IPS", specs.retina && "Retina"]
                      .filter(Boolean)
                      .join(", ") || "None"}
                  </div>
                </div>
              </div>
              
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Configure laptop specifications and click "Predict Price" to see the estimated price.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
