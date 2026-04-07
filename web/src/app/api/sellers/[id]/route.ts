import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const seller = await User.findById(id).select('name bio story role');

    if (!seller || seller.role !== 'seller') {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Get seller's products
    const products = await Product.find({ sellerId: id })
      .select('name description price images category')
      .sort({ createdAt: -1 })
      .limit(20); // Limit to recent 20 products

    return NextResponse.json({
      seller: {
        id: seller._id,
        name: seller.name,
        bio: seller.bio,
        story: seller.story,
      },
      products,
    });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
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

    const session = await getRequestSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to continue' },
        { status: 401 }
      );
    }

    // Ensure the user is updating their own profile
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: 'Not authorized to update this profile' },
        { status: 403 }
      );
    }

    if (session.user.role !== 'seller') {
      return NextResponse.json(
        { error: 'Only sellers can update their profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bio, story } = body;

    // Validate input
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be less than 500 characters' },
        { status: 400 }
      );
    }

    if (story && story.length > 2000) {
      return NextResponse.json(
        { error: 'Story must be less than 2000 characters' },
        { status: 400 }
      );
    }

    // Update profile
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        bio: bio || '',
        story: story || '',
        updatedAt: new Date()
      },
      { new: true }
    ).select('name bio story');

    return NextResponse.json({
      seller: {
        id: updatedUser._id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        story: updatedUser.story,
      },
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
