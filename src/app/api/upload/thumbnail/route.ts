import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if ((session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check Cloudinary config
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error('Cloudinary credentials missing in .env')
      return NextResponse.json(
        { error: 'Image upload service not configured. Please contact admin.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files are allowed (jpg, png, webp, gif)' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to base64 buffer for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: 'coching-center/thumbnails',
      overwrite: false,
      transformation: [
        { width: 800, height: 450, crop: 'fill', gravity: 'center' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })

    const imageUrl = uploadResult.secure_url

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error('Thumbnail upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
