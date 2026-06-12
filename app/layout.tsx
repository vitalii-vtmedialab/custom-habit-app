import type { Metadata, Viewport } from "next";
import "./globals.css";
import TabBar from "@/components/TabBar";

export const metadata: Metadata = {
  title: "Pace",
  description: "Personal habit & goal tracking",
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pace",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F2F7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-dvh max-w-6xl">
          <TabBar />
          <main className="min-w-0 flex-1 px-4 pb-32 pt-[max(16px,var(--safe-top))] md:px-10 md:pb-16 md:pt-10">
            <div className="mx-auto max-w-xl md:max-w-2xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
