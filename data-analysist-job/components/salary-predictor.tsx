"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, Target, BarChart3 } from "lucide-react"
import type { PredictionFeatures, PredictionResult } from "@/lib/ml-utils"

interface FormData {
  job_titles: string[]
  company_locations: string[]
  experience_levels: Array<{ value: string; label: string }>
  employment_types: Array<{ value: string; label: string }>
  company_sizes: Array<{ value: string; label: string }>
}

export default function SalaryPredictor() {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [features, setFeatures] = useState<PredictionFeatures>({
    work_year: new Date().getFullYear(),
    experience_level: "SE",
    employment_type: "FT",
    job_title: "",
    company_size: "M",
    remote_ratio: 0,
    company_location: "US",
  })

  useEffect(() => {
    fetchFormData()
  }, [])

  const fetchFormData = async () => {
    try {
      const response = await fetch("/api/form-data")
      const data = await response.json()
      setFormData(data)

      // Set default job title
      if (data.job_titles.length > 0) {
        setFeatures((prev) => ({ ...prev, job_title: data.job_titles[0] }))
      }
    } catch (error) {
      console.error("Error fetching form data:", error)
    }
  }

  const handlePredict = async () => {
    if (!features.job_title) return

    setLoading(true)
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
      })

      if (response.ok) {
        const result = await response.json()
        setPrediction(result)
      } else {
        console.error("Prediction failed")
      }
    } catch (error) {
      console.error("Error predicting salary:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-green-600"
      case "decreasing":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Salary Predictor
          </CardTitle>
          <p className="text-sm text-gray-600">
            Get personalized salary predictions based on machine learning analysis of market data
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Select
                value={features.job_title}
                onValueChange={(value) => setFeatures({ ...features, job_title: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  {formData.job_titles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select
                value={features.experience_level}
                onValueChange={(value) => setFeatures({ ...features, experience_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.experience_levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select
                value={features.employment_type}
                onValueChange={(value) => setFeatures({ ...features, employment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.employment_types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select
                value={features.company_size}
                onValueChange={(value) => setFeatures({ ...features, company_size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.company_sizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_location">Company Location</Label>
              <Select
                value={features.company_location}
                onValueChange={(value) => setFeatures({ ...features, company_location: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.company_locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_year">Work Year</Label>
              <Input
                id="work_year"
                type="number"
                value={features.work_year}
                onChange={(e) => setFeatures({ ...features, work_year: Number(e.target.value) })}
                min="2020"
                max="2040"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remote_ratio">Remote Work Ratio</Label>
            <select
              id="remote_ratio"
              value={features.remote_ratio}
              onChange={(e) =>
                setFeatures({ ...features, remote_ratio: parseInt(e.target.value) })
              }
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value={0}>On-site (0%)</option>
              <option value={50}>Hybrid (50%)</option>
              <option value={100}>Remote (100%)</option>
            </select>
          </div>


          <Button onClick={handlePredict} disabled={loading || !features.job_title} className="w-full bg-blue-900 hover:bg-blue-950" size="lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Target className="mr-2 h-4 w-4" />
            Predict My Salary
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <div className="">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Salary Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{formatSalary(prediction.predicted_salary)}</div>
                <div className="text-sm text-gray-600">Predicted Annual Salary</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Salary Range:</span>
                  <span className="text-sm font-medium">
                    {formatSalary(prediction.salary_range.min)} - {formatSalary(prediction.salary_range.max)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <span className="text-sm font-medium">{prediction.confidence_score}%</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${prediction.confidence_score}%` }}
                ></div>
              </div>
            </CardContent>
            {/* </Card>

          <Card> */}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Percentile:</span>
                  <span className="text-sm font-medium">{prediction.market_insights.percentile}th</span>
                </div>

                

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Trend:</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(prediction.market_insights.trend)}
                    <span
                      className={`text-sm font-medium capitalize ${getTrendColor(prediction.market_insights.trend)}`}
                    >
                      {prediction.market_insights.trend}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 <strong>Insight:</strong> Your predicted salary is in the {prediction.market_insights.percentile}th
                  percentile, meaning you'd earn more than {prediction.market_insights.percentile}% of professionals in
                  similar roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
