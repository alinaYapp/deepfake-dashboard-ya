"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Clock,
  FileText,
  Camera,
  CheckCircle,
  AlertTriangle,
  Download,
  RotateCcw,
  Copy,
  QrCode,
  Shield,
  X,
  ChevronRight,
  Sparkles,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

// Demo document images (synthetic)
const demoDocuments = [
  { id: 1, type: "Passport", country: "USA", thumbnail: "/placeholder.svg?height=120&width=180" },
  { id: 2, type: "Driver's License", country: "UK", thumbnail: "/placeholder.svg?height=120&width=180" },
  { id: 3, type: "ID Card", country: "Germany", thumbnail: "/placeholder.svg?height=120&width=180" },
  { id: 4, type: "Passport", country: "France", thumbnail: "/placeholder.svg?height=120&width=180" },
  { id: 5, type: "Driver's License", country: "Canada", thumbnail: "/placeholder.svg?height=120&width=180" },
  { id: 6, type: "ID Card", country: "Spain", thumbnail: "/placeholder.svg?height=120&width=180" },
]

const demoSelfies = [
  { id: 1, label: "Deepfake Selfie A", thumbnail: "/placeholder.svg?height=160&width=120" },
  { id: 2, label: "Deepfake Selfie B", thumbnail: "/placeholder.svg?height=160&width=120" },
  { id: 3, label: "Deepfake Selfie C", thumbnail: "/placeholder.svg?height=160&width=120" },
]

type DemoStep = "welcome" | "document" | "selfie" | "processing" | "complete" | "results"

