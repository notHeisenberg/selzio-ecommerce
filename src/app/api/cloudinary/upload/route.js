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

    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    
    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `payment_${timestamp}`;

    
    // Upload to Cloudinary using upload_stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'payment_screenshots',
          resource_type: 'auto',
          public_id: filename,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            
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

    
    // Return the upload result
    return NextResponse.json({ 
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id
      }
    });

  } catch (error) {
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload image',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 