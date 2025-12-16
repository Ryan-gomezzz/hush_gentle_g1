'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Address {
  id: string
  full_name: string
  email: string
  phone?: string
  address: string
  city: string
  state?: string
  zip_code: string
  is_default: boolean
}

interface CheckoutAddressFormProps {
  deliveryAddresses: Address[]
  billingAddresses: Address[]
}

export default function CheckoutAddressForm({ deliveryAddresses, billingAddresses }: CheckoutAddressFormProps) {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(
    deliveryAddresses.find(a => a.is_default)?.id || deliveryAddresses[0]?.id || 'new'
  )
  const [useDeliveryAsBilling, setUseDeliveryAsBilling] = useState(true)
  const [selectedBillingId, setSelectedBillingId] = useState<string>(
    billingAddresses.find(a => a.is_default)?.id || billingAddresses[0]?.id || 'new'
  )

  const selectedDelivery = deliveryAddresses.find(a => a.id === selectedDeliveryId)
  const selectedBilling = billingAddresses.find(a => a.id === selectedBillingId)

  return (
    <div className="space-y-6">
      {/* Delivery Address Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sage-800">Delivery Address</h3>
          {deliveryAddresses.length < 2 && (
            <Link href="/account/addresses/new?type=delivery&redirect=/checkout" className="text-sm text-sage-600 hover:text-sage-900">
              + Add New
            </Link>
          )}
        </div>

        {deliveryAddresses.length > 0 ? (
          <div className="space-y-2 mb-4">
            {deliveryAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedDeliveryId === addr.id
                    ? 'border-sage-600 bg-sage-50'
                    : 'border-sage-200 hover:border-sage-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery_address_id"
                  value={addr.id}
                  checked={selectedDeliveryId === addr.id}
                  onChange={() => setSelectedDeliveryId(addr.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-sage-900">{addr.full_name}</p>
                  <p className="text-sm text-sage-600">{addr.email}</p>
                  {addr.phone && <p className="text-sm text-sage-600">{addr.phone}</p>}
                  <p className="text-sage-700">{addr.address}</p>
                  <p className="text-sage-700">
                    {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip_code}
                  </p>
                </div>
              </label>
            ))}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedDeliveryId === 'new'
                  ? 'border-sage-600 bg-sage-50'
                  : 'border-sage-200 hover:border-sage-300'
              }`}
            >
              <input
                type="radio"
                name="delivery_address_id"
                value="new"
                checked={selectedDeliveryId === 'new'}
                onChange={() => setSelectedDeliveryId('new')}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-sage-900">Use a new address</p>
              </div>
            </label>
          </div>
        ) : (
          <input type="hidden" name="delivery_address_id" value="new" />
        )}

        {/* New Delivery Address Fields (shown if "new" selected) */}
        {selectedDeliveryId === 'new' && (
          <div className="space-y-4 p-4 bg-beige-50 rounded-lg border border-sage-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Full Name *</label>
                <input name="fullName" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Email *</label>
                <input name="email" type="email" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Address *</label>
              <input name="address" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">City *</label>
                <input name="city" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Zip Code *</label>
                <input name="zip" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
              </div>
            </div>
          </div>
        )}

        {/* Pre-filled fields if saved address selected */}
        {selectedDeliveryId !== 'new' && selectedDelivery && (
          <>
            <input type="hidden" name="fullName" value={selectedDelivery.full_name} />
            <input type="hidden" name="email" value={selectedDelivery.email} />
            <input type="hidden" name="address" value={selectedDelivery.address} />
            <input type="hidden" name="city" value={selectedDelivery.city} />
            <input type="hidden" name="zip" value={selectedDelivery.zip_code} />
          </>
        )}
      </div>

      {/* Billing Address */}
      <div className="pt-4 border-t border-sage-100">
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useDeliveryAsBilling}
              onChange={(e) => setUseDeliveryAsBilling(e.target.checked)}
              className="w-4 h-4 text-sage-600 border-gray-300 rounded focus:ring-sage-500"
            />
            <span className="text-sm font-medium text-sage-800">Use delivery address as billing address</span>
          </label>
        </div>

        {!useDeliveryAsBilling && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sage-800">Billing Address</h3>
              {billingAddresses.length === 0 && (
                <Link href="/account/addresses/new?type=billing&redirect=/checkout" className="text-sm text-sage-600 hover:text-sage-900">
                  + Add New
                </Link>
              )}
            </div>

            {billingAddresses.length > 0 ? (
              <div className="space-y-2 mb-4">
                {billingAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBillingId === addr.id
                        ? 'border-sage-600 bg-sage-50'
                        : 'border-sage-200 hover:border-sage-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="billing_address_id"
                      value={addr.id}
                      checked={selectedBillingId === addr.id}
                      onChange={() => setSelectedBillingId(addr.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sage-900">{addr.full_name}</p>
                      <p className="text-sage-700">{addr.address}</p>
                      <p className="text-sage-700">
                        {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip_code}
                      </p>
                    </div>
                  </label>
                ))}
                <label
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedBillingId === 'new'
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-sage-200 hover:border-sage-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="billing_address_id"
                    value="new"
                    checked={selectedBillingId === 'new'}
                    onChange={() => setSelectedBillingId('new')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sage-900">Use a new billing address</p>
                  </div>
                </label>
              </div>
            ) : (
              <input type="hidden" name="billing_address_id" value="new" />
            )}

            {selectedBillingId === 'new' && (
              <div className="space-y-4 p-4 bg-beige-50 rounded-lg border border-sage-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1">Billing Name *</label>
                    <input name="billing_fullName" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1">Billing Email *</label>
                    <input name="billing_email" type="email" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">Billing Address *</label>
                  <input name="billing_address" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1">Billing City *</label>
                    <input name="billing_city" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1">Billing Zip *</label>
                    <input name="billing_zip" required className="w-full p-3 rounded-lg border border-sage-200 bg-white focus:ring-sage-400 focus:border-sage-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <input type="hidden" name="use_delivery_as_billing" value={useDeliveryAsBilling ? 'true' : 'false'} />
      </div>
    </div>
  )
}