export function DemoTab() {
  const [step, setStep] = useState<DemoStep>("welcome")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showDocumentPicker, setShowDocumentPicker] = useState(false)
  const [showSelfiePicker, setShowSelfiePicker] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null)
  const [selectedSelfie, setSelectedSelfie] = useState<number | null>(null)
  const [uploadedDocument, setUploadedDocument] = useState<typeof demoDocuments[0] | null>(null)
  const [uploadedSelfie, setUploadedSelfie] = useState<typeof demoSelfies[0] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [timer] = useState("23:59:56")
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://am.dataspike.io/V6884B370B702ADCC")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSelectDocument = () => {
    if (selectedDocument) {
      const doc = demoDocuments.find((d) => d.id === selectedDocument)
      if (doc) {
        setShowDocumentPicker(false)
        setIsProcessing(true)
        setTimeout(() => {
          setUploadedDocument(doc)
          setIsProcessing(false)
        }, 1500)
      }
    }
  }

  const handleSelectSelfie = () => {
    if (selectedSelfie) {
      const selfie = demoSelfies.find((s) => s.id === selectedSelfie)
      if (selfie) {
        setShowSelfiePicker(false)
        setIsProcessing(true)
        setTimeout(() => {
          setUploadedSelfie(selfie)
          setIsProcessing(false)
        }, 1500)
      }
    }
  }

  const handleContinueToSelfie = () => {
    if (uploadedDocument) {
      setStep("selfie")
    }
  }

  const handleCompleteVerification = () => {
    if (uploadedSelfie) {
      setStep("processing")
      setTimeout(() => {
        setStep("complete")
      }, 2000)
    }
  }

  const handleRestart = () => {
    setStep("welcome")
    setTermsAccepted(false)
    setSelectedDocument(null)
    setSelectedSelfie(null)
    setUploadedDocument(null)
    setUploadedSelfie(null)
    setIsProcessing(false)
  }

  // Auto-advance when document/selfie is uploaded
  useEffect(() => {
    if (step === "document" && uploadedDocument && !isProcessing) {
      // Show continue button
    }
  }, [uploadedDocument, step, isProcessing])

  useEffect(() => {
    if (step === "selfie" && uploadedSelfie && !isProcessing) {
      handleCompleteVerification()
    }
  }, [uploadedSelfie, step, isProcessing])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Screen 1: Welcome */}
      {step === "welcome" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Let's get you verified</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono">{timer}</span>
            </div>
          </div>

          {/* Instruction Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#EEF0FB] p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <div className="h-20 w-20 mx-auto mb-4 bg-white/50 rounded-lg flex items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground font-medium">Prepare a valid identity document</p>
                  <button className="text-xs text-primary underline underline-offset-2 mt-1">Requirements</button>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#EEF0FB] p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <div className="h-20 w-20 mx-auto mb-4 bg-white/50 rounded-lg flex items-center justify-center">
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-foreground font-medium">Be prepared to take Selfie</p>
                  <button className="text-xs text-primary underline underline-offset-2 mt-1">Requirements</button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code and Link */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Continue on your phone</p>
                  <p className="text-xs text-muted-foreground">Scan QR code with your mobile phone camera</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <p className="text-sm font-medium text-foreground">Or copy the link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                  https://am.dataspike.io/V6884B370B702ADCC
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 px-1">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I accept{" "}
              <a href="#" className="text-primary underline underline-offset-2">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary underline underline-offset-2">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => setStep("document")}
            disabled={!termsAccepted}
            className="w-full h-12 text-base font-medium rounded-full"
          >
            Start verification
          </Button>
        </div>
      )}

      {/* Screen 2: Document Upload */}
      {step === "document" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setStep("welcome")} className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">First let's get photo of your document</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>English</span>
              <ChevronRight className="h-4 w-4 rotate-90" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className={cn("h-1.5 flex-1 rounded-full", uploadedDocument ? "bg-primary" : "bg-muted")} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary font-medium">Documents</span>
                <span className={cn(uploadedDocument ? "text-primary font-medium" : "text-muted-foreground")}>
                  Selfie
                </span>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="rounded-xl bg-[#EEF0FB] p-8 space-y-4">
            <p className="text-sm font-medium text-foreground">Main page</p>

            {uploadedDocument ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-primary bg-white shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <p className="text-xs font-medium text-foreground">{uploadedDocument.type}</p>
                    <p className="text-xs text-muted-foreground">{uploadedDocument.country}</p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <p className="text-sm text-green-600 font-medium">Document uploaded successfully</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-40 h-28 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center bg-white/50">
                  <div className="w-8 h-10 rounded bg-muted mb-2" />
                  <div className="space-y-1 w-20">
                    <div className="h-1 bg-muted rounded" />
                    <div className="h-1 bg-muted rounded w-3/4" />
                    <div className="h-1 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  File size must be between 100KB and 8MB
                  <br />
                  in .jpg / .jpeg / .png format
                </p>
                <button className="text-xs text-primary underline underline-offset-2 decoration-dashed">
                  Requirements
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {uploadedDocument ? (
              <Button onClick={handleContinueToSelfie} className="w-full h-12 text-base font-medium rounded-full">
                Continue to Selfie
              </Button>
            ) : (
              <Button disabled className="w-full h-12 text-base font-medium rounded-full">
                Take photo
              </Button>
            )}
          </div>

          {/* Demo Data Button */}
          {!uploadedDocument && (
            <div className="fixed bottom-8 right-8">
              <Button
                onClick={() => setShowDocumentPicker(true)}
                className="rounded-full px-5 shadow-lg bg-primary hover:bg-primary/90 animate-pulse"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Demo data
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Screen 3: Document Picker Overlay */}
      {showDocumentPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Select a demo document</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDocumentPicker(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {demoDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-3 transition-all hover:border-primary/50",
                    selectedDocument === doc.id ? "border-primary bg-primary/5" : "border-muted",
                  )}
                >
                  <div className="aspect-[3/2] rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 mb-2 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-slate-400 mb-1" />
                      <div className="w-12 h-1 bg-slate-300 rounded mb-0.5" />
                      <div className="w-8 h-1 bg-slate-300 rounded" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-foreground">{doc.type}</p>
                  <p className="text-xs text-muted-foreground">{doc.country}</p>
                  {selectedDocument === doc.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={handleSelectDocument}
              disabled={!selectedDocument}
              className="w-full h-11 rounded-full font-medium"
            >
              Select
            </Button>
          </div>
        </div>
      )}

      {/* Screen 4: Selfie / Liveness */}
      {step === "selfie" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setStep("document")} className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">Now Selfie</h1>
            </div>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary font-medium">Documents</span>
                <span className="text-primary font-medium">Selfie</span>
              </div>
            </div>
          </div>

          {/* Camera View */}
          <div className="relative rounded-xl bg-slate-900 aspect-[4/3] overflow-hidden">
            {uploadedSelfie ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="text-center space-y-3">
                  <div className="w-24 h-32 mx-auto rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    <User className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-sm text-green-400 font-medium">Selfie captured</p>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-primary/80 text-sm font-medium">Align your face with the contour</p>
                </div>
                {/* Oval Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-64 rounded-full border-4 border-white/30 border-dashed" />
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button disabled className="flex-1 h-12 text-base font-medium rounded-full">
              Take photo
            </Button>
            <Button variant="outline" disabled className="flex-1 h-12 text-base font-medium rounded-full">
              Upload a file
            </Button>
          </div>

          {/* Demo Data Button */}
          {!uploadedSelfie && (
            <div className="fixed bottom-8 right-8">
              <Button
                onClick={() => setShowSelfiePicker(true)}
                className="rounded-full px-5 shadow-lg bg-primary hover:bg-primary/90 animate-pulse"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Demo data
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Selfie Picker Overlay */}
      {showSelfiePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Select a demo selfie</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowSelfiePicker(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {demoSelfies.map((selfie) => (
                <button
                  key={selfie.id}
                  onClick={() => setSelectedSelfie(selfie.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-3 transition-all hover:border-primary/50",
                    selectedSelfie === selfie.id ? "border-primary bg-primary/5" : "border-muted",
                  )}
                >
                  <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 mb-2 flex items-center justify-center">
                    <User className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-xs font-medium text-foreground text-center">{selfie.label}</p>
                  {selectedSelfie === selfie.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={handleSelectSelfie}
              disabled={!selectedSelfie}
              className="w-full h-11 rounded-full font-medium"
            >
              Select
            </Button>
          </div>
        </div>
      )}

      {/* Processing Screen */}
      {step === "processing" && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
          <p className="text-lg font-medium text-foreground">Processing verification...</p>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
        </div>
      )}

      {/* Screen 5: Completion */}
      {step === "complete" && (
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Thank you!</h1>
          <p className="text-muted-foreground mb-2">Your verification is complete.</p>
          <p className="text-sm text-muted-foreground mb-8">All required documents have been successfully uploaded.</p>
          <Button
            onClick={() => setStep("results")}
            variant="outline"
            className="rounded-full px-8 h-11 font-medium"
          >
            Check verification details
          </Button>
        </div>
      )}

      {/* Results Screen */}
      {step === "results" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Verification Results</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                REJECTED
              </span>
            </div>
          </div>

          {/* Overall Verdict */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Deepfake Detected</h2>
                <p className="text-sm text-red-700">The submitted documents and selfie have been identified as synthetic or manipulated.</p>
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <h3 className="font-medium text-foreground">Detection Breakdown</h3>
            </div>
            <div className="divide-y">
              <div className="flex items-center px-5 py-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Document</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedDocument ? `${uploadedDocument.type} (${uploadedDocument.country})` : "Driver's License (Main page)"}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm font-mono font-semibold text-red-600">0.94</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">FAKE</span>
              </div>
              <div className="flex items-center px-5 py-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Selfie / Liveness</p>
                  <p className="text-xs text-muted-foreground">Video selfie</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm font-mono font-semibold text-red-600">0.89</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">FAKE</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-medium text-foreground">Detection Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Document</p>
                  <p className="text-muted-foreground">Synthetic document signature detected (NanoBanana generator)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Camera className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Selfie</p>
                  <p className="text-muted-foreground">Face manipulation artifacts detected — deepfake</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Codes */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="font-medium text-foreground">Error Codes</h3>
            <div className="flex flex-wrap gap-2">
              <code className="px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs font-mono">
                SYNTHETIC_DOCUMENT_DETECTED
              </code>
              <code className="px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs font-mono">
                DEEPFAKE_DETECTED
              </code>
            </div>
          </div>

          {/* Session Metadata */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-medium text-foreground mb-3">Session Metadata</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Applicant ID</p>
                <p className="font-mono text-foreground">APL-7829-DEMO</p>
              </div>
              <div>
                <p className="text-muted-foreground">Session ID</p>
                <p className="font-mono text-foreground">SES-4521-KYC</p>
              </div>
              <div>
                <p className="text-muted-foreground">Timestamp</p>
                <p className="font-mono text-foreground">{new Date().toISOString().split("T")[0]}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-11 rounded-full font-medium">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
            <Button onClick={handleRestart} variant="ghost" className="flex-1 h-11 rounded-full font-medium">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart Demo
            </Button>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-background rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  )
}
