import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeatURL — Share Beats via URL",
  description: "A drum machine that encodes your beat pattern directly in the URL. Create, share, and remix beats instantly.",
  metadataBase: new URL("https://beaturl.vercel.app"),
  openGraph: {
    title: "BeatURL — Share Beats via URL",
    description: "Create drum patterns and share them as URLs. No account needed.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeatURL — Share Beats via URL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
