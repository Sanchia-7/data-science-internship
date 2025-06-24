"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Cat, BrainCircuit, Loader, TrendingUpDown, TrendingUp, AlertCircle, Brain, Target, DollarSign, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SalesPredictor() {
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    city: "",
    region: "",
    state: "Tamil Nadu",
    discount: [0.1],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dayOfWeek: 0,
    isWeekend: 0,
    profitMargin: [0.2],
  })

  const categories = [
    "Beverages",
    "Egg, Meat & Fish",
    "Food Grains",
    "Fruits & Veggies",
    "Oil & Masala",
    "Snacks & Branded Foods",
    "Kitchen, Garden & Pets",
    "Gourmet & World Food",
    "Baby Care",
    "Cleaning & Household",
    "Beauty & Hygiene",
  ]
  const regions = ["North", "South", "East", "West", "Central"]

  const categorySubcategories: Record<string, string[]> = {
    "Beverages": ["Soft Drinks", "Juices", "Coffee & Tea"],
    "Egg, Meat & Fish": ["Eggs", "Chicken", "Fish", "Mutton"],
    "Food Grains": ["Rice", "Wheat", "Pulses"],
    "Fruits & Veggies": ["Fruits", "Vegetables", "Leafy Greens"],
    "Oil & Masala": ["Cooking Oil", "Spices"],
    "Snacks & Branded Foods": ["Chips", "Biscuits", "Namkeen"],
    "Kitchen, Garden & Pets": ["Utensils", "Garden Tools", "Pet Food"],
    "Gourmet & World Food": ["Imported Snacks", "Pasta", "Sauces"],
    "Baby Care": ["Diapers", "Baby Food", "Wipes"],
    "Cleaning & Household": ["Detergents", "Cleaners", "Mops"],
    "Beauty & Hygiene": ["Shampoo", "Soap", "Toothpaste"],
  }

  const regionCityMap: Record<string, string[]> = {
    North: ["Vellore", "Tiruvannamalai", "Krishnagiri"],
    South: ["Madurai", "Tirunelveli", "Thoothukudi"],
    East: ["Chennai", "Cuddalore", "Nagapattinam"],
    West: ["Coimbatore", "Erode", "Salem"],
    Central: ["Trichy", "Karur", "Dindigul"],
  }


  const subCategories = useMemo(() => {
    return (categorySubcategories[formData.category] || []).map((name, index) => ({
      value: name,
      label: name,
    }))
  }, [formData.category])

  const handlePredict = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categories.indexOf(formData.category),
          subCategory: 0, // update this if using subCategory index
          city: (regionCityMap[formData.region] || []).indexOf(formData.city),
          region: regions.indexOf(formData.region),
          state: 0,
          discount: formData.discount[0],
          month: formData.month,
          year: formData.year,
          dayOfWeek: formData.dayOfWeek,
          isWeekend: formData.isWeekend,
          profitMargin: formData.profitMargin[0],
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPrediction(result)
      } else {
        setError(result.error || "Prediction failed. Please try again.")
      }
    } catch (error) {
      console.error("Error making prediction:", error)
      setError("Failed to connect to prediction service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isSimulatedPrediction = prediction?.model_type === "Vercel_Simulation"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shadow-lg">
        {/* Input Form */}
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center  gap-2 text-xl sm:text-2xl">
              <Brain className="h-6 w-6 text-gray-900 " />
              Sales Predictor
            </CardTitle>
            <CardDescription className="text-base">
              Predict sales based on product details, location, and market conditions using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Product Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                      subCategory: "", // reset subCategory when category changes
                    }))
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-sm">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCategory" className="text-sm font-medium">
                  Sub-Category
                </Label>
                <Select
                  value={formData.subCategory}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, subCategory: value }))
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub) => (
                      <SelectItem key={sub.value} value={sub.value} className="text-sm">
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Discount Slider */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Discount Percentage</Label>
                <input
                  type="number"
                  value={(formData.discount[0] * 100).toFixed(0)}
                  onChange={(e) => {
                    let val = Math.max(0, Math.min(75, Number(e.target.value)))
                    setFormData((prev) => ({ ...prev, discount: [val / 100] }))
                  }}
                  min={0}
                  max={75}
                  step={1}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <div className="text-center text-sm text-gray-600">
                  {(formData.discount[0] * 100).toFixed(0)}% discount
                </div>
              </div>

              {/* Profit Margin */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Expected Profit Margin</Label>
              <input
              type="number"
              value={(formData.profitMargin[0] * 100).toFixed(0)}
              onChange={(e) => {
                let val = Math.max(5, Math.min(50, Number(e.target.value)))
                setFormData((prev) => ({ ...prev, profitMargin: [val / 100] }))
              }}
              min={5}
              max={50}
              step={1}
              className="w-full border rounded px-3 py-2 text-sm"
              />
              <div className="text-center text-sm text-gray-600">
              {(formData.profitMargin[0] * 100).toFixed(0)}% profit margin
              </div>
            </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region" className="text-sm font-medium">
                  Region *
                </Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, region: value }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region} className="text-sm">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  City *
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, city: value }))
                  }
                  disabled={!formData.region} // Disable until region is selected
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {(regionCityMap[formData.region] || []).map((city) => (
                      <SelectItem key={city} value={city} className="text-sm">
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            

            <Button
              onClick={handlePredict}
              disabled={loading || !formData.category || !formData.region || !formData.city}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Predicting Sales
                </>
              ) : (
                <>
                  <Cat className="mr-2 h-6 w-6" />
                  Predict Sales
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prediction Output */}
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUpDown className="h-5 w-5" />
              Prediction
            </CardTitle>
            <CardDescription className="text-sm">
              View AI-generated sales predictions based on your inputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : prediction ? (
              <div className="space-y-6">
                {/* Simulated Notice */}
                {isSimulatedPrediction && (
                  <Alert className="border border-yellow-300">
                    <Info className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-800 text-sm">
                      This is a <strong>simulated result</strong> for demo purposes. To see full ML predictions, run locally with the trained model.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Prediction Summary */}
                <div className="text-center border rounded p-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Your Predicted Sales</h2>
                  <p className="text-sm text-gray-500">Based on the selected category, region, and discount level</p>
                  <div className="text-4xl py-3 font-bold text-indigo-700 tracking-tight">
                    ₹{prediction.prediction.toFixed(2)}
                  </div>
                  <Badge className={` ${isSimulatedPrediction ? "bg-red-100 text-red-500" : "bg-green-100 text-green-600"}`}
                  >
                    {isSimulatedPrediction ? "Simulated Sales Output" : "Predicted by ML model"}
                  </Badge>
                </div>

                {/* Financial Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 border rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <DollarSign className="h-6 w-6 text-green-600 mb-1" />Estimated Profit
                    <p className="text-2xl font-semibold text-green-700">
                      ₹{(prediction.prediction * formData.profitMargin[0]).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Calculated using the expected margin</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <TrendingUp className="h-6 w-6 text-purple-600 mb-1" />
                    <p className="text-sm font-medium text-gray-700">Profit Margin</p>
                    <p className="text-2xl font-semibold text-purple-700">
                      {(formData.profitMargin[0] * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Your target margin setting</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                <BrainCircuit className="mx-auto h-20 w-20 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Predictions Yet</h2>
                <p className="text-lg mb-4">Select product details and click "Predict Sales"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
