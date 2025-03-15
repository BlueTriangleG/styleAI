import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/models/user';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Create user
    const user = await createUser({
      email: data.email,
      password_hash: data.password_hash,
      name: data.name,
      provider: data.provider,
      provider_id: data.provider_id,
      avatar_url: data.avatar_url,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
