import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    // Parse request body
    let email, password;
    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get users collection with error handling
    let usersCollection;
    try {
      usersCollection = await getUsersCollection();
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Find user with error handling
    let user;
    try {
      user = await usersCollection.findOne({ email });
    } catch (queryError) {
      console.error('Error querying user:', queryError);
      return NextResponse.json(
        { error: 'Authentication service unavailable' },
        { status: 500 }
      );
    }

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has password (might be social login user)
    if (!user.password) {
      return NextResponse.json(
        { error: 'Please use social login for this account' },
        { status: 401 }
      );
    }

    // Check password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token with user ID and role
    let token;
    try {
      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role || 'user'
      };
      token = generateToken(tokenPayload);
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create authentication token' },
        { status: 500 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Log successful login

    // Convert ObjectId to string for the response
    if (userWithoutPassword._id) {
      userWithoutPassword._id = userWithoutPassword._id.toString();
    }

    // Add id field for consistency
    userWithoutPassword.id = userWithoutPassword._id;

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 