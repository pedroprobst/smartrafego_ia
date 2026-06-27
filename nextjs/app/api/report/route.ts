import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHeuristicReport } from '@/utils/reportGenerator';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID da análise não fornecido.' }, { status: 400 });
    }

    // Retrieve analysis log from db
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        vehicles: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada.' }, { status: 404 });
    }

    // Retrieve Gemini API Key if configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const total = analysis.vehicles.length;
        const counts: Record<string, number> = {};
        analysis.vehicles.forEach(v => {
          counts[v.category] = (counts[v.category] || 0) + 1;
        });

        const distribution = Object.entries(counts)
          .map(([cat, count]) => `- ${cat}: ${count} (${total > 0 ? ((count / total) * 100).toFixed(0) : 0}%)`)
          .join('\n');

        const prompt = `Você é um Engenheiro de Tráfego sênior e analista especialista.
Gere um relatório técnico de tráfego, conciso e profissional em linguagem natural em Português do Brasil analisando as estatísticas obtidas de uma imagem aérea por detecção YOLOv11:

- Total de veículos: ${total}
- Tempo de processamento de imagem: ${analysis.processingTime.toFixed(2)} segundos
- Estatísticas por categoria de veículo:
${distribution}

Instruções adicionais:
1. Comece com uma introdução formal e um diagnóstico geral da densidade da via (Densidade Alta, Média ou Baixa).
2. Forneça uma análise comportamental baseada nas categorias (ex: dependência de transporte individual, presença logística comercial, fluxos de motos).
3. Apresente 3 recomendações técnicas práticas de mobilidade urbana aplicáveis para o volume observado (ex: otimização semafórica, criação de vias exclusivas, monitoramento de pavimentação).
4. Escreva em formato Markdown limpo. Não inclua observações sobre si mesmo ou notas meta, vá direto ao conteúdo do relatório.`;

        const response = await model.generateContent(prompt);
        const reportText = response.response.text();
        return NextResponse.json({ report: reportText });
      } catch (geminiError: any) {
        console.warn('Gemini generative report failed, executing heuristic fallback:', geminiError);
      }
    }

    // Execute the local heuristic report generator
    const heuristicReport = generateHeuristicReport(analysis);
    return NextResponse.json({ report: heuristicReport });
  } catch (error: any) {
    console.error('Error generating analysis report:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao processar relatório.' },
      { status: 500 }
    );
  }
}
