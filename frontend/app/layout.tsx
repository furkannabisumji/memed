import type { Metadata } from "next";
import "./globals.css";

import { Albert_Sans } from "next/font/google";
import { Web3Provider } from "@/providers/Web3Provider";
// import CustomApolloProvider from "@/providers/ApolloProvider";
import { ToastProvider } from "@/components/ui/custom-toast";
import QueryProvider from "@/lib/query-provider";

const albertsans = Albert_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memed.fun",
  description: "Memed.fun",
  icons: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: 'icon/favicon.ico',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${albertsans.className} antialiased h-full p-0`}>
        <QueryProvider>
          <Web3Provider>
            <ToastProvider>{children}</ToastProvider>
          </Web3Provider>
        </QueryProvider>
      </body>
    </html>
  );
}
