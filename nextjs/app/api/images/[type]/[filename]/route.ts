import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const { type, filename } = resolvedParams;

    if (type !== 'uploads' && type !== 'processed') {
      return new NextResponse('Invalid folder type', { status: 400 });
    }

    // Locate the root folder of smarttrafego-ai (parent of nextjs/)
    const projectRoot = path.resolve(process.cwd(), '..');
    const filePath = path.join(projectRoot, type, filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Imagem não encontrada', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.bmp') contentType = 'image/bmp';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error serving image:', error);
    return new NextResponse('Erro interno ao buscar imagem', { status: 500 });
  }
}
