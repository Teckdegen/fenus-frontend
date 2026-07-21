import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "FENUS App",
  description: "Borrow, Invest & Trade tokenized stocks on LitVM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <TopNav />
        {/* pt-12 clears the fixed top nav, pb-16 clears the mobile bottom nav */}
        <main className="pt-12 pb-16 md:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
