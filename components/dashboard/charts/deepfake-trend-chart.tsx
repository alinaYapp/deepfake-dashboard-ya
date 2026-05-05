"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, ChevronLeft, ChevronRight } from "lucide-react"
import type { DetectionTrendPoint } from "@/lib/statistics-types"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface DeepfakeTrendChartProps {
  data: DetectionTrendPoint[]
  isWeeklyBinning?: boolean
  isLoading?: boolean
}

const ROWS_PER_PAGE = 6

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" })
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" })
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`
  }
  return `${startMonth} ${startDay}–${endMonth} ${endDay}`
}

export function DeepfakeTrendChart({ data, isWeeklyBinning = false, isLoading = false }: DeepfakeTrendChartProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const formattedData = data.map((point) => {
    const dateObj = new Date(point.date)
    const label = isWeeklyBinning
      ? formatWeekRange(dateObj)
      : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    
    return {
      ...point,
      date: label,
      originalDate: point.date,
    }
  })

  // Pagination for table
  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE)
  const paginatedData = formattedData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  )

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage, "...", totalPages)
      }
    }
    return pages
  }

  // Calculate totals for table percentages
  const totalChecks = data.reduce((sum, p) => sum + (p.total_checks || 0), 0)

  if (isLoading) {
    return (
      <Card className="bg-card border-[0.5px] border-border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Detection Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-[280px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-[0.5px] border-border rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Detection Trend</CardTitle>
          {isWeeklyBinning && (
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              <span>Data grouped by week (period &gt; 90 days)</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Bar Chart */}
          <div className="h-[280px] pr-0 lg:pr-4 lg:border-r lg:border-border/50">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0de" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b6b6b", fontSize: 11 }}
                  axisLine={{ stroke: "#e0e0de" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#6b6b6b", fontSize: 11 }}
                  axisLine={{ stroke: "#e0e0de" }}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0de",
                    borderRadius: "8px",
                    color: "#1a1a1a",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#6b6b6b" }}
                  formatter={(value: number) => [value, "Deepfakes"]}
                />
                <Bar
                  dataKey="count"
                  fill="#378ADD"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right: Data Table */}
          <div className="pl-0 lg:pl-4 pt-4 lg:pt-0">
            <div className="flex flex-col h-[280px]">
              {/* Table */}
              <div className="flex-1 overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Period
                      </th>
                      <th className="pb-2.5 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Checks
                      </th>
                      <th className="pb-2.5 text-right text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Deepfakes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, index) => {
                      const rowChecks = row.total_checks || 0
                      const rowDeepfakes = row.deepfakes ?? row.count
                      const pctOfTotal = rowChecks > 0 ? ((rowDeepfakes / rowChecks) * 100).toFixed(1) : "0.0"
                      
                      return (
                        <tr
                          key={row.originalDate}
                          className={index !== paginatedData.length - 1 ? "border-b border-border/50" : ""}
                        >
                          <td className="py-2 text-foreground">{row.date}</td>
                          <td className="py-2 text-right text-muted-foreground">
                            {rowChecks.toLocaleString()}
                          </td>
                          <td className="py-2 text-right">
                            <span className="text-foreground">{rowDeepfakes}</span>
                            <span className="ml-1.5 text-muted-foreground">{pctOfTotal}%</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((page, i) =>
                    typeof page === "number" ? (
                      <Button
                        key={i}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-7 w-7 p-0 text-xs"
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={i} className="px-1 text-muted-foreground text-xs">
                        {page}
                      </span>
                    )
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
