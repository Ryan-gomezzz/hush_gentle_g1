'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { addToCartWithSku } from '@/lib/actions/cart'

interface SKU {
  id: string
  size: string
  price?: number | null
  stock: number
  sku_code?: string | null
}

interface ProductPurchaseFormProps {
  productId: string
  basePrice: number
  baseStock: number
  skus?: SKU[]
  images: string[]
  productName: string
}

export default function ProductPurchaseForm({ 
  productId, 
  basePrice, 
  baseStock, 
  skus = [],
  images,
  productName 
}: ProductPurchaseFormProps) {
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null)
  
  const selectedSku = skus.find(s => s.id === selectedSkuId)
  const displayPrice = selectedSku?.price ?? basePrice
  const displayStock = selectedSku?.stock ?? baseStock
  const hasStock = displayStock > 0

  return (
    <>
      {/* Size Selector */}
      {skus.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-sage-800 mb-3">Select Size</label>
          <div className="flex flex-wrap gap-3">
            {skus.map((sku) => (
              <button
                key={sku.id}
                type="button"
                onClick={() => setSelectedSkuId(sku.id)}
                disabled={sku.stock <= 0}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedSkuId === sku.id
                    ? 'border-sage-600 bg-sage-50 text-sage-900'
                    : sku.stock <= 0
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 hover:border-sage-300 text-sage-700'
                }`}
              >
                <div className="text-sm font-medium">{sku.size}</div>
                {sku.price && (
                  <div className="text-xs text-sage-600">₹{sku.price.toFixed(2)}</div>
                )}
                {sku.stock <= 0 && (
                  <div className="text-xs text-red-500">Out of Stock</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="flex items-center gap-4 mb-6">
        <p className="text-3xl font-bold text-sage-800">₹{displayPrice.toFixed(2)}</p>
        {hasStock ? (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> In Stock ({displayStock} available)
          </span>
        ) : (
          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
        )}
      </div>

      {/* Add to Cart Form */}
      <form action={async () => {
        await addToCartWithSku(productId, 1, selectedSkuId || undefined)
      }} className="mb-4">
        {selectedSkuId && <input type="hidden" name="sku_id" value={selectedSkuId} />}
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto min-w-[200px] text-lg py-6"
          disabled={!hasStock || (skus.length > 0 && !selectedSkuId)}
        >
          {!hasStock ? 'Sold Out' : skus.length > 0 && !selectedSkuId ? 'Select Size' : 'Add to Cart'}
        </Button>
      </form>
    </>
  )
}

