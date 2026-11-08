import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrivatePortfolio — Your portfolio, your privacy",
  description: "Privacy-first portfolio intelligence powered by NEAR AI Cloud and NEAR Intents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
