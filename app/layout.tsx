import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const description = "Tokenized stocks, onchain 24/7. Borrow FnUSD against wzkLTC and trade real markets on LitVM.";

// FENUS X banner, used as the link preview on Telegram, X, Discord and others.
const banner = {
  url: "https://pbs.twimg.com/profile_banners/2052709372287918082/1783565978/1500x500",
  width: 1500,
  height: 500,
  alt: "FENUS",
};

export const metadata: Metadata = {
  title: "FENUS",
  description,
  openGraph: {
    type: "website",
    siteName: "FENUS",
    title: "FENUS",
    description,
    images: [banner],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fenus_protocol",
    title: "FENUS",
    description,
    images: [banner.url],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className={`${sans.className} min-h-full`}>{children}</body>
    </html>
  );
}
