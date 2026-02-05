"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Video, Link, Loader2 } from "lucide-react"
import { CasesTable } from "@/components/dashboard/cases-table"
import { CaseDrawer } from "@/components/dashboard/case-drawer"
import { mockCases, type Case } from "@/lib/mock-data"

export function AnalyzeVideoTab() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleViewCase = (caseData: Case) => {
    setSelectedCase(caseData)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Upload Video
            </CardTitle>
            <CardDescription>
              Upload a video file for deepfake analysis. Supports MP4, WebM, MOV formats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Drag and drop your video here, or <button className="text-primary hover:underline">browse</button>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Max file size: 100MB</p>
              <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="video/*" />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or paste URL</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <div className="flex gap-2">
                <Input
                  id="video-url"
                  placeholder="https://example.com/video.mp4"
                  className="bg-secondary border-border"
                />
                <Button variant="outline" size="icon">
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Upload Content</h4>
                  <p className="text-sm text-muted-foreground">Upload a video file or provide a URL to analyze.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  2
                </div>
                <div>
                  <h4 className="font-medium">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Our models analyze for face swaps, lip sync anomalies, and injection attacks.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Get Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed analysis with confidence scores and detection breakdown.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="text-sm font-medium">Supported Checks</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Face swap detection</li>
                <li>• Lip sync analysis</li>
                <li>• Audio-visual mismatch</li>
                <li>• Injection attack detection</li>
                <li>• Replay attack detection</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <CasesTable cases={mockCases} onViewCase={handleViewCase} filterByType="video" />

      <CaseDrawer caseData={selectedCase} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
