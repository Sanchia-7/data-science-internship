"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

type SalaryData = { experience_level: string; salary: number }[]
type AvgTitleData = { job_title: string; salary: number }[]
type YearlyTrendData = { work_year: number; salary: number }[]
type DistributionData = { experience_level: string; count: number }[]

export default function Dashboard() {
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState<string>("Data Scientist")
  const [selectedYear, setSelectedYear] = useState<number>(2022)
  const [experienceData, setExperienceData] = useState<SalaryData>([])
  const [averageByTitle, setAverageByTitle] = useState<AvgTitleData>([])
  const [yearlyTrend, setYearlyTrend] = useState<YearlyTrendData>([])
  const [distribution, setDistribution] = useState<DistributionData>([])
  const [prediction, setPrediction] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [predicting, setPredicting] = useState(false)

  const [predictForm, setPredictForm] = useState({
    experience_level: "SE",
    employment_type: "FT",
    company_size: "M",
    job_title: "Data Scientist",
    work_year: 2024,
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/job_titles")
        if (response.ok) {
          const titles = await response.json()
          setJobTitles(titles)
        }
        await fetchData()
      } catch (error) {
        console.error("Error fetching initial data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [selectedTitle, selectedYear])

  const fetchData = async () => {
    try {
      const [salariesRes, averagesRes, trendRes, distributionRes] = await Promise.all([
        fetch(`/api/salaries?job_title=${encodeURIComponent(selectedTitle)}&work_year=${selectedYear}`),
        fetch(`/api/averages_by_title?work_year=${selectedYear}`),
        fetch(`/api/yearly_trend?job_title=${encodeURIComponent(selectedTitle)}`),
        fetch("/api/experience_level_trend"),
      ])

      if (salariesRes.ok) {
        const salariesData = await salariesRes.json()
        setExperienceData(salariesData)
      }

      if (averagesRes.ok) {
        const averagesData = await averagesRes.json()
        setAverageByTitle(averagesData)
      }

      if (trendRes.ok) {
        const trendData = await trendRes.json()
        setYearlyTrend(trendData)
      }

      if (distributionRes.ok) {
        const distributionData = await distributionRes.json()
        setDistribution(distributionData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const predict = async () => {
    setPredicting(true)
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictForm),
      })

      if (res.ok) {
        const data = await res.json()
        setPrediction(data.salary)
      } else {
        console.error("Prediction failed")
      }
    } catch (error) {
      console.error("Error predicting salary:", error)
    } finally {
      setPredicting(false)
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600">
            {`${payload[0].dataKey === "salary" ? "Salary: " : "Count: "}${
              payload[0].dataKey === "salary" ? formatSalary(payload[0].value) : payload[0].value
            }`}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💼 Salary Dashboard</h1>
        <p className="text-gray-600">Analyze salary trends and predict future earnings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 flex-wrap">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Select value={selectedTitle} onValueChange={setSelectedTitle}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select job title" />
                </SelectTrigger>
                <SelectContent>
                  {jobTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-[120px]"
                min="2020"
                max="2024"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Salary by Experience Level</CardTitle>
            <p className="text-sm text-gray-600">
              {selectedTitle} • {selectedYear}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={experienceData}>
                <XAxis dataKey="experience_level" />
                <YAxis tickFormatter={formatSalary} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Job Titles by Salary ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={averageByTitle.slice(0, 10)}>
                <XAxis dataKey="job_title" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={formatSalary} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="salary" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yearly Salary Trend</CardTitle>
            <p className="text-sm text-gray-600">{selectedTitle}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyTrend}>
                <XAxis dataKey="work_year" />
                <YAxis tickFormatter={formatSalary} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="salary" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribution}>
                <XAxis dataKey="experience_level" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Predict Future Salary</CardTitle>
          <p className="text-sm text-gray-600">Enter your details to get a salary prediction</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select
                value={predictForm.experience_level}
                onValueChange={(value) => setPredictForm({ ...predictForm, experience_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">Entry Level</SelectItem>
                  <SelectItem value="MI">Mid Level</SelectItem>
                  <SelectItem value="SE">Senior Level</SelectItem>
                  <SelectItem value="EX">Executive Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select
                value={predictForm.employment_type}
                onValueChange={(value) => setPredictForm({ ...predictForm, employment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FT">Full Time</SelectItem>
                  <SelectItem value="PT">Part Time</SelectItem>
                  <SelectItem value="CT">Contract</SelectItem>
                  <SelectItem value="FL">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select
                value={predictForm.company_size}
                onValueChange={(value) => setPredictForm({ ...predictForm, company_size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Small</SelectItem>
                  <SelectItem value="M">Medium</SelectItem>
                  <SelectItem value="L">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title_predict">Job Title</Label>
              <Select
                value={predictForm.job_title}
                onValueChange={(value) => setPredictForm({ ...predictForm, job_title: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_year_predict">Work Year</Label>
              <Input
                id="work_year_predict"
                type="number"
                value={predictForm.work_year}
                onChange={(e) => setPredictForm({ ...predictForm, work_year: Number(e.target.value) })}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={predict} disabled={predicting}>
              {predicting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Predict Salary
            </Button>

            {prediction && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Predicted Salary</p>
                <p className="text-2xl font-bold text-green-800">{formatSalary(prediction)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
