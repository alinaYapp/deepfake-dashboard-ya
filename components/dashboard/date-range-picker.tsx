"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type PresetKey = "7d" | "30d" | "90d" | "1y" | "custom"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  activePreset: PresetKey
  onPresetChange: (preset: PresetKey) => void
}

const presets: { key: PresetKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "1y", label: "Last year" },
]

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  activePreset,
  onPresetChange,
}: DateRangePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handlePresetClick = (key: PresetKey) => {
    onPresetChange(key)
    const now = new Date()
    let from: Date

    switch (key) {
      case "7d":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case "30d":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
        break
      case "90d":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)
        break
      case "1y":
        from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        return
    }

    onDateRangeChange({ from, to: now })
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    onDateRangeChange(range)
    onPresetChange("custom")
    if (range?.from && range?.to) {
      setCalendarOpen(false)
    }
  }

  const displayLabel = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
    }
    if (dateRange?.from) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ...`
    }
    return "Select date range"
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {presets.map((preset) => (
          <Button
            key={preset.key}
            variant={activePreset === preset.key ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePresetClick(preset.key)}
            className={cn(
              "h-7 text-xs px-2.5",
              activePreset === preset.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={activePreset === "custom" ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-7 gap-1.5 text-xs px-2.5",
              activePreset === "custom"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{activePreset === "custom" ? displayLabel() : "Custom"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
