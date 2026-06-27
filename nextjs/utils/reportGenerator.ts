import { Analysis } from '@/types';

export function generateHeuristicReport(analysis: Analysis): string {
  const total = analysis.vehicles.length;
  
  // Count categories
  const counts: Record<string, number> = {};
  analysis.vehicles.forEach(v => {
    counts[v.category] = (counts[v.category] || 0) + 1;
  });
  
  const carro = counts['Carro'] || 0;
  const moto = counts['Moto'] || 0;
  const caminhao = counts['Caminhão'] || 0;
  const onibus = counts['Ônibus'] || 0;
  const van = counts['Van'] || 0;
  
  // Dynamic observations based on values
  let trafficDensity = 'Baixa';
  let densityExplanation = 'O fluxo observado nas vias indica tráfego livre, ideal para a fluidez urbana padrão.';
  if (total > 35) {
    trafficDensity = 'Muito Alta (Crítica)';
    densityExplanation = 'Concentração crítica de veículos detectada. Recomenda-se acompanhamento por agentes de trânsito e verificação de pontos de estrangulamento em cruzamentos próximos.';
  } else if (total > 15) {
    trafficDensity = 'Moderada';
    densityExplanation = 'Concentração moderada compatível com vias de trânsito rápido ou avenidas coletoras em horários fora do pico.';
  }
  
  let predominanceText = 'com a grande maioria sendo carros e motocicletas. Isto sugere uma dependência significativa de transporte individual privado nesta região.';
  if (caminhao + onibus > carro + moto) {
    predominanceText = 'mostrando um perfil essencialmente logístico ou uma via arterial de circulação rodoviária urbana para veículos de grande porte.';
  } else if (moto > carro && moto > 5) {
    predominanceText = 'sinalizando alta agilidade de tráfego de motocicletas, comum em grandes corredores urbanos com demanda acentuada de entregas rápidas ou mototáxi.';
  }
  
  // Calculate average confidence
  const avgConf = total > 0 
    ? (analysis.vehicles.reduce((acc, v) => acc + v.confidence, 0) / total) * 100 
    : 0;
    
  const dateFormatted = new Date(analysis.createdAt).toLocaleString('pt-BR');
    
  return `### **Relatório de Monitoramento e Análise de Tráfego**
*Gerado automaticamente pelo SmarTrafego AI em ${dateFormatted}*

---

#### **1. Diagnóstico Geral do Fluxo**
A análise aérea detectou um total de **${total} veículos** na imagem aérea processada. A taxa média de confiança da IA nas detecções foi de **${avgConf.toFixed(1)}%**, processando as imagens em **${analysis.processingTime.toFixed(2)} segundos** com o modelo YOLOv11.

- **Densidade da Via:** **${trafficDensity}**
- **Predomínio:** ${total > 0 ? (carro > moto ? 'Veículos Leves de Passeio' : 'Motocicletas') : 'Nenhum veículo detectado'}
- **Descrição da Dinâmica:** ${densityExplanation}

---

#### **2. Detalhamento por Categoria**
A distribuição volumétrica dos veículos identificados apresenta-se da seguinte forma:
- 🚗 **Carros:** ${carro} (${total > 0 ? ((carro / total) * 100).toFixed(0) : 0}%)
- 🏍 **Motocicletas:** ${moto} (${total > 0 ? ((moto / total) * 100).toFixed(0) : 0}%)
- 🚛 **Caminhões:** ${caminhao} (${total > 0 ? ((caminhao / total) * 100).toFixed(0) : 0}%)
- 🚌 **Ônibus:** ${onibus} (${total > 0 ? ((onibus / total) * 100).toFixed(0) : 0}%)
- 🚐 **Vans:** ${van} (${total > 0 ? ((van / total) * 100).toFixed(0) : 0}%)

---

#### **3. Análise Comportamental e Recomendações**
O fluxo de tráfego analisado é caracterizado por ${predominanceText}

**Recomendações técnicas baseadas no cenário:**
1. ${total > 35 
  ? 'Recomenda-se realizar o controle dos tempos semafóricos em tempo real nas próximas intersecções para escoar o tráfego.' 
  : 'Fluxo atual seguro. Não há necessidade de intervenção imediata de engenharia de tráfego.'}
2. ${caminhao > 3 
  ? 'Detectada circulação expressiva de veículos pesados. Atentar para as normas de restrição de tráfego de cargas pesadas em horários específicos para evitar a fadiga do pavimento.' 
  : 'Baixa atividade de caminhões de grande porte, compatível com vias locais residenciais ou de trânsito misto leve.'}
3. ${onibus > 1 
  ? 'Presença de transporte público nas vias. É importante priorizar corredores exclusivos de ônibus e fiscalizar invasões por automóveis particulares.' 
  : 'Ausência ou pouca circulação de ônibus coletivos neste trecho. Recomenda-se avaliar se há necessidade de integração de transporte público local.'}
  
*Nota: Esta análise foi gerada por inteligência artificial a partir de técnicas avançadas de visão computacional (YOLOv11). Recomenda-se validação técnica por engenheiro de tráfego antes de tomadas de decisão estruturais municipais.*`;
}
