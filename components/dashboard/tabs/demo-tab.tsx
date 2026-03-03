"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Download,
  RotateCcw,
  Eye,
  ScanFace,
  FileSearch,
  FlaskConical,
  Clock,
  Shield,
  ChevronRight,
  Play,
  File,
  Video,
  Image,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type DemoScreen = "selection" | "detail" | "processing" | "results"
type Scenario = "human" | "document" | null

// Test data for scenarios
const scenarioData = {
  human: {
    title: "Deepfake: Human",
    subtitle: "Selfie, liveness check, video analysis",
    description: "Test how the system detects face swaps, deepfake selfies, and liveness spoofing attacks",
    icon: ScanFace,
    whatTesting: "Detection of face manipulation in selfie and liveness video. The system analyzes temporal consistency, facial landmarks, and compression artifacts.",
    models: ["FaceForensics++", "Liveness v3.2", "Temporal Analysis"],
    expectedResult: "Verdict: FAKE — deepfake detected with high confidence",
    testFiles: [
      { name: "selfie_video.mp4", size: "2.4 MB", type: "video" },
      { name: "face_crop.jpg", size: "156 KB", type: "image" },
    ],
    result: {
      verdict: "FAKE",
      score: 0.92,
      summary: "Deepfake detected — face manipulation artifacts found",
      checkType: "Selfie / Liveness",
      model: "FaceForensics++ v3.2",
      errorCode: "DEEPFAKE_DETECTED",
      processingTime: "2.4s",
      sessionId: "demo_sess_a1b2c3",
    },
  },
  document: {
    title: "Deepfake: Document",
    subtitle: "Synthetic identity documents",
    description: "Test how the system detects AI-generated and manipulated identity documents",
    icon: FileSearch,
    whatTesting: "Detection of AI-generated identity documents. The system analyzes font consistency, microprint, security features, and generator signatures.",
    models: ["DocAuth v2.4", "NanoBanana Detector", "EXIF Analyzer"],
    expectedResult: "Verdict: FAKE — synthetic document detected",
    testFiles: [
      { name: "passport_scan.jpg", size: "1.8 MB", type: "image" },
      { name: "drivers_license.jpg", size: "892 KB", type: "image" },
    ],
    result: {
      verdict: "FAKE",
      score: 0.89,
      summary: "Synthetic document detected — generator signature matched",
      checkType: "Identity Document",
      model: "DocAuth v2.4",
      errorCode: "SYNTHETIC_DOCUMENT_DETECTED",
      processingTime: "1.8s",
      sessionId: "demo_sess_d4e5f6",
      documentType: "Driver's License",
      issuingCountry: "United Kingdom",
      generatorDetected: "NanoBanana v2.1",
      exifAnomalies: 3,
    },
  },
}

const processingSteps = [
  "Uploading test data...",
  "Running model inference...",
  "Generating heatmap...",
  "Compiling results...",
]

