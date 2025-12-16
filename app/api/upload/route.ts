import { createAdminClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin-check'

export async function POST(request: NextRequest) {
    try {
        // Check admin authentication
        await requireAdmin()

        const formData = await request.formData()
        const files = formData.getAll('files') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            )
        }

        // Use admin client for storage operations to bypass RLS
        const supabase = createAdminClient()
        const uploadedUrls: string[] = []

        // Upload each file to Supabase Storage
        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: `File ${file.name} is not an image` },
                    { status: 400 }
                )
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json(
                    { error: `File ${file.name} exceeds 5MB limit` },
                    { status: 400 }
                )
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `products/${fileName}`

            // Convert File to ArrayBuffer
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false,
                })

            if (error) {
                console.error('Error uploading file:', error)
                return NextResponse.json(
                    { error: `Failed to upload ${file.name}: ${error.message}` },
                    { status: 500 }
                )
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            if (urlData?.publicUrl) {
                uploadedUrls.push(urlData.publicUrl)
            }
        }

        return NextResponse.json({ urls: uploadedUrls })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to upload images' },
            { status: 500 }
        )
    }
}

