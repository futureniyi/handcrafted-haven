import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getRequestSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
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

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const reviews = await Review.find({ productId: id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      reviews,
      stats: {
        total: totalReviews,
        average: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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
        { error: 'Please log in to submit a review' },
        { status: 401 }
      );
    }

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.sellerId.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Sellers cannot review their own products' },
        { status: 403 }
      );
    }

    const existingReview = await Review.findOne({
      productId: id,
      userId: session.user.id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Validate input
    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment if provided
    if (comment !== undefined && comment !== null) {
      if (typeof comment !== 'string') {
        return NextResponse.json(
          { error: 'Comment must be a string' },
          { status: 400 }
        );
      }
      if (comment.trim().length === 0 && comment.length > 0) {
        return NextResponse.json(
          { error: 'Comment cannot be whitespace only' },
          { status: 400 }
        );
      }
      if (comment.length > 500) {
        return NextResponse.json(
          { error: 'Comment must be less than 500 characters' },
          { status: 400 }
        );
      }
    }

    // Create review
    const review = await Review.create({
      productId: id,
      userId: session.user.id,
      rating,
      comment: comment || '',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name');

    return NextResponse.json(populatedReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
