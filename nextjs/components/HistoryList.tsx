'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, Eye, Cpu, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { Analysis } from '@/types';

interface HistoryListProps {
  onSelectAnalysis: (analysis: Analysis) => void;
}

export default function HistoryList({ onSelectAnalysis }: HistoryListProps) {
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/history');
      if (!res.ok) {
        throw new Error('Falha ao carregar o histórico do banco de dados.');
      }
      const data = await res.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering selection
    if (!confirm('Deseja realmente excluir permanentemente esta análise e as imagens associadas?')) {
      return;
    }

    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Falha ao excluir o registro.');
      }

      // Remove from state
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16">
        <Cpu className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Carregando histórico de auditorias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-500/80" />
        <h3 className="text-base font-bold text-foreground">Ocorreu um erro</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-2 px-3 py-1.5 bg-card hover:bg-card-hover border border-border text-xs font-semibold rounded-lg text-foreground transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 text-center border border-dashed border-border rounded-2xl bg-card/20">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-border flex items-center justify-center text-muted-foreground">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Nenhuma análise registrada</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Realize o upload de uma imagem aérea no painel principal para iniciar o processamento da IA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">Histórico de Auditoria</h2>
          <p className="text-xs text-muted-foreground">Veja análises anteriores salvas no banco de dados SQLite</p>
        </div>
        <span className="text-xs bg-zinc-900 border border-border text-muted-foreground px-2.5 py-1 rounded-full font-medium">
          {history.length} registros
        </span>
      </div>

      {/* Grid List for History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card-hover/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Visualização</th>
                <th className="p-4">Data & Horário</th>
                <th className="p-4 text-center">Total Detectados</th>
                <th className="p-4">Categorias Identificadas</th>
                <th className="p-4 text-right">Processamento</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs text-muted-foreground">
              {history.map((item) => {
                // Count unique categories
                const categories = Array.from(new Set(item.vehicles.map((v) => v.category)));
                const date = new Date(item.createdAt);
                const totalVehicles = item.vehicles.length;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectAnalysis(item)}
                    className="hover:bg-card-hover/40 transition cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="w-16 h-10 rounded border border-border overflow-hidden bg-zinc-950 relative">
                        <img
                          src={`/api/images/processed/${item.processedImage}`}
                          alt={item.filename}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-foreground font-semibold flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{date.toLocaleDateString('pt-BR')}</span>
                        </span>
                        <span className="text-[10px] flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-foreground bg-primary/10 border border-primary/20 font-bold">
                        {totalVehicles}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {categories.length === 0 ? (
                          <span className="text-zinc-600 italic">Nenhum</span>
                        ) : (
                          categories.map((cat) => (
                            <span
                              key={cat}
                              className="px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-medium text-zinc-300"
                            >
                              {cat}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-foreground">
                      {item.processingTime.toFixed(2)}s
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onSelectAnalysis(item)}
                          className="p-1.5 hover:bg-zinc-800 rounded-lg text-muted-foreground hover:text-foreground transition"
                          title="Visualizar Análise"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-1.5 hover:bg-red-950/30 rounded-lg text-muted-foreground hover:text-red-400 transition"
                          title="Excluir Auditoria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
