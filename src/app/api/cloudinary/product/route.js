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
    const subcategory = formData.get('subcategory') || 'general';
    const category = formData.get('category') || 'products';
    const productName = formData.get('productName') || 'unnamed';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `product_${timestamp}_${randomString}`;

    // Sanitize category, subcategory, and product name for folder structure
    // Replace spaces with underscores, remove special characters
    const sanitizedSubcategory = subcategory
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();

    const sanitizedCategory = category
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();

    const sanitizedProductName = productName
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();

    // Create folder path: products/{category}/{subcategory}/{productName}
    // If no subcategory, use: products/{category}/{productName}
    let folderPath = `products/${sanitizedCategory}`;
    if (sanitizedSubcategory && sanitizedSubcategory !== 'general') {
      folderPath += `/${sanitizedSubcategory}`;
    }
    // Add product name to folder path
    if (sanitizedProductName && sanitizedProductName !== 'unnamed') {
      folderPath += `/${sanitizedProductName}`;
    }

    // Upload to Cloudinary using upload_stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: 'image',
          public_id: filename,
          overwrite: true,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Limit max dimensions
            { quality: 'auto:good' }, // Optimize quality
            { fetch_format: 'auto' } // Auto format (WebP when supported)
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary product upload error:', error);
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
        public_id: result.public_id,
        folder: folderPath
      }
    });

  } catch (error) {
    console.error('Product image upload error:', error);
    
    // Return a more detailed error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload product image',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

