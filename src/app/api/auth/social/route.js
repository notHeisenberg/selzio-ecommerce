import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { generateToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, provider, providerId, avatar } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();

    // Check if user exists
    let user = await usersCollection.findOne({ email });

    if (user) {
      // Update the user with provider information if it's new
      const updateData = {};
      
      // Add or update the provider info
      if (!user[`${provider}Id`]) {
        updateData[`${provider}Id`] = providerId;
      }
      
      // Update avatar if none exists
      if (!user.avatar && avatar) {
        updateData.avatar = avatar;
      }
      
      // If we have updates to make
      if (Object.keys(updateData).length > 0) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        
        // Refresh user data
        user = await usersCollection.findOne({ _id: user._id });
      }
    } else {
      // Create new user
      const newUser = {
        name,
        email,
        [`${provider}Id`]: providerId,
        avatar: avatar || null,
        createdAt: new Date(),
        role: 'user',
      };
      
      const result = await usersCollection.insertOne(newUser);
      user = {
        ...newUser,
        _id: result.insertedId,
      };
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Convert ObjectId to string for the response
    const userResponse = {
      ...user,
      _id: user._id.toString(),
      id: user._id.toString(),
    };
    delete userResponse.password; // Ensure password is never returned

    return NextResponse.json({
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Social auth error:', error);
    
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
} 