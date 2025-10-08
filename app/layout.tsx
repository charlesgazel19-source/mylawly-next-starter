import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MyLawly — Prototype",
  description: "Starter UI for MyLawly (User & Admin)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-bg text-text">
        <div className="max-w-[1100px] mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
