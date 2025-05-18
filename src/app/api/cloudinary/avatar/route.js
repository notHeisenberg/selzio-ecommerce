import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    console.log('Starting avatar upload process...');
    
    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get('avatar');
    
    if (!file) {
      console.log('No avatar file provided in request');
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }

    console.log('Avatar file received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('File converted to buffer, size:', buffer.length);

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `avatar_${timestamp}`;

    console.log('Attempting to upload to Cloudinary with config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'avatars',
      filename: filename
    });

    // Upload to Cloudinary using upload_stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          resource_type: 'image',
          public_id: filename,
          overwrite: true,
          transformation: [
            { width: 250, height: 250, crop: 'fill', gravity: 'face' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary avatar upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary avatar upload successful:', result);
            resolve(result);
          }
        }
      );

      // Handle stream errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });

      // Write the buffer to the stream
      uploadStream.end(buffer);
    });

    console.log('Avatar upload completed successfully');

    // Return the upload result
    return NextResponse.json({ 
      success: true,
      avatarUrl: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload avatar',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 