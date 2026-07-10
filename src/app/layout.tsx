import type { Metadata } from "next"
import { Barlow, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "IMAS - Investment Management & Automation System",
  description:
    "Investment Management & Automation System. Empowering entrepreneurs and investors to connect, collaborate, and grow.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
