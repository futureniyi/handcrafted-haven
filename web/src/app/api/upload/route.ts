import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Verify user is a seller
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can upload images' },
        { status: 403 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum file size is 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${user._id}-${timestamp}-${random}-${file.name}`;

    // Check if we're in local development (no Vercel Blob token)
    const isLocalDev = !process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV !== 'production';

    let blob;
    if (isLocalDev) {
      // In local development, return a mock URL for testing
      const mockUrl = `http://localhost:3000/mock-uploads/${filename}`;
      return NextResponse.json({
        url: mockUrl,
        size: file.size,
        type: file.type,
        note: 'Local development: using mock URL'
      });
    } else {
      // Upload to Vercel Blob
      blob = await put(filename, file, {
        access: 'public',
      });
    }

    return NextResponse.json({
      url: blob.url,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
