import { NextResponse } from 'next/server';
import { getCombosCollection } from '@/lib/mongodb';
import { requireAdmin } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { comboCode } = params;

    if (!comboCode) {
      return NextResponse.json(
        { error: 'Combo identifier is required' },
        { status: 400 }
      );
    }

    // Get combos collection
    const combosCollection = await getCombosCollection();

    let combo;
    
    // First try to find by comboCode
    combo = await combosCollection.findOne({ comboCode });

    // If not found and it could be a valid MongoDB ID, try finding by _id
    if (!combo && ObjectId.isValid(comboCode)) {
      combo = await combosCollection.findOne({ _id: new ObjectId(comboCode) });
    }

    if (!combo) {
      return NextResponse.json(
        { error: 'Combo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(combo);
  } catch (error) {
    console.error('Combo fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE a combo
export async function PUT(req, { params }) {
  try {
    // Verify that the user is authenticated and is an admin
    const user = await requireAdmin(req);
    if (user instanceof Response) {
      return user; // Return the error response
    }

    const { comboCode } = params;
    const body = await req.json();
    
    // Get combos collection
    const combosCollection = await getCombosCollection();

    // Add updated timestamp and modifier info
    const updatedCombo = {
      ...body,
      updatedBy: user.id,
      updatedAt: new Date()
    };

    let result;
    
    // Try to update by comboCode first
    result = await combosCollection.findOneAndUpdate(
      { comboCode },
      { $set: updatedCombo },
      { returnDocument: 'after' }
    );

    // If not found and it could be a valid MongoDB ID, try updating by _id
    if (!result && ObjectId.isValid(comboCode)) {
      result = await combosCollection.findOneAndUpdate(
        { _id: new ObjectId(comboCode) },
        { $set: updatedCombo },
        { returnDocument: 'after' }
      );
    }

    if (!result) {
      return NextResponse.json({ error: 'Combo not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Combo update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a combo
export async function DELETE(req, { params }) {
  try {
    // Verify that the user is authenticated and is an admin
    const user = await requireAdmin(req);
    if (user instanceof Response) {
      return user; // Return the error response
    }

    const { comboCode } = params;
    
    // Get combos collection
    const combosCollection = await getCombosCollection();

    let result;
    
    // Try to delete by comboCode first
    result = await combosCollection.findOneAndDelete({ comboCode });

    // If not found and it could be a valid MongoDB ID, try deleting by _id
    if (!result && ObjectId.isValid(comboCode)) {
      result = await combosCollection.findOneAndDelete({ _id: new ObjectId(comboCode) });
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Combo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Combo deleted successfully' });
  } catch (error) {
    console.error('Combo deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 