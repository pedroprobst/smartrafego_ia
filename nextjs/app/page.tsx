'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import HistoryList from '@/components/HistoryList';
import { Analysis } from '@/types';

export default function Home() {
  const [tab, setTab] = useState<'dashboard' | 'history'>('dashboard');
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null);

  const handleSelectAnalysis = (analysis: Analysis) => {
    setActiveAnalysis(analysis);
    setTab('dashboard'); // Redirect to dashboard to view the results
  };

  const handleNewAnalysis = () => {
    setActiveAnalysis(null); // Clear selected analysis to return to upload screen
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Navigation Sidebar */}
      <Sidebar 
        currentTab={tab} 
        setTab={setTab} 
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {tab === 'dashboard' ? (
          <Dashboard 
            activeAnalysis={activeAnalysis} 
            setActiveAnalysis={setActiveAnalysis} 
          />
        ) : (
          <div className="flex-1 p-8 overflow-y-auto max-h-screen">
            <HistoryList onSelectAnalysis={handleSelectAnalysis} />
          </div>
        )}
      </main>
    </div>
  );
}
