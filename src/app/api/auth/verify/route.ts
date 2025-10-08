import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' } as ApiResponse,
        { status: 401 }
      );
    }

    // Find user to ensure they still exist
    const user = await User.findById(userData.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApiResponse,
        { status: 404 }
      );
    }

    const userResponse = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: { user: userResponse },
        message: 'Token is valid',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}