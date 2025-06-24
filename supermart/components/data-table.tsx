"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Filter } from "lucide-react"

interface OrderData {
  "Order ID": string
  "Customer Name": string
  Category: string
  "Sub Category": string
  City: string
  "Order Date": string
  Region: string
  Sales: number
  Discount: number
  Profit: number
  State: string
}

interface DataTableProps {
  data: OrderData[]
}

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = data.filter((item) =>
  Object.values(item).some((value) =>
    (value ?? "") // if null/undefined, fallback to empty string
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
)


  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const exportToCSV = () => {
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) => headers.map((header) => `"${row[header as keyof OrderData]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "supermart_data.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Data Explorer
        </CardTitle>
        <CardDescription>Browse and search through all order data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredData.length} of {data.length} orders
            </Badge>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub Category</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((order, index) => (
                <TableRow key={order["Order ID"] || index}>
                  <TableCell className="font-medium">{order["Order ID"]}</TableCell>
                  <TableCell>{order["Customer Name"]}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order["Category"]}</Badge>
                  </TableCell>
                  <TableCell>{order["Sub Category"]}</TableCell>
                  <TableCell>{order["Region"]}</TableCell>
                  <TableCell>{order["Order Date"]}</TableCell>
                  <TableCell className="text-right">₹{order["Sales"].toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(order["Discount"] * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right">₹{order["Profit"].toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
