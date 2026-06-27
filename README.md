# SmarTrafego AI — Sistema Inteligente de Análise de Tráfego por Imagens Aéreas

O **SmarTrafego AI** é uma aplicação web completa e moderna para monitoramento e análise de tráfego urbano a partir de imagens aéreas (capturadas por drones ou satélites de alta resolução). O sistema utiliza **YOLOv11** (visão computacional avançada) no backend Python para classificar e delimitar veículos, salva os históricos em um banco de dados **SQLite** via **Prisma ORM**, e exibe um painel analítico avançado em **Next.js 15** com relatórios de tráfego gerados automaticamente por Inteligência Artificial em linguagem natural.

---

## 🚀 Tecnologias Utilizadas

### Backend (Inteligência Artificial)
- **Python 3.11**
- **FastAPI** (Serviço de API ágil e assíncrono)
- **Ultralytics YOLOv11** (Modelo pré-treinado de detecção de objetos em tempo real)
- **OpenCV** (Processamento de imagem e renderização de bounding boxes)

### Frontend & Banco de Dados
- **Next.js 15** (React, TypeScript e App Router)
- **Tailwind CSS v4** (Interface moderna com tema escuro e animações inspiradas no Linear/Vercel)
- **Recharts** (Gráficos interativos para exibição de métricas)
- **Prisma ORM** (Camada de abstração e modelagem de banco de dados)
- **SQLite** (Banco de dados relacional leve e autocontido)

---

## 📁 Estrutura de Pastas

```
smarttrafego-ai/
├── uploads/              # Imagens brutas originais enviadas pelo usuário
├── processed/            # Imagens processadas com bounding boxes anotadas pela IA
├── models/               # Pesos salvos do modelo YOLOv11 (yolo11n.pt)
├── database/             # Arquivo SQLite dev.db
├── python/               # Backend Python
│   ├── venv/             # Ambiente virtual (Virtualenv)
│   ├── app.py            # API FastAPI com rotas de análise /health
│   ├── yolo_model.py     # Lógica do modelo YOLOv11 e OpenCV
│   └── requirements.txt  # Dependências Python
└── nextjs/               # Frontend Next.js
    ├── prisma/
    │   └── schema.prisma # Configuração do banco de dados relacional
    ├── app/              # Rotas e Páginas do Next.js App Router
    ├── components/       # Componentes reutilizáveis (Zoom, Gráficos, Relatório, Sidebar)
    ├── services/         # Clientes de chamadas de API
    ├── utils/            # Utilitários (como exportação de CSV e gerador de relatórios fallback)
    └── types/            # Declarações de tipo do TypeScript
```

---

## 🔧 Configuração e Instalação

### Pré-requisitos
- **Python 3.8+** (Recomendado 3.11)
- **Node.js LTS** (v18 ou superior)
- Conexão com a internet para download automático dos pesos YOLOv11 (`yolo11n.pt`).

---

### Passo 1: Instalação e Execução do Backend (FastAPI)

1. Navegue até a pasta do backend:
   ```bash
   cd python
   ```

2. Crie e ative o ambiente virtual do Python:
   - **No Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **No macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Instale as dependências necessárias:
   ```bash
   pip install -r requirements.txt
   ```

4. Execute o servidor FastAPI:
   ```bash
   python app.py
   ```
   O backend estará disponível em `http://127.0.0.1:8000`.

---

### Passo 2: Instalação e Execução do Frontend (Next.js)

1. Navegue até a pasta do frontend (em outro terminal):
   ```bash
   cd nextjs
   ```

2. Instale as dependências npm:
   ```bash
   npm install
   ```

3. Execute as migrações do banco de dados para criar as tabelas no SQLite:
   ```bash
   npx prisma db push
   ```

4. Execute o servidor de desenvolvimento do Next.js:
   ```bash
   npm run dev
   ```
   O frontend estará disponível em `http://localhost:3000`.

---

## ⚙️ Configuração de Recursos Inteligentes (LLM)

O sistema possui integração nativa com o **Google Gemini API** para criar auditorias em linguagem natural complexas de tráfego urbano. 

Para habilitar a análise real por LLM:
1. Crie um arquivo `.env` ou `.env.local` dentro da pasta `nextjs/`.
2. Adicione sua chave de API do Gemini:
   ```env
   GEMINI_API_KEY="SUA_CHAVE_DE_API_AQUI"
   ```

*Nota: Se nenhuma chave de API for fornecida, o sistema detectará a ausência automaticamente e ativará o mecanismo interno profissional de geração heurística, garantindo o funcionamento offline e imediato da geração de relatórios.*

---

## 📊 Funcionalidades em Destaque

- **Visualizador Side-by-Side Sincronizado:** Permite dar zoom (Scroll da roda do mouse) e arrastar (Drag) em ambas as imagens simultaneamente, facilitando o diagnóstico comparativo minucioso.
- **Gráficos de Composição:** Gráficos interativos integrados via Recharts para acompanhamento de densidade de frota.
- **Exportação e Auditoria:** Permite baixar um relatório estruturado no padrão executivo de trânsito em PDF através do comando de impressão integrado, ou extrair os metadados de latitude/coordenadas das bounding boxes em formato CSV (Excel).
- **Gerenciador de Histórico:** Salva todas as consultas no SQLite, permitindo reabrir análises anteriores a qualquer momento ou excluí-las permanentemente do servidor físico.
