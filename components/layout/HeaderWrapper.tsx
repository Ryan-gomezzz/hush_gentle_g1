'use client'

import { usePathname } from 'next/navigation'
import { createContext, useContext } from 'react'

const HeaderContext = createContext<{ isHomepage: boolean }>({ isHomepage: false })

export const useHeaderContext = () => useContext(HeaderContext)

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isHomepage = pathname === '/'

    return (
        <HeaderContext.Provider value={{ isHomepage }}>
            <header 
                style={isHomepage ? { backgroundColor: 'transparent' } : {}}
                className={`py-3 md:py-4 px-4 md:px-6 lg:px-12 sticky top-0 z-50 transition-all ${
                    isHomepage 
                        ? 'border-b border-transparent' 
                        : 'bg-offwhite/95 backdrop-blur-md border-b border-sage-100'
                }`}
            >
                {children}
            </header>
        </HeaderContext.Provider>
    )
}

