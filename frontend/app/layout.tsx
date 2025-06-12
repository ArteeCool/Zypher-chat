import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import TrustBackendModal from "./components/TrustBackendModal";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zypher chat",
  description: "New chat called Zypher, where you can chat with your friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${roboto.className}`}>
        <TrustBackendModal />
        <Header />
        {children}
      </body>
    </html>
  );
}
