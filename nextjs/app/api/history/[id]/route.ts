import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        vehicles: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error fetching specific analysis:', error);
    return NextResponse.json({ error: error.message || 'Erro ao buscar análise.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Find the analysis first to retrieve filenames
    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada.' }, { status: 404 });
    }

    // Delete local files relative to project root
    const projectRoot = path.resolve(process.cwd(), '..');
    const rawPath = path.join(projectRoot, 'uploads', analysis.filename);
    const processedPath = path.join(projectRoot, 'processed', analysis.processedImage);

    if (fs.existsSync(rawPath)) {
      fs.unlinkSync(rawPath);
    }
    if (fs.existsSync(processedPath)) {
      fs.unlinkSync(processedPath);
    }

    // Delete database records (onDelete Cascade deletes Vehicles relation)
    await prisma.analysis.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Análise excluída com sucesso.' });
  } catch (error: any) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json({ error: error.message || 'Falha ao excluir análise.' }, { status: 500 });
  }
}
