'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
    onImagesChange: (urls: string[]) => void
    maxImages?: number
    existingImages?: string[]
}

export default function ImageUpload({
    onImagesChange,
    maxImages = 10,
    existingImages = [],
}: ImageUploadProps) {
    const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return

        const remainingSlots = maxImages - uploadedImages.length
        if (remainingSlots <= 0) {
            setError(`Maximum ${maxImages} images allowed`)
            return
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots)
        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            filesToUpload.forEach((file) => {
                formData.append('files', file)
            })

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to upload images')
            }

            const data = await response.json()
            const newUrls = [...uploadedImages, ...data.urls]
            setUploadedImages(newUrls)
            onImagesChange(newUrls)
        } catch (err: any) {
            setError(err.message || 'Failed to upload images')
            console.error('Upload error:', err)
        } finally {
            setIsUploading(false)
        }
    }, [uploadedImages, maxImages, onImagesChange])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
    }, [handleFiles])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files)
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [handleFiles])

    const removeImage = useCallback((index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index)
        setUploadedImages(newImages)
        onImagesChange(newImages)
    }, [uploadedImages, onImagesChange])

    const canUploadMore = uploadedImages.length < maxImages

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images {uploadedImages.length > 0 && `(${uploadedImages.length}/${maxImages})`}
            </label>

            {/* Upload Area */}
            {canUploadMore && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${isDragging
                            ? 'border-sage-500 bg-sage-50'
                            : 'border-gray-300 hover:border-sage-400 hover:bg-gray-50'
                        }
                        ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                    `}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploading}
                    />

                    {isUploading ? (
                        <div className="space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto"></div>
                            <p className="text-sm text-gray-600">Uploading images...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-sage-600">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, GIF up to 5MB each
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((url, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <Image
                                    src={url}
                                    alt={`Product image ${index + 1}`}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                aria-label="Remove image"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-sage-600 text-white text-xs px-2 py-1 rounded">
                                    Primary
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

