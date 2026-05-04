import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    
    // Filter for video files
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    const videos = files
      .filter(file => videoExtensions.some(ext => file.toLowerCase().endsWith(ext)))
      .map(file => ({
        name: file,
        url: `/${file}`
      }));
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to list videos' }, { status: 500 });
  }
}
