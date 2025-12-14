import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

export const metadata = {
    title: "Hush Gentle | Organic & Soothing Skincare",
    description: "Pure, organic, and gentle skincare for sensitive bodies. No chemicals, just nature.",
};

import PageViewTracker from '@/components/analytics/PageViewTracker'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans antialiased text-gray-900 bg-offwhite min-h-screen">
                <PageViewTracker />
                <main className="flex flex-col min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}
