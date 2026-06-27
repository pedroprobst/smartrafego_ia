'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, Printer, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';
import { Analysis, Vehicle } from '@/types';

interface ReportViewProps {
  analysis: Analysis;
}

export default function ReportView({ analysis }: ReportViewProps) {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: analysis.id }),
        });

        if (!res.ok) {
          throw new Error('Falha ao gerar o relatório inteligente.');
        }

        const data = await res.json();
        setReport(data.report);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido ao carregar relatório.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [analysis.id]);

  const exportToCSV = () => {
    const headers = ['ID do Veículo', 'Categoria', 'Confiança da Detecção', 'Posição X (Normalizado)', 'Posição Y (Normalizado)', 'Largura (Normalizado)', 'Altura (Normalizado)'];
    const rows = analysis.vehicles.map((v) => [
      v.id,
      v.category,
      v.confidence.toFixed(4),
      v.x.toFixed(4),
      v.y.toFixed(4),
      v.width.toFixed(4),
      v.height.toFixed(4),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `estatisticas_trafego_${analysis.id.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="text-foreground font-semibold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-foreground mt-4 mb-2">
            {trimmed.replace('### ', '').replace(/\*\*/g, '')}
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-foreground mt-3 mb-1">
            {trimmed.replace('#### ', '').replace(/\*\*/g, '')}
          </h4>
        );
      }
      if (trimmed === '---') {
        return <hr key={idx} className="border-border my-4" />;
      }
      if (trimmed.startsWith('- ')) {
        const content = trimmed.slice(2);
        return (
          <li key={idx} className="text-xs text-muted-foreground ml-5 list-disc mb-1.5 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs text-muted-foreground leading-relaxed mb-2">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col space-y-6 w-full relative">
      {/* Control Buttons */}
      <div className="flex justify-end items-center space-x-3 no-print bg-card/40 border border-border p-3 rounded-xl backdrop-blur-md">
        <span className="text-xs text-muted-foreground mr-auto flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Relatório técnico estruturado para auditorias</span>
        </span>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-3 py-1.5 bg-card hover:bg-card-hover border border-border text-xs font-semibold rounded-lg text-foreground transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" />
          <span>Exportar CSV</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-xs font-semibold rounded-lg text-white transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / PDF</span>
        </button>
      </div>

      {/* Report Container */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl print-card relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">Analisando tráfego e gerando relatório técnico...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Print Header */}
            <div className="hidden print:block border-b border-zinc-200 pb-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-zinc-900">SmarTrafego AI</h1>
                  <p className="text-xs text-zinc-500">Relatório e Auditoria de Tráfego por Imagem Aérea</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">ID da Análise: {analysis.id}</p>
                  <p className="text-xs text-zinc-500">Data: {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {/* Rendered Text */}
            <div className="prose prose-invert max-w-none">
              {renderMarkdown(report)}
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-12 pt-8 border-t border-zinc-200">
              <div className="grid grid-cols-2 gap-8 text-center text-xs text-zinc-500">
                <div>
                  <div className="border-t border-zinc-400 w-48 mx-auto mt-8 pt-2">Engenheiro de Tráfego</div>
                </div>
                <div>
                  <div className="border-t border-zinc-400 w-48 mx-auto mt-8 pt-2">Analista do Sistema AI</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
