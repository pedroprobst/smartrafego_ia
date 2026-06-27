'use client';

import React from 'react';
import { LayoutDashboard, History, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'history';
  setTab: (tab: 'dashboard' | 'history') => void;
  onNewAnalysis?: () => void;
}

export default function Sidebar({ currentTab, setTab, onNewAnalysis }: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen select-none no-print">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center space-x-3">
        <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
          <Cpu className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-foreground">SmarTrafego AI</h1>
          <p className="text-xs text-muted-foreground font-medium">Análise de Tráfego por IA</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        <button
          onClick={() => {
            setTab('dashboard');
            if (onNewAnalysis) onNewAnalysis();
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentTab === 'dashboard'
              ? 'bg-primary/10 text-primary border-l-2 border-primary'
              : 'text-muted-foreground hover:bg-card-hover hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setTab('history')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentTab === 'history'
              ? 'bg-primary/10 text-primary border-l-2 border-primary'
              : 'text-muted-foreground hover:bg-card-hover hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico</span>
        </button>
      </nav>

      {/* Sidebar Footer System Info */}
      <div className="p-4 border-t border-border bg-card-hover/20">
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <div className="flex-1">
            <span className="font-semibold block text-[10px] uppercase text-zinc-500">YOLOv11 Engine</span>
            <span>Pronto para análise</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
