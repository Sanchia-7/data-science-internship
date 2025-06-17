"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, HardDrive, Cpu, Zap } from "lucide-react"
import type { LaptopData } from "@/lib/data-fetcher"

interface LaptopCardProps {
  laptop: LaptopData
  onSelect?: (laptop: LaptopData) => void
  showRecommendations?: boolean
}

export function LaptopCard({ laptop, onSelect, showRecommendations = false }: LaptopCardProps) {
  const priceUSD = Math.round(laptop.Price_euros * 1.1) // Rough EUR to USD conversion

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 ${onSelect ? "cursor-pointer hover:scale-[1.02]" : ""}`}
      onClick={() => onSelect?.(laptop)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-sm leading-tight">
                {laptop.Company} {laptop.Product.split("(")[0].trim()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{laptop.TypeName}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-sm font-bold">
                €{laptop.Price_euros.toLocaleString()}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">${priceUSD.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              <span>
                {laptop.Inches}" {laptop.ScreenW}x{laptop.ScreenH}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>{laptop.Ram}GB RAM</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span>
                {laptop.PrimaryStorage}GB {laptop.PrimaryStorageType}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span>{laptop.CPU_freq}GHz</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {laptop.Touchscreen && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                Touch
              </Badge>
            )}
            {laptop.IPSpanel && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                IPS
              </Badge>
            )}
            {laptop.RetinaDisplay && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                Retina
              </Badge>
            )}
            <Badge variant="outline" className="text-xs px-1 py-0">
              {laptop.OS}
            </Badge>
          </div>

          <div className="text-xs text-gray-600">
            <div>
              {laptop.CPU_company} {laptop.CPU_model}
            </div>
            <div>
              {laptop.GPU_company} {laptop.GPU_model}
            </div>
            <div>Weight: {laptop.Weight}kg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
