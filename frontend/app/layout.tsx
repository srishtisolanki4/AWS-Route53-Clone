import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";

import "./globals.css";

export const metadata: Metadata = {
  title: "AWS Route 53",
  description: "Route 53 Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}