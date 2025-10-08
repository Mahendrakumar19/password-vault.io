import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const vaultItem = await VaultItem.findOneAndUpdate(
      { _id: params.id, userId: userData.userId },
      {
        title: title.trim(),
        encryptedData,
        iv,
        authTag,
      },
      { new: true }
    );

    if (!vaultItem) {
      return NextResponse.json(
        { success: false, error: 'Vault item not found' } as ApiResponse,
        { status: 404 }
      );
    }

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
        message: 'Vault item updated successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const userData = await getUserFromRequest(request);
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const vaultItem = await VaultItem.findOneAndDelete({
      _id: params.id,
      userId: userData.userId,
    });

    if (!vaultItem) {
      return NextResponse.json(
        { success: false, error: 'Vault item not found' } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Vault item deleted successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}