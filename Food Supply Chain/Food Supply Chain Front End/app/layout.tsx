import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import Loader from "./components/shared/loader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlockReal App",
  description: "BlockReal App - A Blockchain based Property dealing web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />

        <Loader />
      </body>
    </html>
  );
}
