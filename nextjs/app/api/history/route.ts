import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const history = await prisma.analysis.findMany({
      include: {
        vehicles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar histórico de análises.' },
      { status: 500 }
    );
  }
}
