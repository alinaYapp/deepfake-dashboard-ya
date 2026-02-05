"use client"

import { Search, Bell, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TopBarProps {
  environment: "production" | "sandbox"
  onEnvironmentChange: (env: "production" | "sandbox") => void
}

export function TopBar({ environment, onEnvironmentChange }: TopBarProps) {
  const apiBaseUrl =
    environment === "production" ? "https://api.dataspike.io/v1" : "https://sandbox.api.dataspike.io/v1"

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left: Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search checks, applicants..."
            className="w-80 pl-9 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Right: Environment Toggle + User */}
      <div className="flex items-center gap-4">
        {/* API Base URL */}
        <code className="hidden lg:block text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
          {apiBaseUrl}
        </code>

        {/* Environment Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Badge
                variant="outline"
                className={
                  environment === "production"
                    ? "border-success bg-success/10 text-success"
                    : "border-warning bg-warning/10 text-warning"
                }
              >
                {environment === "production" ? "Production" : "Sandbox"}
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEnvironmentChange("production")}>
              <span className="mr-2 h-2 w-2 rounded-full bg-success" />
              Production
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEnvironmentChange("sandbox")}>
              <span className="mr-2 h-2 w-2 rounded-full bg-warning" />
              Sandbox
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">JD</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">John Doe</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem className="text-danger">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
