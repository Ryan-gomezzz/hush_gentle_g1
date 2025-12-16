'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface SKU {
  size: string
  price?: string
  stock: string
  sku_code: string
}

export default function ProductSKUForm() {
  const [skus, setSkus] = useState<SKU[]>([{ size: '', price: '', stock: '', sku_code: '' }])

  const addSKU = () => {
    setSkus([...skus, { size: '', price: '', stock: '', sku_code: '' }])
  }

  const removeSKU = (index: number) => {
    setSkus(skus.filter((_, i) => i !== index))
  }

  const updateSKU = (index: number, field: keyof SKU, value: string) => {
    const updated = [...skus]
    updated[index] = { ...updated[index], [field]: value }
    setSkus(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Size Variations (SKUs)</label>
        <button
          type="button"
          onClick={addSKU}
          className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700"
        >
          <Plus className="w-4 h-4" />
          Add Size
        </button>
      </div>

      {skus.map((sku, index) => (
        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Size *</label>
            <input
              type="text"
              name={`sku_size_${index}`}
              value={sku.size}
              onChange={(e) => updateSKU(index, 'size', e.target.value)}
              placeholder="e.g., Small, 50ml"
              required
              className="w-full p-2 text-sm rounded border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              name={`sku_price_${index}`}
              value={sku.price}
              onChange={(e) => updateSKU(index, 'price', e.target.value)}
              placeholder="Optional override"
              className="w-full p-2 text-sm rounded border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty to use base price</p>
          </div>
          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
            <input
              type="number"
              min="0"
              name={`sku_stock_${index}`}
              value={sku.stock}
              onChange={(e) => updateSKU(index, 'stock', e.target.value)}
              placeholder="100"
              required
              className="w-full p-2 text-sm rounded border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          <div className="col-span-12 md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">SKU Code</label>
            <input
              type="text"
              name={`sku_code_${index}`}
              value={sku.sku_code}
              onChange={(e) => updateSKU(index, 'sku_code', e.target.value)}
              placeholder="HG-SM-001"
              className="w-full p-2 text-sm rounded border border-gray-300 focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          <div className="col-span-12 md:col-span-1 flex items-end">
            {skus.length > 1 && (
              <button
                type="button"
                onClick={() => removeSKU(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                aria-label="Remove SKU"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Hidden input to pass SKU count */}
      <input type="hidden" name="sku_count" value={skus.length} />
    </div>
  )
}

