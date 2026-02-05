"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Case, formatBytes, formatDate } from "@/lib/mock-data"
import { downloadReport, downloadBulkReport } from "@/lib/pdf-generator"
import { Eye, Download, FileDown } from "lucide-react"

interface CasesTableProps {
  cases: Case[]
  onViewCase: (caseData: Case) => void
  filterByType?: Case["job_type"]
}

export function CasesTable({ cases, onViewCase, filterByType }: CasesTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [verdictFilter, setVerdictFilter] = useState<string>("all")

  const filteredCases = cases.filter((c) => {
    if (filterByType && c.job_type !== filterByType) return false
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (typeFilter !== "all" && c.job_type !== typeFilter) return false
    if (verdictFilter !== "all" && c.verdict !== verdictFilter) return false
    return true
  })

  const getStatusBadge = (status: Case["status"]) => {
    const variants = {
      completed: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      failed: "bg-danger/10 text-danger border-danger/20",
    }
    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    )
  }

  const getVerdictBadge = (verdict: Case["verdict"]) => {
    const variants = {
      real: "bg-success/10 text-success border-success/20",
      fake: "bg-danger/10 text-danger border-danger/20",
      uncertain: "bg-warning/10 text-warning border-warning/20",
    }
    return (
      <Badge variant="outline" className={variants[verdict]}>
        {verdict}
      </Badge>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-medium">Recent Checks</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-secondary border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            {!filterByType && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 bg-secondary border-border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="selfie_liveness">Selfie Liveness</SelectItem>
                  <SelectItem value="document_id">Document ID</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={verdictFilter} onValueChange={setVerdictFilter}>
              <SelectTrigger className="w-32 bg-secondary border-border">
                <SelectValue placeholder="Verdict" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verdicts</SelectItem>
                <SelectItem value="real">Real</SelectItem>
                <SelectItem value="fake">Fake</SelectItem>
                <SelectItem value="uncertain">Uncertain</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => void downloadBulkReport(filteredCases)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Check ID</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Content</TableHead>
                <TableHead className="text-muted-foreground">Size</TableHead>
                <TableHead className="text-muted-foreground">Score</TableHead>
                <TableHead className="text-muted-foreground">Verdict</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No checks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((caseData) => (
                  <TableRow key={caseData.id} className="border-border">
                    <TableCell className="font-mono text-sm">{caseData.id}</TableCell>
                    <TableCell>{getStatusBadge(caseData.status)}</TableCell>
                    <TableCell className="capitalize">{caseData.job_type.replace("_", " ")}</TableCell>
                    <TableCell className="text-muted-foreground">{caseData.content_type}</TableCell>
                    <TableCell className="text-muted-foreground">{formatBytes(caseData.file_size_bytes)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          caseData.score > 0.7 ? "text-danger" : caseData.score > 0.4 ? "text-warning" : "text-success"
                        }
                      >
                        {caseData.score.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{getVerdictBadge(caseData.verdict)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(caseData.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onViewCase(caseData)} className="gap-1 px-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void downloadReport(caseData)}
                          className="px-2"
                          title="Download Report"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
