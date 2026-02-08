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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
