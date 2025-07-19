import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { sanitizeSVG } from '@/shared/utils/image_util';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Special handling for SVG files
    if (file.type === 'image/svg+xml') {
      try {
        // Convert buffer to string for SVG processing
        const svgContent = buffer.toString('utf8');
        
        // Sanitize SVG content to remove potential XSS
        const sanitizedSVG = sanitizeSVG(svgContent);
        
        // Convert back to buffer
        buffer = Buffer.from(sanitizedSVG, 'utf8');
        
      } catch (error) {
        console.error('Error processing SVG:', error);
        return NextResponse.json({ error: 'Invalid SVG file.' }, { status: 400 });
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    
    // Save to public/uploads directory
    const path = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(path, buffer);

    // Return the public URL
    const imageUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ 
      message: 'File uploaded successfully',
      imageUrl: imageUrl,
      fileType: file.type,
      isSVG: file.type === 'image/svg+xml'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
} 