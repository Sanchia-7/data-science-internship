"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, TrendingUp, Laptop, Loader2, BarChart3, PieChart, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchLaptopData, type LaptopData } from "@/lib/data-fetcher"
import { LaptopCard } from "@/components/laptop-card"
import { ONNXPricePredictor } from "@/components/onnx-price-predictor"
import Link from "next/link"

const featureImportanceData = [
  { feature: "Ram", importance: 0.29 },
  { feature: "PrimaryStorage", importance: 0.18 },
  { feature: "Weight", importance: 0.13 },
  { feature: "Inches", importance: 0.12 },
  { feature: "CPU_freq", importance: 0.1 },
  { feature: "Touchscreen", importance: 0.08 },
  { feature: "IPSpanel", importance: 0.05 },
  { feature: "RetinaDisplay", importance: 0.03 },
]

export default function LaptopDashboard() {
  const [laptops, setLaptops] = useState<LaptopData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [ramFilter, setRamFilter] = useState("all")
  const [storageFilter, setStorageFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [osFilter, setOsFilter] = useState("all")
  const [touchscreenFilter, setTouchscreenFilter] = useState(false)
  const [ipsFilter, setIpsFilter] = useState(false)
  const [retinaFilter, setRetinaFilter] = useState(false)
  const [sortBy, setSortBy] = useState("price")
  const [selectedLaptop, setSelectedLaptop] = useState<LaptopData | null>(null)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null)

  


  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data = await fetchLaptopData()
      setLaptops(data)
      if (data.length > 0) {
        const maxPrice = Math.max(...data.map((l) => l.Price_euros))
        setPriceRange([0, Math.ceil(maxPrice)])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredLaptops = useMemo(() => {
    if (!laptops.length) return []

    return laptops
      .filter((laptop) => {
        const matchesSearch =
          laptop.Company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          laptop.Product.toLowerCase().includes(searchTerm.toLowerCase()) ||
          laptop.CPU_model.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPrice = laptop.Price_euros >= priceRange[0] && laptop.Price_euros <= priceRange[1]
        const matchesRam = ramFilter === "all" || laptop.Ram.toString() === ramFilter
        const matchesStorage = storageFilter === "all" || laptop.PrimaryStorage.toString() === storageFilter
        const matchesCompany = companyFilter === "all" || laptop.Company === companyFilter
        const matchesOS = osFilter === "all" || laptop.OS === osFilter
        const matchesTouchscreen = !touchscreenFilter || laptop.Touchscreen
        const matchesIps = !ipsFilter || laptop.IPSpanel
        const matchesRetina = !retinaFilter || laptop.RetinaDisplay

        return (
          matchesSearch &&
          matchesPrice &&
          matchesRam &&
          matchesStorage &&
          matchesCompany &&
          matchesOS &&
          matchesTouchscreen &&
          matchesIps &&
          matchesRetina
        )
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price":
            return a.Price_euros - b.Price_euros
          case "ram":
            return b.Ram - a.Ram
          case "storage":
            return b.PrimaryStorage - a.PrimaryStorage
          case "screen":
            return b.Inches - a.Inches
          case "weight":
            return a.Weight - b.Weight
          default:
            return 0
        }
      })
  }, [
    laptops,
    searchTerm,
    priceRange,
    ramFilter,
    storageFilter,
    companyFilter,
    osFilter,
    touchscreenFilter,
    ipsFilter,
    retinaFilter,
    sortBy,
  ])

  const getRecommendations = (laptop: LaptopData) => {
    return laptops
      .filter((l) => l.Product !== laptop.Product)
      .map((l) => ({
        ...l,
        similarity: calculateSimilarity(laptop, l),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
  }

  const calculateSimilarity = (laptop1: LaptopData, laptop2: LaptopData) => {
    const ramSim = 1 - Math.abs(laptop1.Ram - laptop2.Ram) / Math.max(laptop1.Ram, laptop2.Ram)
    const storageSim =
      1 -
      Math.abs(laptop1.PrimaryStorage - laptop2.PrimaryStorage) /
      Math.max(laptop1.PrimaryStorage, laptop2.PrimaryStorage)
    const priceSim =
      1 - Math.abs(laptop1.Price_euros - laptop2.Price_euros) / Math.max(laptop1.Price_euros, laptop2.Price_euros)
    const screenSim = 1 - Math.abs(laptop1.Inches - laptop2.Inches) / Math.max(laptop1.Inches, laptop2.Inches)
    const cpuSim = laptop1.CPU_company === laptop2.CPU_company ? 1 : 0.5

    return ramSim * 0.25 + storageSim * 0.2 + priceSim * 0.2 + screenSim * 0.15 + cpuSim * 0.2
  }

  const analytics = useMemo(() => {
    if (!laptops.length) return null

    // Price distribution
    const priceRanges = [
      { range: "€0-€500", count: 0, min: 0, max: 500 },
      { range: "€500-€1000", count: 0, min: 500, max: 1000 },
      { range: "€1000-€1500", count: 0, min: 1000, max: 1500 },
      { range: "€1500-€2000", count: 0, min: 1500, max: 2000 },
      { range: "€2000+", count: 0, min: 2000, max: Number.POSITIVE_INFINITY },
    ]

    filteredLaptops.forEach((laptop) => {
      const range = priceRanges.find((r) => laptop.Price_euros >= r.min && laptop.Price_euros < r.max)
      if (range) range.count++
    })

    // Company distribution
    const companyCount: { [key: string]: number } = {}
    filteredLaptops.forEach((laptop) => {
      companyCount[laptop.Company] = (companyCount[laptop.Company] || 0) + 1
    })

    const companyData = Object.entries(companyCount)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // OS distribution
    const osCount: { [key: string]: number } = {}
    filteredLaptops.forEach((laptop) => {
      osCount[laptop.OS] = (osCount[laptop.OS] || 0) + 1
    })

    const osData = Object.entries(osCount)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count)

    // RAM distribution
    const ramCount: { [key: string]: number } = {}
    filteredLaptops.forEach((laptop) => {
      const ramKey = `${laptop.Ram}GB`
      ramCount[ramKey] = (ramCount[ramKey] || 0) + 1
    })

    const ramData = Object.entries(ramCount)
      .map(([ram, count]) => ({ ram, count }))
      .sort((a, b) => Number.parseInt(a.ram) - Number.parseInt(b.ram))

    return {
      priceDistribution: priceRanges,
      companyData,
      osData,
      ramData,
      avgPrice: filteredLaptops.reduce((sum, l) => sum + l.Price_euros, 0) / filteredLaptops.length,
      avgRam: filteredLaptops.reduce((sum, l) => sum + l.Ram, 0) / filteredLaptops.length,
      avgStorage: filteredLaptops.reduce((sum, l) => sum + l.PrimaryStorage, 0) / filteredLaptops.length,
      avgScreen: filteredLaptops.reduce((sum, l) => sum + l.Inches, 0) / filteredLaptops.length,
    }
  }, [laptops, filteredLaptops])

  const clearFilters = () => {
    setSearchTerm("")
    if (laptops.length > 0) {
      const maxPrice = Math.max(...laptops.map((l) => l.Price_euros))
      setPriceRange([0, Math.ceil(maxPrice)])
    }
    setRamFilter("all")
    setStorageFilter("all")
    setCompanyFilter("all")
    setOsFilter("all")
    setTouchscreenFilter(false)
    setIpsFilter(false)
    setRetinaFilter(false)
    setSortBy("price")
  }

  const uniqueCompanies = useMemo(() => [...new Set(laptops.map((l) => l.Company))].sort(), [laptops])
  const uniqueOS = useMemo(() => [...new Set(laptops.map((l) => l.OS))].sort(), [laptops])
  const uniqueRAM = useMemo(() => [...new Set(laptops.map((l) => l.Ram))].sort((a, b) => a - b), [laptops])
  const uniqueStorage = useMemo(
    () => [...new Set(laptops.map((l) => l.PrimaryStorage))].sort((a, b) => a - b),
    [laptops],
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-gray-600">Loading laptop data...</p>
        </div>
      </div>
    )
  }

  const rangeData =
    analytics?.priceDistribution.find((r) => r.range === selectedPriceRange) ||
    analytics?.priceDistribution[0]

  const laptopsInRange = filteredLaptops.filter(
    (l) =>
      l.Price_euros >= (rangeData?.min ?? 0) &&
      l.Price_euros < (rangeData?.max ?? Number.POSITIVE_INFINITY),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Laptop className="h-8 w-8" />
            Laptop Price Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            Analyzing {laptops.length.toLocaleString()} laptops
          </p>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-10 md:mb-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="search">Search & Filters</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="predict">Price Predictor</TabsTrigger>
          </TabsList>

          <TabsContent value="predict" className="space-y-6">
            <ONNXPricePredictor />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Laptops</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{laptops.length.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{analytics?.avgPrice.toFixed(0) || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    €{Math.min(...laptops.map((l) => l.Price_euros)).toFixed(0)} - €
                    {Math.max(...laptops.map((l) => l.Price_euros)).toFixed(0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Brands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueCompanies.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Model Performance */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
            {/* <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Random Forest R²:</span>
                      <Badge variant="secondary">0.90</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Random Forest MSE:</span>
                      <Badge variant="secondary">56,130</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">XGBoost R² (prelim):</span>
                      <Badge variant="secondary">0.91</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle>Dataset Statistics</CardTitle>
                </div>
                <div className="ml-auto shadow-sm rounded-md p-2 bg-white hover:bg-black hover:text-white transition-colors">
                  <Link href="/laptop_prices.csv">View Dataset</Link>
                </div>
                </CardHeader>
              <CardContent>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-center items-center">
                    <span className="font-medium">Avg RAM:</span>
                    <Badge>{analytics?.avgRam.toFixed(1)}GB</Badge>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-medium">Avg Storage:</span>
                    <Badge>{analytics?.avgStorage.toFixed(0)}GB</Badge>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-medium">Avg Screen:</span>
                    <Badge>{analytics?.avgScreen.toFixed(1)}"</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* </div> */}

            {/* Feature Importance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    importance: {
                      label: "Importance",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 120 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 0.3]} />
                      <YAxis type="category" dataKey="feature" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="importance" fill="var(--color-importance)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by brand, model, or CPU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range (€)</label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={Math.max(...laptops.map((l) => l.Price_euros))}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>€{priceRange[0]}</span>
                        <span>€{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Select value={companyFilter} onValueChange={setCompanyFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {uniqueCompanies.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">RAM (GB)</label>
                    <Select value={ramFilter} onValueChange={setRamFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All RAM</SelectItem>
                        {uniqueRAM.map((ram) => (
                          <SelectItem key={ram} value={ram.toString()}>
                            {ram} GB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Storage (GB)</label>
                    <Select value={storageFilter} onValueChange={setStorageFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Storage</SelectItem>
                        {uniqueStorage.map((storage) => (
                          <SelectItem key={storage} value={storage.toString()}>
                            {storage} GB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Operating System</label>
                    <Select value={osFilter} onValueChange={setOsFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All OS</SelectItem>
                        {uniqueOS.map((os) => (
                          <SelectItem key={os} value={os}>
                            {os}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Feature Checkboxes */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="touchscreen"
                      checked={touchscreenFilter}
                      onCheckedChange={(checked) => setTouchscreenFilter(checked === true)}
                    />
                    <label htmlFor="touchscreen" className="text-sm">
                      Touchscreen
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ips"
                      checked={ipsFilter}
                      onCheckedChange={(checked) => setIpsFilter(checked === true)}
                    />
                    <label htmlFor="ips" className="text-sm">
                      IPS Panel
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="retina"
                      checked={retinaFilter}
                      onCheckedChange={(checked) => setRetinaFilter(checked === true)}
                    />
                    <label htmlFor="retina" className="text-sm">
                      Retina Display
                    </label>
                  </div>
                </div>

                {/* Sort and Clear */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Sort by:</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="ram">RAM</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="screen">Screen Size</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({filteredLaptops.length.toLocaleString()} laptops)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLaptops.slice(0, 20).map((laptop, index) => (
                    <LaptopCard key={`${laptop.Company}-${laptop.Product}-${index}`} laptop={laptop} />
                  ))}
                </div>
                {filteredLaptops.length > 20 && (
                  <div className="text-center mt-4">
                    <Badge variant="secondary">
                      Showing first 20 of {filteredLaptops.length.toLocaleString()} results
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Price Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Price Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics?.priceDistribution}
                        onClick={(e: any) => {
                          if (e && e.activeLabel) {
                            setSelectedPriceRange(e.activeLabel)
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="count"
                          fill="var(--color-count)"
                          radius={4}
                          onClick={(_, idx) => {
                            if (analytics?.priceDistribution && analytics.priceDistribution[idx]) {
                              setSelectedPriceRange(analytics.priceDistribution[idx].range)
                            }
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Inference Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Range Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="mb-2">
                      <span className="font-semibold">Selected Range: </span>
                      <Badge>{rangeData?.range}</Badge>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Laptops in range: </span>
                      {laptopsInRange.length}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Top brand in range: </span>
                      {laptopsInRange.length > 0
                        ? (() => {
                            const brandCount: { [brand: string]: number } = {};
                            laptopsInRange.forEach(l => {
                              brandCount[l.Company] = (brandCount[l.Company] || 0) + 1;
                            });
                            const topBrand = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0];
                            return topBrand ? topBrand[0] : "N/A";
                          })()
                        : "N/A"}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Average Price: </span>
                      €{laptopsInRange.reduce((sum, l) => sum + l.Price_euros, 0) / laptopsInRange.length || 0}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Average RAM: </span>
                      {laptopsInRange.reduce((sum, l) => sum + l.Ram, 0) / laptopsInRange.length || 0} GB
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Average Storage: </span>
                      {laptopsInRange.reduce((sum, l) => sum + l.PrimaryStorage, 0) / laptopsInRange.length || 0} GB
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPriceRange(null)}
                        disabled={!selectedPriceRange}
                      >
                        Reset Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>

              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Top Companies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.companyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="company" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* RAM Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>RAM Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.ramData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ram" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Price vs Performance Scatter */}
            <Card>
              <CardHeader>
                <CardTitle>Price vs RAM Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    price: {
                      label: "Price (€)",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={filteredLaptops.slice(0, 200)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Ram" name="RAM (GB)" />
                      <YAxis dataKey="Price_euros" name="Price (€)" />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as LaptopData
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="font-semibold">
                                  {data.Company} {data.Product.split("(")[0]}
                                </p>
                                <p>RAM: {data.Ram}GB</p>
                                <p>Price: €{data.Price_euros}</p>
                                <p>Storage: {data.PrimaryStorage}GB</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Scatter dataKey="Price_euros" fill="var(--color-price)" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Laptop Recommendations</CardTitle>
                <p className="text-sm text-gray-600">
                  Click on a laptop to see similar recommendations based on specifications
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Laptop Selection */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Choose a laptop:</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {laptops.slice(0, 50).map((laptop, index) => (
                        <LaptopCard
                          key={`select-${laptop.Company}-${laptop.Product}-${index}`}
                          laptop={laptop}
                          onSelect={setSelectedLaptop}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recommendations Display */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      {selectedLaptop
                        ? `Recommendations for ${selectedLaptop.Company} ${selectedLaptop.Product.split("(")[0]}:`
                        : "Recommendations:"}
                    </h3>
                    {selectedLaptop ? (
                      <div className="space-y-2">
                        {getRecommendations(selectedLaptop).map((rec, index) => (
                          <div key={`rec-${rec.Company}-${rec.Product}-${index}`} className="relative">
                            <Badge className="absolute top-2 right-2 z-10">
                              {(rec.similarity * 100).toFixed(0)}% match
                            </Badge>
                            <LaptopCard laptop={rec} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <Laptop className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Select a laptop to see recommendations</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Value Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Best Value Laptops</CardTitle>
                <p className="text-sm text-gray-600">Laptops with the best price-to-performance ratio</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {laptops
                    .filter((l) => l.Ram >= 8 && l.PrimaryStorage >= 256) // Minimum specs
                    .sort((a, b) => {
                      const scoreA = (a.Ram * 10 + a.PrimaryStorage / 10 + a.Inches * 50) / a.Price_euros
                      const scoreB = (b.Ram * 10 + b.PrimaryStorage / 10 + b.Inches * 50) / b.Price_euros
                      return scoreB - scoreA
                    })
                    .slice(0, 6)
                    .map((laptop, index) => (
                      <div key={`value-${laptop.Company}-${laptop.Product}-${index}`} className="relative">
                        <Badge className="absolute top-2 right-2 z-10 bg-green-100 text-green-800">Best Value</Badge>
                        <LaptopCard laptop={laptop} />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}
