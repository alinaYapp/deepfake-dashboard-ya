"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2 } from "lucide-react"
import { CasesTable } from "@/components/dashboard/cases-table"
import { CaseDrawer } from "@/components/dashboard/case-drawer"
import { mockCases, type Case } from "@/lib/mock-data"

export function AnalyzeDocumentsTab() {
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Upload Document
            </CardTitle>
            <CardDescription>
              Upload ID documents for authenticity verification. Supports JPEG, PNG, PDF formats.
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
                Drag and drop your document here, or <button className="text-primary hover:underline">browse</button>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Max file size: 10MB</p>
              <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="image/*,.pdf" />
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

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Document Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="text-sm font-medium">What We Analyze</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Photo manipulation detection</li>
                <li>• Text alteration analysis</li>
                <li>• Security feature verification</li>
                <li>• Document template matching</li>
                <li>• MRZ/barcode validation</li>
                <li>• Face liveness on ID photos</li>
              </ul>
            </div>

            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="text-sm font-medium">Supported Documents</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Passports (150+ countries)</li>
                <li>• National ID cards</li>
                <li>• Driver's licenses</li>
                <li>• Residence permits</li>
                <li>• Visa documents</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <CasesTable cases={mockCases} onViewCase={handleViewCase} filterByType="document_id" />

      <CaseDrawer caseData={selectedCase} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
