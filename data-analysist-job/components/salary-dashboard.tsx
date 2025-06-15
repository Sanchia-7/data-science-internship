"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, Users, Building, MapPin } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { getExperienceLevelLabel, getCompanySizeLabel } from "@/lib/data-utils"
import SalaryPredictor from "./salary-predictor"

interface Analytics {
  salaryByExperience: Array<{ experience_level: string; salary: number }>
  topJobTitles: Array<{ job_title: string; salary: number; count: number }>
  yearlyTrends: Array<{ work_year: number; salary: number }>
  companySizeDistribution: Array<{ company_size: string; count: number }>
  remoteWorkAnalysis: Array<{ work_type: string; salary: number; count: number }>
  locationAnalysis: Array<{ location: string; salary: number; count: number }>
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function SalaryDashboard() {
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    job_title: "",
    work_year: "",
    experience_level: "",
  })
  const [activeTab, setActiveTab] = useState<"dashboard" | "predictor">("dashboard")

  useEffect(() => {
    fetchJobTitles()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  const fetchJobTitles = async () => {
    try {
      const response = await fetch("/api/job-titles")
      const titles = await response.json()
      setJobTitles(titles)
    } catch (error) {
      console.error("Error fetching job titles:", error)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/analytics?${params}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === "salary" ? "Salary: " : "Count: "}${entry.dataKey === "salary" ? formatSalary(entry.value) : entry.value
                }`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const clearFilters = () => {
    setFilters({ job_title: "", work_year: "", experience_level: "" })
  }

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Data Science Salary Dashboard</h1>
        <p className="text-gray-600">Comprehensive analysis of data science job salaries worldwide</p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mt-4 ">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            className={activeTab === "dashboard" ? "bg-blue-950 text-white" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "predictor" ? "default" : "outline"}
            className={activeTab === "predictor" ? "bg-blue-950 text-white" : ""}
            onClick={() => setActiveTab("predictor")}
          >
            Salary Predictor
          </Button>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap items-end">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Select
                    value={filters.job_title}
                    onValueChange={(value) => setFilters({ ...filters, job_title: value })}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="All job titles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All job titles</SelectItem>
                      {jobTitles.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Work Year</Label>
                  <Select
                    value={filters.work_year}
                    onValueChange={(value) => setFilters({ ...filters, work_year: value })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      {/* <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={filters.experience_level}
                    onValueChange={(value) => setFilters({ ...filters, experience_level: value })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      <SelectItem value="EN">Entry Level</SelectItem>
                      <SelectItem value="MI">Mid Level</SelectItem>
                      <SelectItem value="SE">Senior Level</SelectItem>
                      <SelectItem value="EX">Executive Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rest of the existing dashboard content remains the same */}
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                        <p className="text-2xl font-bold">
                          {analytics.salaryByExperience.length > 0
                            ? formatSalary(
                              analytics.salaryByExperience.reduce((sum, item) => sum + item.salary, 0) /
                              analytics.salaryByExperience.length,
                            )
                            : "$0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Job Titles</p>
                        <p className="text-2xl font-bold">{jobTitles.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Building className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Companies</p>
                        <p className="text-2xl font-bold">
                          {analytics.companySizeDistribution.reduce((sum, item) => sum + item.count, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <MapPin className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Remote Jobs</p>
                        <p className="text-2xl font-bold">
                          {analytics.remoteWorkAnalysis.find((item) => item.work_type === "Remote")?.count || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts - keep all existing chart code */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Salary by Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle>Average Salary by Experience Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.salaryByExperience}>
                        <XAxis dataKey="experience_level" tickFormatter={getExperienceLevelLabel} />
                        <YAxis tickFormatter={formatSalary} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Job Titles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Paying Job Titles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.topJobTitles.slice(0, 8)}>
                        <XAxis dataKey="job_title" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tickFormatter={formatSalary} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="salary" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Yearly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Trends Over Years</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.yearlyTrends}>
                        <XAxis dataKey="work_year" />
                        <YAxis tickFormatter={formatSalary} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="salary"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: "#f59e0b", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Company Size Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Size Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.companySizeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ company_size, percent }) =>
                            `${getCompanySizeLabel(company_size)} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.companySizeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Remote Work Analysis - keep existing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Remote Work vs Salary Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.remoteWorkAnalysis}>
                        <XAxis dataKey="work_type" />
                        <YAxis tickFormatter={formatSalary} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="salary" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Location-Based Salary Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location vs Salary Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.locationAnalysis}>
                        <XAxis dataKey="location" />
                        <YAxis tickFormatter={formatSalary} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="salary" fill="#3b7cA0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

              </div>


            </>
          )}
        </>
      ) : (
        <SalaryPredictor />
      )}
    </div>
  )
}
