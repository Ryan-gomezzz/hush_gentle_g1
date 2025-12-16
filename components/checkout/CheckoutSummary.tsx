'use client'

import { useState, useEffect } from 'react'
import CouponCodeInput from './CouponCodeInput'

interface CheckoutSummaryProps {
    initialSubtotal: number
}

export default function CheckoutSummary({ initialSubtotal }: CheckoutSummaryProps) {
    const [subtotal] = useState(initialSubtotal)
    const [discount, setDiscount] = useState(0)
    const [total, setTotal] = useState(initialSubtotal)

    useEffect(() => {
        setTotal(Math.max(0, subtotal - discount))
    }, [subtotal, discount])

    const handleCouponApplied = (code: string, discountAmount: number) => {
        setDiscount(discountAmount)
    }

    const handleCouponRemoved = () => {
        setDiscount(0)
    }

    return (
        <div className="bg-sage-50 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-sage-800 mb-4">Order Summary</h3>
            
            <div className="space-y-2">
                <div className="flex justify-between text-sage-700">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <CouponCodeInput
                    orderTotal={subtotal}
                    onCouponApplied={handleCouponApplied}
                    onCouponRemoved={handleCouponRemoved}
                />
                
                {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                    </div>
                )}
                
                <div className="pt-2 border-t border-sage-200">
                    <div className="flex justify-between text-lg font-bold text-sage-900">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

