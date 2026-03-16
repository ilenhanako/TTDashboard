import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { LayoutClient } from "@/components/LayoutClient";
import { Providers } from "./providers";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "DALY Dashboard | Temasek Trust",
  description: "Asia Pacific DALY Burden Analysis Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
