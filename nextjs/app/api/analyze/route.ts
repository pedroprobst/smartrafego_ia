import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Forward the file directly to the FastAPI server using FormData
    const pythonFormData = new FormData();
    pythonFormData.append('file', file, file.name);

    const pythonRes = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonRes.ok) {
      const errText = await pythonRes.text();
      return NextResponse.json(
        { error: `Falha no backend Python: ${pythonRes.status} - ${errText}` },
        { status: 500 }
      );
    }

    const data = await pythonRes.json();

    // Store in the SQLite database via Prisma
    const analysis = await prisma.analysis.create({
      data: {
        filename: data.filename,
        processedImage: data.processed_filename,
        processingTime: data.processing_time,
        vehicles: {
          create: data.vehicles.map((v: any) => ({
            category: v.category,
            confidence: v.confidence,
            x: v.x,
            y: v.y,
            width: v.width,
            height: v.height,
          })),
        },
      },
      include: {
        vehicles: true,
      },
    });

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in api/analyze:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor ao processar imagem.' },
      { status: 500 }
    );
  }
}
