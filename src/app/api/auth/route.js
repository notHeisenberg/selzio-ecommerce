import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Get users collection
    const usersCollection = await getUsersCollection();

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token with user ID and role
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role || 'user'
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 