'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useHeaderContext } from './HeaderWrapper'

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()
    const { isHomepage } = useHeaderContext()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <input
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border-b-2 outline-none text-sm uppercase tracking-wider py-1 pr-8 transition-colors ${
                    isHomepage
                        ? 'border-white/50 focus:border-white text-white placeholder:text-white/70'
                        : 'border-sage-300 focus:border-sage-600 text-sage-700 placeholder:text-sage-400'
                }`}
            />
            <button
                type="submit"
                className={`absolute right-0 top-1/2 -translate-y-1/2 transition-colors ${
                    isHomepage
                        ? 'text-white hover:text-white/80'
                        : 'text-sage-600 hover:text-sage-900'
                }`}
                aria-label="Search"
            >
                <Search className="w-4 h-4" />
            </button>
        </form>
    )
}

