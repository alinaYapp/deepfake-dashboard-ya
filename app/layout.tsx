import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, DM_Sans, JetBrains_Mono } from "next/font/google"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

export const metadata: Metadata = {
  title: "Data Spike - Deepfake Detection Platform",
  description: "Enterprise deepfake detection dashboard for video, audio, and document verification",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_dmSans.variable} ${_jetbrainsMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
