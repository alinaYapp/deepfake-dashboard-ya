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

const ROWS_PER_PAGE = 10

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" })
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" })
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}`
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`
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

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Detection Trend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Detection Trend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isWeeklyBinning && (
          <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Data grouped by week (period &gt; 90 days)</span>
          </div>
        )}

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0de" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b6b6b", fontSize: 12 }}
                axisLine={{ stroke: "#e0e0de" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b6b6b", fontSize: 12 }}
                axisLine={{ stroke: "#e0e0de" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0e0de",
                  borderRadius: "8px",
                  color: "#1a1a1a",
                }}
                labelStyle={{ color: "#6b6b6b" }}
              />
              <Bar
                dataKey="count"
                fill="#378ADD"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Paginated Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Checks</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Deepfakes</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={row.originalDate}
                  className={index !== paginatedData.length - 1 ? "border-b border-border" : ""}
                >
                  <td className="px-4 py-3 text-sm text-foreground">{row.date}</td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                    {row.total_checks?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {row.deepfakes?.toLocaleString() ?? row.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t border-border bg-secondary/30 px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
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
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={i} className="px-2 text-muted-foreground">
                    {page}
                  </span>
                )
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
