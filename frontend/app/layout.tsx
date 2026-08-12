import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/core/providers/QueryProvider";
import I18nProvider from "@/core/lang/components/I18nProvider";
import { AuthProvider } from "@/core/providers/AuthProvider";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MAIAI",
  description: "MAIAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${onest.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <I18nProvider>
          <AuthProvider>
            <QueryProvider>{children}</QueryProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
