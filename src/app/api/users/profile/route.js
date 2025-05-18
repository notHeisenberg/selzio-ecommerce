import { NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/mongodb';
import { requireAuth } from '@/middleware/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Get user profile
export async function GET(req) {
  // Verify that the user is authenticated
  const tokenUser = await requireAuth(req);
  if (tokenUser instanceof Response) {
    return tokenUser; // Return the error response
  }

  try {
    const usersCollection = await getUsersCollection();
    
    // Find user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(tokenUser.id) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Remove sensitive fields but add a flag indicating if password exists
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      ...userWithoutPassword,
      hasPassword: !!password
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(req) {
  // Verify that the user is authenticated
  const tokenUser = await requireAuth(req);
  if (tokenUser instanceof Response) {
    return tokenUser; // Return the error response
  }

  try {
    const body = await req.json();
    const { name, phone, address, currentPassword, newPassword, email, avatar } = body;
    
    const usersCollection = await getUsersCollection();
    
    // Find the user
    const user = await usersCollection.findOne({ _id: new ObjectId(tokenUser.id) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prepare update data
    const updateData = {};
    
    // Update basic profile info
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (avatar) updateData.avatar = avatar; // Add avatar field handling
    
    // Handle email update
    if (email && email !== user.email) {
      // Check if email already exists for another user
      const existingUser = await usersCollection.findOne({ email, _id: { $ne: new ObjectId(tokenUser.id) } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use by another account' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }
    
    // Handle password update
    if (newPassword) {
      // If this is a social login user without a password setting password for first time
      if (!user.password) {
        // Hash and set the new password
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(newPassword, salt);
      } 
      // This is a regular user or social user who already has a password
      else {
        // Require current password for security
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Current password is required to set a new password' },
            { status: 400 }
          );
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
          );
        }
        
        // Hash and set the new password
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(newPassword, salt);
      }
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes to update' });
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    // Update user
    await usersCollection.updateOne(
      { _id: new ObjectId(tokenUser.id) },
      { $set: updateData }
    );
    
    // Get updated user
    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(tokenUser.id) });
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        ...userWithoutPassword,
        hasPassword: !!password
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 