import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

interface VaultItemDocument {
  _id: string;
  userId: string;
  title: string;
  encryptedData: string;
  iv: string;
  authTag: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const vaultItems = await VaultItem.find({ userId: userData.userId })
      .sort({ createdAt: -1 })
      .lean();

    const items = vaultItems.map((item) => {
      const vaultItem = item as unknown as VaultItemDocument;
      return {
        _id: vaultItem._id.toString(),
        userId: vaultItem.userId.toString(),
        title: vaultItem.title,
        encryptedData: vaultItem.encryptedData,
        iv: vaultItem.iv,
        authTag: vaultItem.authTag,
        createdAt: vaultItem.createdAt.toISOString(),
        updatedAt: vaultItem.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: { items },
        message: 'Vault items retrieved successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const { title, encryptedData, iv, authTag } = await request.json();

    // Validate input
    if (!title || !encryptedData || !iv || !authTag) {
      return NextResponse.json(
        { success: false, error: 'Title, encryptedData, iv, and authTag are required' } as ApiResponse,
        { status: 400 }
      );
    }

    const vaultItem = new VaultItem({
      userId: userData.userId,
      title: title.trim(),
      encryptedData,
      iv,
      authTag,
    });

    await vaultItem.save();

    const itemResponse = {
      _id: vaultItem._id.toString(),
      userId: vaultItem.userId.toString(),
      title: vaultItem.title,
      encryptedData: vaultItem.encryptedData,
      iv: vaultItem.iv,
      authTag: vaultItem.authTag,
      createdAt: vaultItem.createdAt.toISOString(),
      updatedAt: vaultItem.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: { item: itemResponse },
        message: 'Vault item created successfully',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}