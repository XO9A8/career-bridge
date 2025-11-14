import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { ClientComponents } from "@/components/ClientComponents";
import { Toaster } from "@/components/ui/sonner";
import FloatingMentorButton from "@/components/FloatingMentorButton";
import Script from "next/script";

// Optimize font loading with next/font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
});

export const metadata: Metadata = {
  title: "CareerBridge - AI-Powered Career Platform",
  description: "Discover your perfect career path with AI-powered recommendations, curated job opportunities, and personalized learning resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const storedTheme = localStorage.getItem("theme");
                const htmlElement = document.documentElement;
                if (storedTheme === "light") {
                  htmlElement.classList.remove("dark");
                } else {
                  htmlElement.classList.add("dark");
                  if (!storedTheme) {
                    localStorage.setItem("theme", "dark");
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased ${inter.variable} ${poppins.variable}`}>
        <ThemeProvider>
          <ClientComponents />
          <FloatingMentorButton />
          <Toaster />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="lazyOnload"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}