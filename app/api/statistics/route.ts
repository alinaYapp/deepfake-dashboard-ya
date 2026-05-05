import { NextRequest, NextResponse } from "next/server"
import type { StatisticsResponse } from "@/lib/statistics-types"

const ORGANIZATION_ID = process.env.DATASPIKE_ORGANIZATION_ID || "demo"
const API_BASE_URL = process.env.DATASPIKE_API_URL || "https://api.dataspike.io"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from or to parameters" }, { status: 400 })
  }

  try {
    const apiUrl = `${API_BASE_URL}/webapi/v4/deepfake/${ORGANIZATION_ID}/statistics?from=${from}&to=${to}`
    
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(process.env.DATASPIKE_API_KEY && {
          Authorization: `Bearer ${process.env.DATASPIKE_API_KEY}`,
        }),
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      // Return mock data for demo/development
      const mockData = generateMockData(from, to)
      return NextResponse.json(mockData)
    }

    const data: StatisticsResponse = await response.json()
    return NextResponse.json(data)
  } catch {
    // Return mock data on error for demo purposes
    const mockData = generateMockData(from, to)
    return NextResponse.json(mockData)
  }
}

function generateMockData(from: string, to: string): StatisticsResponse {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Generate trend data based on period
  const isWeeklyBinning = daysDiff > 90
  const binSize = isWeeklyBinning ? 7 : 1
  const numBins = Math.ceil(daysDiff / binSize)
  
  const detection_trend: { date: string; count: number }[] = []
  for (let i = 0; i < numBins; i++) {
    const date = new Date(fromDate)
    date.setDate(date.getDate() + i * binSize)
    detection_trend.push({
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 50) + 10,
    })
  }

  const total_checks = detection_trend.reduce((sum, p) => sum + p.count * 100, 0)
  const deepfakes_detected = Math.floor(total_checks * 0.012)

  return {
    total_checks,
    total_checks_change_pct: Math.random() > 0.5 ? 12.5 : -8.3,
    deepfakes_detected,
    detection_rate_pct: Number(((deepfakes_detected / total_checks) * 100).toFixed(2)),
    corrected_verdicts: Math.floor(deepfakes_detected * 0.03),
    correction_rate_pct: 0.45,
    detection_trend,
    detection_by_type: {
      selfie_liveness: 45,
      document_id: 28,
      video: 18,
      audio: 9,
    },
  }
}
