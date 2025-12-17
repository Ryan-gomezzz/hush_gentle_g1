'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportCSVButtonProps {
    startDate?: string
    endDate?: string
}

export default function ExportCSVButton({ startDate, endDate }: ExportCSVButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const params = new URLSearchParams()
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const response = await fetch(`/api/admin/orders/export?${params.toString()}`)

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Failed to export orders' }))
                throw new Error(error.error || 'Failed to export orders')
            }

            // Get the CSV content
            const csvContent = await response.text()
            
            // Create a blob and download it
            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error: any) {
            console.error('Export error:', error)
            alert(error.message || 'Failed to export orders. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700"
        >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
    )
}