export function DemoTab() {
  const [screen, setScreen] = useState<DemoScreen>("selection")
  const [scenario, setScenario] = useState<Scenario>(null)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [activeStep, setActiveStep] = useState(0)
  const [showTestDataModal, setShowTestDataModal] = useState(false)
  const [scoreAnimated, setScoreAnimated] = useState(0)

  // Processing animation
  useEffect(() => {
    if (screen === "processing") {
      setProgress(0)
      setCompletedSteps([])
      setActiveStep(0)

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 2.5
        })
      }, 100)

      // Step completion timing
      const stepTimings = [800, 1600, 2800, 3600]
      stepTimings.forEach((time, index) => {
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, index])
          setActiveStep(index + 1)
        }, time)
      })

      // Transition to results
      setTimeout(() => {
        setScreen("results")
      }, 4200)

      return () => clearInterval(progressInterval)
    }
  }, [screen])

  // Score animation
  useEffect(() => {
    if (screen === "results" && scenario) {
      const targetScore = scenarioData[scenario].result.score
      const duration = 1000
      const startTime = Date.now()

      const animateScore = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3)
        setScoreAnimated(targetScore * eased)

        if (progress < 1) {
          requestAnimationFrame(animateScore)
        }
      }

      requestAnimationFrame(animateScore)
    }
  }, [screen, scenario])

  const handleSelectScenario = (selected: Scenario) => {
    setScenario(selected)
    setScreen("detail")
  }

  const handleProceed = () => {
    setScreen("processing")
  }

  const handleRunAgain = () => {
    setScreen("processing")
  }

  const handleTryAnother = () => {
    setScenario(null)
    setScreen("selection")
  }

  const handleBack = () => {
    if (screen === "detail") {
      setScenario(null)
      setScreen("selection")
    } else if (screen === "results") {
      setScreen("detail")
    }
  }

  const currentScenario = scenario ? scenarioData[scenario] : null

  return (
    <div className="min-h-[calc(100vh-120px)] relative">
      {/* Demo Mode Banner */}
      <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 w-fit">
        <FlaskConical className="h-4 w-4 text-amber-600" />
        <span className="text-sm text-amber-800 font-medium">
          Demo Mode — isolated environment, no data is stored
        </span>
      </div>

      {/* Demo Watermark */}
      <div className="fixed top-4 right-4 z-10">
        <div className="px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-medium text-primary">
          DEMO
        </div>
      </div>

      {/* Screen 1: Scenario Selection */}
      {screen === "selection" && (
        <div className="animate-in fade-in duration-300">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Demo</h1>
              <p className="text-muted-foreground">
                Choose a scenario to explore deepfake detection capabilities. All data is synthetic — nothing is saved to production.
              </p>
            </div>

            {/* Scenario Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deepfake: Human */}
              <button
                onClick={() => handleSelectScenario("human")}
                className="group relative rounded-xl border border-border bg-card p-6 text-left transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F1FA] text-primary">
                    <ScanFace className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Deepfake: Human</h3>
                    <p className="text-sm text-muted-foreground mb-3">Selfie, liveness check, video analysis</p>
                    <p className="text-sm text-muted-foreground/80">
                      Test how the system detects face swaps, deepfake selfies, and liveness spoofing attacks
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                  Start <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </button>

              {/* Deepfake: Document */}
              <button
                onClick={() => handleSelectScenario("document")}
                className="group relative rounded-xl border border-border bg-card p-6 text-left transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F1FA] text-primary">
                    <FileSearch className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">Deepfake: Document</h3>
                    <p className="text-sm text-muted-foreground mb-3">Synthetic identity documents</p>
                    <p className="text-sm text-muted-foreground/80">
                      Test how the system detects AI-generated and manipulated identity documents
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                  Start <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Scenario Detail */}
      {screen === "detail" && currentScenario && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Demo</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{currentScenario.title}</span>
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-foreground mb-6">{currentScenario.title}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scenario Info Card */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Scenario Info</h2>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      What we're testing
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">{currentScenario.whatTesting}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Models used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentScenario.models.map((model) => (
                        <span
                          key={model}
                          className="px-2.5 py-1 rounded-full bg-[#F0F1FA] text-xs font-medium text-foreground"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Expected result
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold">FAKE</span>
                      <span className="text-sm text-foreground">— {currentScenario.result.summary.split("—")[1]?.trim()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Data Card */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Test Data</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {currentScenario.testFiles.map((file) => (
                    <div key={file.name} className="rounded-lg bg-[#F0F1FA] p-4">
                      <div className="aspect-video rounded-md bg-slate-200 mb-3 flex items-center justify-center">
                        {file.type === "video" ? (
                          <Video className="h-8 w-8 text-slate-400" />
                        ) : (
                          <Image className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTestDataModal(true)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View test data
                </Button>

                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Pre-loaded • Isolated
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col items-end">
              <Button onClick={handleProceed} size="lg" className="px-8">
                <Play className="h-4 w-4 mr-2" />
                Proceed
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will run a simulated detection — no data leaves this environment
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Processing */}
      {screen === "processing" && (
        <div className="animate-in fade-in duration-300">
          <div className="max-w-md mx-auto text-center py-16">
            {/* Demo Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-8xl font-bold text-foreground rotate-[-15deg]">DEMO</span>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-8">Running analysis...</h2>

            {/* Progress Bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-8">
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3 text-left">
              {processingSteps.map((step, index) => {
                const isCompleted = completedSteps.includes(index)
                const isActive = activeStep === index && !isCompleted
                return (
                  <div
                    key={step}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300",
                      isCompleted && "bg-green-50",
                      isActive && "bg-primary/5",
                      !isCompleted && !isActive && "opacity-50"
                    )}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : isActive ? (
                      <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        isCompleted && "text-green-700 font-medium",
                        isActive && "text-primary font-medium",
                        !isCompleted && !isActive && "text-muted-foreground"
                      )}
                    >
                      {step}
                      {isCompleted && " ✓"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Results */}
      {screen === "results" && currentScenario && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleTryAnother}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to scenarios
              </button>
            </div>

            {/* Verdict Banner */}
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-red-500 text-white text-xl font-bold animate-in zoom-in duration-500">
                    {currentScenario.result.verdict}
                  </span>
                  <p className="text-lg text-foreground">{currentScenario.result.summary}</p>
                </div>
                <div className="flex flex-col items-center">
                  {/* Score Gauge */}
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${scoreAnimated * 100}, 100`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-foreground">
                        {scoreAnimated.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Score</span>
                </div>
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Detection Heatmap</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">Original</p>
                  <div className="aspect-video rounded-lg bg-slate-200 flex items-center justify-center relative overflow-hidden">
                    {scenario === "human" ? (
                      <ScanFace className="h-16 w-16 text-slate-400" />
                    ) : (
                      <File className="h-16 w-16 text-slate-400" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">Heatmap Overlay</p>
                  <div className="aspect-video rounded-lg bg-slate-200 flex items-center justify-center relative overflow-hidden">
                    {/* Simulated heatmap overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-yellow-500/30 to-blue-500/20" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-red-500/50 via-transparent to-transparent" />
                    {scenario === "human" ? (
                      <ScanFace className="h-16 w-16 text-slate-600 relative z-10" />
                    ) : (
                      <File className="h-16 w-16 text-slate-600 relative z-10" />
                    )}
                    {/* Hotspots */}
                    <div className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-red-500/60 blur-md animate-pulse" />
                    <div className="absolute top-1/2 right-1/4 w-6 h-6 rounded-full bg-red-500/50 blur-md animate-pulse" style={{ animationDelay: "0.5s" }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>High manipulation probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Low</span>
                </div>
              </div>
            </div>

            {/* Details Table */}
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Details</h2>
              <div className="divide-y divide-border">
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Verdict</span>
                  <span className="px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold">FAKE</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Confidence Score</span>
                  <span className="text-sm font-medium text-foreground">{currentScenario.result.score}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Check Type</span>
                  <span className="text-sm font-medium text-foreground">{currentScenario.result.checkType}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Model</span>
                  <span className="text-sm font-medium text-foreground">{currentScenario.result.model}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Error Code</span>
                  <span className="text-sm font-mono text-red-600">{currentScenario.result.errorCode}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Processing Time</span>
                  <span className="text-sm font-medium text-foreground">{currentScenario.result.processingTime}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Session ID</span>
                  <span className="text-sm font-mono text-foreground">{currentScenario.result.sessionId}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm text-muted-foreground">Timestamp</span>
                  <span className="text-sm font-medium text-foreground">2025-03-03 14:32:07 UTC</span>
                </div>
                {scenario === "document" && (
                  <>
                    <div className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">Document Type</span>
                      <span className="text-sm font-medium text-foreground">{currentScenario.result.documentType}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">Issuing Country</span>
                      <span className="text-sm font-medium text-foreground">{currentScenario.result.issuingCountry}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">Generator Detected</span>
                      <span className="text-sm font-medium text-foreground">{currentScenario.result.generatorDetected}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">EXIF Anomalies</span>
                      <span className="text-sm font-medium text-foreground">{currentScenario.result.exifAnomalies} found</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* PDF Report Preview */}
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Detection Report</h2>
              <div className="relative rounded-lg border border-border bg-white p-6 shadow-sm">
                {/* Mini PDF Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">DataSpike Detection Report</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold">FAKE</span>
                    <span className="text-xs text-muted-foreground">Confidence: {currentScenario.result.score}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-3/4 bg-slate-100 rounded" />
                    <div className="h-2 w-1/2 bg-slate-100 rounded" />
                    <div className="h-2 w-2/3 bg-slate-100 rounded" />
                  </div>
                </div>
                {/* DEMO Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-5xl font-bold text-slate-200 rotate-[-15deg]">DEMO</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm" className="text-primary">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Report
                </Button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between py-4">
              <Button variant="outline" onClick={handleRunAgain}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Run Again
              </Button>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTryAnother}
                  className="text-sm text-primary hover:underline"
                >
                  Try Another Scenario
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Data Modal */}
      {showTestDataModal && currentScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Test Data Preview</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowTestDataModal(false)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {currentScenario.testFiles.map((file) => (
                <div key={file.name} className="rounded-lg border border-border p-4">
                  <div className="aspect-video rounded-md bg-slate-100 mb-3 flex items-center justify-center">
                    {file.type === "video" ? (
                      <Video className="h-12 w-12 text-slate-400" />
                    ) : (
                      <Image className="h-12 w-12 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              These files are pre-loaded synthetic test data. No real personal information is included.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
