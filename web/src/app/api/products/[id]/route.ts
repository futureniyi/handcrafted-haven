import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getRequestSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product id' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate('sellerId', 'name bio story');

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product id' },
        { status: 400 }
      );
    }

    const session = await getRequestSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    // Get product and verify ownership
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this product' },
        { status: 403 }
      );
    }

    // Validate input
    const body = await request.json();
    const allowedFields = ['name', 'description', 'price', 'category', 'images', 'inStock'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validation
    if (updateData.name !== undefined) {
      if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        );
      }
      if (updateData.name.length > 100) {
        return NextResponse.json(
          { error: 'Name must be less than 100 characters' },
          { status: 400 }
        );
      }
      updateData.name = updateData.name.trim();
    }

if (updateData.description !== undefined) {
  if (typeof updateData.description !== 'string' || updateData.description.trim().length === 0) {
    return NextResponse.json(
      { error: 'Description must be a non-empty string' },
      { status: 400 }
    );
  }
  if (updateData.description.length > 1000) {
    return NextResponse.json(
      { error: 'Description must be less than 1000 characters' },
      { status: 400 }
    );
  }
  updateData.description = updateData.description.trim();
}

if (updateData.price !== undefined) {
  if (typeof updateData.price !== 'number' || isNaN(updateData.price) || updateData.price < 0) {
    return NextResponse.json(
      { error: 'Price must be a non-negative number' },
      { status: 400 }
    );
  }
}

if (updateData.category !== undefined) {
  if (!['jewelry', 'clothing', 'home-decor', 'art', 'other'].includes(updateData.category)) {
    return NextResponse.json(
      { error: 'Category must be one of: jewelry, clothing, home-decor, art, other' },
      { status: 400 }
    );
  }
}

if (updateData.images !== undefined) {
  if (!Array.isArray(updateData.images)) {
    return NextResponse.json(
      { error: 'Images must be an array of URLs' },
      { status: 400 }
    );
  }
  if (updateData.images.some((img: any) => typeof img !== 'string' || !/^https?:\/\/.+/.test(img))) {
    return NextResponse.json(
      { error: 'All images must be valid HTTP/HTTPS URLs' },
      { status: 400 }
    );
  }
}
    

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('sellerId', 'name');

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product id' },
        { status: 400 }
      );
    }

    const session = await getRequestSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    // Get product and verify ownership
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.sellerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this product' },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
