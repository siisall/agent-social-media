import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Social Media",
  description: "Sign in to your Agent Social Media workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
