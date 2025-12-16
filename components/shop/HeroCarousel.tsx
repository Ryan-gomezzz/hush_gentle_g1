'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

const SLIDES = [
    {
        type: 'video',
        src: '/videos/hero.mp4',
        poster: '/images/banner.png',
        duration: 10000
    },
    {
        type: 'image',
        src: '/images/banner.png',
        alt: 'Relaxing Collections',
        duration: 5000
    },
]

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const pathname = usePathname()
    const isHomepage = pathname === '/'

    // Auto-advance logic
    useEffect(() => {
        const slide = SLIDES[currentIndex]
        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % SLIDES.length)
        }, slide.duration)
        return () => clearTimeout(timer)
    }, [currentIndex])

    return (
        <div className={`relative w-full h-[60vh] max-h-[600px] bg-beige-50 overflow-hidden ${
            isHomepage ? '-mt-[140px] pt-[140px]' : ''
        }`}>
            <Link href="/products" className="absolute inset-0 z-10 cursor-pointer" aria-label="View all products">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Link>

            {/* Navigation Controls */}
            <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setCurrentIndex(idx)
                        }}
                        className={`w-2 h-2 rounded-full transition-all pointer-events-auto ${
                            idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
