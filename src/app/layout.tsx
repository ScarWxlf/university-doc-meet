import type { Metadata } from "next";
import "./globals.css";
import '@livekit/components-styles';
import NextAuthSessionProvider from "@/providers/SessionProvider";
import { ToastContainer } from "react-toastify";
import Header from "@/layouts/Header";

export const metadata: Metadata = {
  title: "DMS",
  description: "Document and Meeting System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen flex-grow">
        <NextAuthSessionProvider>
          <Header/>
          {children}
          <ToastContainer/>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
