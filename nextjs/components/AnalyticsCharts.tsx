'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Vehicle } from '@/types';

interface AnalyticsChartsProps {
  vehicles: Vehicle[];
}

export default function AnalyticsCharts({ vehicles }: AnalyticsChartsProps) {
  // Count categories
  const categoryCounts: Record<string, number> = {
    Carro: 0,
    Moto: 0,
    Caminhão: 0,
    Ônibus: 0,
    Van: 0,
  };

  vehicles.forEach((v) => {
    if (v.category in categoryCounts) {
      categoryCounts[v.category]++;
    } else {
      categoryCounts[v.category] = 1;
    }
  });

  // Calculate average confidence per category
  const categoryConfidences: Record<string, { total: number; count: number }> = {
    Carro: { total: 0, count: 0 },
    Moto: { total: 0, count: 0 },
    Caminhão: { total: 0, count: 0 },
    Ônibus: { total: 0, count: 0 },
    Van: { total: 0, count: 0 },
  };

  vehicles.forEach((v) => {
    if (v.category in categoryConfidences) {
      categoryConfidences[v.category].total += v.confidence;
      categoryConfidences[v.category].count++;
    }
  });

  // Map to Recharts compatible arrays
  const pieData = Object.entries(categoryCounts)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value: value,
    }));

  const barData = Object.entries(categoryCounts).map(([key, value]) => {
    const confObj = categoryConfidences[key];
    const avgConf = confObj && confObj.count > 0 ? (confObj.total / confObj.count) * 100 : 0;
    return {
      name: key,
      Quantidade: value,
      Confianca: Math.round(avgConf),
    };
  });

  // Colors mapping (matching our theme/neon specifications)
  const COLORS: Record<string, string> = {
    Carro: '#00f0ff',     // Neon Cyan/Blue
    Moto: '#00ff80',      // Neon Green
    Caminhão: '#ff8000',  // Neon Orange
    Ônibus: '#ff00d0',    // Neon Pink/Purple
    Van: '#ffd000',       // Neon Yellow
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="font-semibold text-sm text-foreground mb-1">{payload[0].name}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-xs font-medium" style={{ color: item.color || item.fill }}>
              {item.name}: <span className="font-bold">{item.value}</span>
              {item.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Volume Distribution (Pie Chart) */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-base font-bold text-foreground mb-4">Divisão de Veículos (%)</h3>
        {pieData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Sem dados de veículos para plotar.
          </div>
        ) : (
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#27272a', strokeWidth: 1 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quantities & Confidences (Bar Chart) */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-[400px]">
        <h3 className="text-base font-bold text-foreground mb-4">Volume e Confiança Média por Classe</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#71717a" tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#71717a" tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" align="center" iconType="circle" />
              
              <Bar
                yAxisId="left"
                dataKey="Quantidade"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3b82f6'} />
                ))}
              </Bar>
              <Bar
                yAxisId="right"
                dataKey="Confianca"
                name="Confiança Média"
                unit="%"
                fill="#71717a"
                opacity={0.3}
                radius={[4, 4, 0, 0]}
                maxBarSize={15}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
