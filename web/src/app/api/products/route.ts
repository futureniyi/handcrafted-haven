import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};

    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Ensure the user is a seller
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can create products' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, images, inStock } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: 'Description must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!category || !['jewelry', 'clothing', 'home-decor', 'art', 'other'].includes(category)) {
      return NextResponse.json(
        { error: 'Category must be one of: jewelry, clothing, home-decor, art, other' },
        { status: 400 }
      );
    }

    if (images && !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array of URLs' },
        { status: 400 }
      );
    }

    if (images && images.some((img: any) => typeof img !== 'string' || !/^https?:\/\/.+/.test(img))) {
      return NextResponse.json(
        { error: 'All images must be valid HTTP/HTTPS URLs' },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const allowedCategories = ['jewelry', 'clothing', 'home-decor', 'art', 'other'];
    if (!allowedCategories.includes(String(category))) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const safeImages = Array.isArray(images) ? images : [];
    if (safeImages.length > 5) {
      return NextResponse.json({ error: 'Max 5 images allowed' }, { status: 400 });
    }

    const newProduct = await Product.create({
      sellerId: user._id,
      name,
      description,
      price: parsedPrice,
      category,
      images: safeImages,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);

    if (error?.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}