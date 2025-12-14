'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
// import { ChevronRight, ChevronLeft } from 'lucide-react' // Unused

const SLIDES = [
    {
        type: 'video',
        src: '/videos/hero.mp4',
        poster: '/images/banner.png',
        duration: 10000 // Fallback duration if video onEnded doesn't fire fast enough or loops
    },
    {
        type: 'image',
        src: '/images/banner.png',
        alt: 'Relaxing Collections',
        duration: 5000
    },
    // Add more images here if you have them
    // { type: 'image', src: '/images/another-banner.png', ... }
]

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-advance logic
    useEffect(() => {
        const slide = SLIDES[currentIndex]

        // If video, we might want to wait for onEnded, but for a simple loop, a timer is smoother
        // to prevent getting stuck if video fails to autoplay.
        const timer = setTimeout(() => {
            nextSlide()
        }, slide.duration)

        return () => clearTimeout(timer)
    }, [currentIndex])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
    }

    return (
        <div className="relative w-full h-[80vh] bg-beige-100 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    {SLIDES[currentIndex].type === 'video' ? (
                        <video
                            className="w-full h-full object-cover"
                            src={SLIDES[currentIndex].src}
                            poster={SLIDES[currentIndex].poster}
                            autoPlay
                            muted
                            playsInline
                            // Loop is false so it ends and triggers the effect or we use duration
                            // Let's rely on the Effect timer to force the slide, keeping it robust.
                            loop={false}
                        />
                    ) : (
                        <div className="relative w-full h-full">
                            <Image
                                src={SLIDES[currentIndex].src!}
                                alt={SLIDES[currentIndex].alt || 'Hero Image'}
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Overlay for text readability */}
                            <div className="absolute inset-0 bg-sage-900/10" />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Logo at Top Center */}
            <div className="absolute top-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    <Image
                        src="/images/logo.png"
                        alt="Hush Gentle Logo"
                        width={200}
                        height={67}
                        className="object-contain drop-shadow-lg"
                        priority
                    />
                </motion.div>
            </div>

            {/* Shop Collection Button - Just Above Navigation Dots */}
            <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center items-center text-center px-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="pointer-events-auto"
                >
                    <Link href="/products">
                        <button className="px-10 py-4 bg-white/90 text-sage-900 rounded-full text-lg hover:bg-white transition-all shadow-lg cursor-pointer">
                            Shop Collection
                        </button>
                    </Link>
                </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
