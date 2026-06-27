'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileImage, Cpu, Loader2, Sparkles, BarChart2, Calendar, FileText, Image as ImageIcon, Plus, ArrowRight } from 'lucide-react';
import { Analysis } from '@/types';
import ImageZoom from './ImageZoom';
import AnalyticsCharts from './AnalyticsCharts';
import ReportView from './ReportView';

interface DashboardProps {
  activeAnalysis: Analysis | null;
  setActiveAnalysis: (analysis: Analysis | null) => void;
}

export default function Dashboard({ activeAnalysis, setActiveAnalysis }: DashboardProps) {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Dashboard Tabs: 'view' | 'charts' | 'report'
  const [activeTab, setActiveTab] = useState<'view' | 'charts' | 'report'>('view');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animate loading steps for premium UX
  useEffect(() => {
    if (!uploading) return;
    const steps = [
      'Fazendo upload da imagem aérea para o servidor...',
      'Executando inferência com modelo YOLOv11...',
      'Detectando veículos e mapeando coordenadas...',
      'Gerando imagem anotada com bounding boxes...',
      'Salvando auditoria no banco de dados SQLite...',
      'Finalizando processamento dos resultados...',
    ];
    let stepIndex = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setLoadingStep(steps[stepIndex]);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [uploading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processImageFile = async (file: File) => {
    // Validate file type
    const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    if (!allowedExtensions.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Por favor, envie uma imagem JPG, PNG, WEBP ou BMP.');
      return;
    }

    setUploading(true);
    setError('');
    setActiveTab('view');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao processar imagem.');
      }

      const analysis: Analysis = await res.json();
      setActiveAnalysis(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro de rede ao conectar com o serviço de IA.');
    } finally {
      setUploading(false);
    }
  };

  // Calculations for Active Analysis statistics
  const totalVehicles = activeAnalysis ? activeAnalysis.vehicles.length : 0;
  
  const categoryCounts = activeAnalysis ? {
    Carro: activeAnalysis.vehicles.filter(v => v.category === 'Carro').length,
    Moto: activeAnalysis.vehicles.filter(v => v.category === 'Moto').length,
    Caminhão: activeAnalysis.vehicles.filter(v => v.category === 'Caminhão').length,
    Ônibus: activeAnalysis.vehicles.filter(v => v.category === 'Ônibus').length,
    Van: activeAnalysis.vehicles.filter(v => v.category === 'Van').length,
  } : { Carro: 0, Moto: 0, Caminhão: 0, Ônibus: 0, Van: 0 };

  const averageConfidence = activeAnalysis && totalVehicles > 0
    ? (activeAnalysis.vehicles.reduce((sum, v) => sum + v.confidence, 0) / totalVehicles) * 100
    : 0;

  return (
    <div className="flex-1 flex flex-col p-8 space-y-6 overflow-y-auto max-h-screen">
      {/* Upload/Selection State */}
      {!activeAnalysis && !uploading && (
        <div className="flex-grow flex flex-col items-center justify-center py-12">
          <div className="max-w-xl w-full text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center justify-center space-x-2.5">
                <Cpu className="w-6 h-6 text-primary animate-pulse" />
                <span>Análise Inteligente de Tráfego</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                Envie uma imagem aérea de alta resolução tirada por satélite ou drone e detecte veículos instantaneamente com IA.
              </p>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-4 ${
                isDragActive
                  ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/5'
                  : 'border-border bg-card hover:bg-card-hover hover:border-border-focus'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.webp,.bmp"
                className="hidden"
              />
              <div className="w-14 h-14 bg-zinc-900 border border-border rounded-2xl flex items-center justify-center text-muted-foreground shadow-inner">
                <UploadCloud className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Arrastar e soltar imagem aérea ou <span className="text-primary hover:underline">clique para procurar</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Suporta JPG, PNG, WEBP e BMP de alta definição (limite de 10MB)
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/20 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-medium text-left">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="flex-grow flex flex-col items-center justify-center py-20">
          <div className="space-y-6 text-center max-w-xs">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-primary/5 border border-primary/10 rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Processando Imagem</h3>
              <p className="text-[11px] text-muted-foreground animate-pulse leading-relaxed min-h-[30px]">
                {loadingStep}
              </p>
            </div>
            {/* Fake progress bar */}
            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-border">
              <div className="bg-primary h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Dashboard View State */}
      {activeAnalysis && !uploading && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center no-print">
            <div>
              <div className="flex items-center space-x-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                <span>Auditoria Ativa</span>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
                <span className="text-primary">{activeAnalysis.id.slice(0, 8)}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground flex items-center space-x-2 mt-1">
                <span>Painel de Resultados Inteligentes</span>
              </h2>
            </div>
            <button
              onClick={() => setActiveAnalysis(null)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-card hover:bg-card-hover border border-border text-xs font-semibold rounded-lg text-foreground transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Análise</span>
            </button>
          </div>

          {/* Quick Metrics General Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Detectado</span>
              <span className="text-2xl font-black text-foreground mt-2">{totalVehicles}</span>
              <span className="text-[10px] text-muted-foreground mt-1">Veículos classificados</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confiança Média</span>
              <span className="text-2xl font-black text-foreground mt-2">{averageConfidence.toFixed(1)}%</span>
              <span className="text-[10px] text-muted-foreground mt-1">Score de acerto YOLO</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tempo da IA</span>
              <span className="text-2xl font-black text-foreground mt-2">{activeAnalysis.processingTime.toFixed(2)}s</span>
              <span className="text-[10px] text-muted-foreground mt-1">Tempo de inferência</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Data Auditoria</span>
              <span className="text-sm font-bold text-foreground mt-4 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span>{new Date(activeAnalysis.createdAt).toLocaleDateString('pt-BR')}</span>
              </span>
              <span className="text-[10px] text-muted-foreground mt-2.5">Armazenado no banco</span>
            </div>
          </div>

          {/* Categorized Indicators Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Carros Card */}
            <div className="bg-card border-l-4 border-l-carro border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">🚗 Carros</span>
                <span className="text-[10px] bg-carro/10 text-carro border border-carro/20 px-1.5 py-0.5 rounded-full font-bold">
                  {totalVehicles > 0 ? ((categoryCounts.Carro / totalVehicles) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-3">{categoryCounts.Carro}</span>
            </div>

            {/* Motos Card */}
            <div className="bg-card border-l-4 border-l-moto border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">🏍 Motos</span>
                <span className="text-[10px] bg-moto/10 text-moto border border-moto/20 px-1.5 py-0.5 rounded-full font-bold">
                  {totalVehicles > 0 ? ((categoryCounts.Moto / totalVehicles) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-3">{categoryCounts.Moto}</span>
            </div>

            {/* Caminhões Card */}
            <div className="bg-card border-l-4 border-l-caminhao border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">🚛 Caminhões</span>
                <span className="text-[10px] bg-caminhao/10 text-caminhao border border-caminhao/20 px-1.5 py-0.5 rounded-full font-bold">
                  {totalVehicles > 0 ? ((categoryCounts.Caminhão / totalVehicles) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-3">{categoryCounts.Caminhão}</span>
            </div>

            {/* Ônibus Card */}
            <div className="bg-card border-l-4 border-l-onibus border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">🚌 Ônibus</span>
                <span className="text-[10px] bg-onibus/10 text-onibus border border-onibus/20 px-1.5 py-0.5 rounded-full font-bold">
                  {totalVehicles > 0 ? ((categoryCounts.Ônibus / totalVehicles) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-3">{categoryCounts.Ônibus}</span>
            </div>

            {/* Vans Card */}
            <div className="bg-card border-l-4 border-l-van border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">🚐 Vans</span>
                <span className="text-[10px] bg-van/10 text-van border border-van/20 px-1.5 py-0.5 rounded-full font-bold">
                  {totalVehicles > 0 ? ((categoryCounts.Van / totalVehicles) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <span className="text-2xl font-extrabold text-foreground mt-3">{categoryCounts.Van}</span>
            </div>
          </div>

          {/* Navigation Tabs for results view */}
          <div className="border-b border-border flex space-x-6 no-print">
            <button
              onClick={() => setActiveTab('view')}
              className={`pb-3 text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'view'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Visualização</span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`pb-3 text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'charts'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Gráficos Estatísticos</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`pb-3 text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'report'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Relatório Inteligente</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="w-full">
            {activeTab === 'view' && (
              <ImageZoom
                originalUrl={`/api/images/uploads/${activeAnalysis.filename}`}
                processedUrl={`/api/images/processed/${activeAnalysis.processedImage}`}
              />
            )}

            {activeTab === 'charts' && (
              <AnalyticsCharts vehicles={activeAnalysis.vehicles} />
            )}

            {activeTab === 'report' && (
              <ReportView analysis={activeAnalysis} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
