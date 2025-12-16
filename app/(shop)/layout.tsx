import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OffersBanner from "@/components/layout/OffersBanner";
import dynamic from "next/dynamic";

// Dynamic import for chatbot widget to reduce initial bundle size
const ChatWidget = dynamic(() => import("@/components/chatbot/ChatWidget"), {
    ssr: false, // Chatbot is interactive, no need for SSR
});

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <OffersBanner />
            <Header />

            <main className="flex-grow relative">
                {children}
            </main>

            <Footer />
            <ChatWidget />
        </div>
    );
}
