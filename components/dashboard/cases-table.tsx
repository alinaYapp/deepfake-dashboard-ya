"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { type Case, formatBytes, formatDate } from "@/lib/mock-data"
import { downloadReport, downloadBulkReport } from "@/lib/pdf-generator"
import { Eye, Download, FileDown, Pencil, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CasesTableProps {
  cases: Case[]
  onViewCase: (caseData: Case) => void
  onUpdateCase?: (updatedCase: Case) => void
  filterByType?: Case["job_type"]
}

export function CasesTable({ cases, onViewCase, onUpdateCase, filterByType }: CasesTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [verdictFilter, setVerdictFilter] = useState<string>("all")
  const [tableDateRange, setTableDateRange] = useState<DateRange | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Edit verdict state
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const [editVerdict, setEditVerdict] = useState<Case["verdict"]>("real")
  const [editReason, setEditReason] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (filterByType && c.job_type !== filterByType) return false
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (typeFilter !== "all" && c.job_type !== typeFilter) return false
      if (verdictFilter !== "all" && c.verdict !== verdictFilter) return false
      if (tableDateRange?.from && tableDateRange?.to) {
        const d = new Date(c.created_at)
        if (d < tableDateRange.from || d > tableDateRange.to) return false
      }
      return true
    })
  }, [cases, filterByType, statusFilter, typeFilter, verdictFilter, tableDateRange])

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

  const getVerdictBadge = (verdict: Case["verdict"], edited?: boolean) => {
    const variants = {
      real: "bg-success/10 text-success border-success/20",
      fake: "bg-danger/10 text-danger border-danger/20",
      uncertain: "bg-warning/10 text-warning border-warning/20",
    }
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className={variants[verdict]}>
          {verdict}
        </Badge>
        {edited && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0">
            edited
          </Badge>
        )}
      </div>
    )
  }

  const handleOpenEditDialog = (caseData: Case) => {
    setEditingCase(caseData)
    setEditVerdict(caseData.verdict)
    setEditReason(caseData.verdict_reason || "")
    setEditDialogOpen(true)
  }

  const handleSaveVerdict = () => {
    if (!editingCase) return
    const updatedCase: Case = {
      ...editingCase,
      verdict: editVerdict,
      verdict_edited: true,
      verdict_reason: editReason,
    }
    onUpdateCase?.(updatedCase)
    setEditDialogOpen(false)
    setEditingCase(null)
    setEditReason("")
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setTableDateRange(range)
    if (range?.from && range?.to) {
      setCalendarOpen(false)
    }
  }

  const clearDateFilter = () => {
    setTableDateRange(undefined)
  }

  const dateLabel = tableDateRange?.from && tableDateRange?.to
    ? `${format(tableDateRange.from, "MMM d, yyyy")} - ${format(tableDateRange.to, "MMM d, yyyy")}`
    : tableDateRange?.from
      ? `${format(tableDateRange.from, "MMM d, yyyy")} - ...`
      : "Filter by date"

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-medium">Recent Checks</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={tableDateRange?.from ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 gap-1.5 text-xs",
                      tableDateRange?.from
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary border-border text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{dateLabel}</span>
                    <span className="sm:hidden">Date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="flex flex-col">
                    <div className="flex flex-wrap gap-1 border-b border-border p-2">
                      {[
                        { label: "Last 7 days", days: 7 },
                        { label: "Last 30 days", days: 30 },
                        { label: "Last 90 days", days: 90 },
                        { label: "Last year", days: 365 },
                      ].map((preset) => (
                        <Button
                          key={preset.label}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const now = new Date()
                            const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - preset.days)
                            setTableDateRange({ from, to: now })
                            setCalendarOpen(false)
                          }}
                        >
                          {preset.label}
                        </Button>
                      ))}
                      {tableDateRange?.from && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-danger hover:text-danger"
                          onClick={clearDateFilter}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Calendar
                      mode="range"
                      defaultMonth={tableDateRange?.from}
                      selected={tableDateRange}
                      onSelect={handleCalendarSelect}
                      numberOfMonths={2}
                    />
                  </div>
                </PopoverContent>
              </Popover>

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
                  <TableHead className="text-muted-foreground">Thumbnail</TableHead>
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
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No checks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((caseData) => (
                    <TableRow key={caseData.id} className="border-border">
                      <TableCell className="font-mono text-sm">{caseData.id}</TableCell>
                      <TableCell>
                        <div className="relative h-10 w-10 overflow-hidden rounded-md bg-secondary">
                          <Image
                            src={caseData.thumbnail_url}
                            alt={`Preview for ${caseData.id}`}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      </TableCell>
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
                      <TableCell>{getVerdictBadge(caseData.verdict, caseData.verdict_edited)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(caseData.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onViewCase(caseData)} className="gap-1 px-2">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(caseData)}
                            className="px-2"
                            title="Edit Verdict"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit Verdict</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void downloadReport(caseData)}
                            className="px-2"
                            title="Download Report"
                          >
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">Download Report</span>
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

      {/* Edit Verdict Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Verdict</DialogTitle>
            <DialogDescription>
              Override the verdict for check{" "}
              <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">
                {editingCase?.id}
              </code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Verdict</Label>
              <Select value={editVerdict} onValueChange={(v) => setEditVerdict(v as Case["verdict"])}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real">Real</SelectItem>
                  <SelectItem value="fake">Fake</SelectItem>
                  <SelectItem value="uncertain">Uncertain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Explain the reason for this override..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="min-h-24 bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSaveVerdict}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
