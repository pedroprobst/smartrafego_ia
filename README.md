# SmarTrafego AI — Sistema Inteligente de Tráfego e Veículos

> **Trabalho Acadêmico de Programação Web / Desenvolvimento Front-End**  
> Aplicação Web 100% Front-End desenvolvida exclusivamente com **HTML5 Semântico, CSS3 Moderno e JavaScript Vanilla (ES6+)**.

---

## 👥 Identificação da Equipe / Integrantes

| Nome Completo |
| **[Nome do Aluno 1]** | Pedro Daniel Godinho Probst.

- **Instituição de Ensino:** Universidade Federal do Oeste do Pará 
- **Curso:** Sistemas de Informação
- **Disciplina:** Programação Web 
- **Semestre:** 2026.2

---

## 🎯 Visão Geral do Projeto

O **SmarTrafego AI** é uma plataforma de monitoramento inteligente de tráfego urbano e telemetria veicular em tempo real. A aplicação simula uma central de operações de transporte inteligente (ITS - *Intelligent Transportation Systems*), permitindo que operadores viários, motoristas e gestores públicos acompanhem o fluxo de veículos, pontos de congestionamento, limites de velocidade e registros de veículos em circulação em vias urbanas e rodovias.

Originalmente desenvolvido para atender aos requisitos de outra disciplina, o projeto foi reaproveitado e adaptado para as especificidades da programação web. Ele foi refatorado e construído seguindo à risca as normas acadêmicas que exigem **código puro**, sem o uso de bibliotecas pesadas ou frameworks (como React, Vue ou Angular), executando **100% no navegador (Client-Side)**.

---

## ✅ Matriz de Conformidade com os Requisitos Obrigatórios

| Requisito Acadêmico | Status | Implementação no Código |
| :--- | :---: | :--- |
| **1. Tecnologias Exclusivas** | **100%** | Apenas HTML5, CSS3 e JavaScript Vanilla. Sem frameworks, compiladores ou bibliotecas externas. |
| **2. 100% Front-End no Navegador** | **100%** | Executado inteiramente no navegador do cliente sem necessidade de backend próprio ou banco relacional. |
| **3. Consumo de API (Fetch API)** | **100%** | Utilização da `fetch()` nativa com método `GET`, `async/await` e manipulação assíncrona de Promises. |
| **4. Tratamento de Erros e Loading** | **100%** | Blocos `try/catch/finally`, estado de carregamento visual com spinner e skeleton screens, e tela de erro com botão de re-tentativa (*Retry*). |
| **5. Listagem Dinâmica** | **100%** | Renderização dinâmica dos cards no DOM via `DocumentFragment`, contendo nome, localização, thumbnail, status e métricas. |
| **6. Pesquisa em Tempo Real** | **100%** | Input de busca funcional com evento nativo `input` e técnica de *debounce*, filtrando por nome, categoria ou localização. |
| **7. Visualização de Detalhes (Modal)** | **100%** | Janela modal rica acessível (com fechamento por ESC, botão de fechar e clique no backdrop), exibindo telemetria completa. |
| **8. Sistema de Favoritos (LocalStorage)** | **100%** | Adição e remoção de favoritos persistida no navegador via `localStorage` com `JSON.stringify()` e `JSON.parse()`. |
| **9. Recuperação Automática de Favoritos** | **100%** | Ao abrir ou atualizar (F5) a página, os favoritos salvos são recuperados imediatamente do LocalStorage. |
| **10. Responsividade e CSS Puro** | **100%** | CSS Grid e Flexbox puros, com Media Queries adaptadas para Smartphones, Tablets e Desktops. |
| **11. Organização do Código** | **100%** | Arquivos desacoplados e estruturados de forma limpa (`index.html`, `style.css`, `script.js`). |

---

## 🛠️ Tecnologias e Arquitetura

- **HTML5 Semântico:** Estruturação semântica com `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<dialog>`/modal acessível com ARIA roles e `<footer>`.
- **CSS3 Puro (Sem Frameworks):**
  - Variáveis nativas (`:root`) para controle consistente de tema e paleta de cores.
  - Layouts fluidos combinando **CSS Grid** e **Flexbox**.
  - Efeitos visuais modernos: Glassmorphism (`backdrop-filter`), animações `@keyframes` (pulse, spin, shimmer, modal pop e toast slide).
  - Design Responsivo através de Media Queries para telas de 320px até 1920px.
- **JavaScript Vanilla (ES6+):**
  - Funções assíncronas com `async/await`.
  - Manipulação direta e performática da árvore do DOM.
  - Otimização com delegação de eventos nativos (*event delegation*).
  - Debounce na digitação do campo de busca.
  - LocalStorage API com serialização segura em JSON.

---

## 🌐 Consumo da API Pública e Tratamento de Erros

A aplicação consome dinamicamente a API pública **DummyJSON** (`https://dummyjson.com/products?limit=20`), transformando em tempo de execução os dados retornados em um painel completo de telemetria veicular e monitoramento viário.

### Fluxo da Requisição Assíncrona:
1. **Início da Operação:** Ativa o componente visual `#loading-state` (spinner central e skeleton cards animados).
2. **Execução do `fetch()`:** Executa `await fetch('https://dummyjson.com/products?limit=20', { method: 'GET' })`.
3. **Mapeamento Dinâmico:**
   - Cada produto é convertido em uma unidade ou ponto de tráfego com modelo veicular (`prod.title`), categoria urbana adaptada (`prod.category`), imagem em alta resolução, placa padrão Mercosul e coordenadas GPS.
   - Velocidade, status de tráfego (Fluído, Moderado, Intenso) e fluxo horário (v/h) são calculados dinamicamente.
4. **Tratamento de Sucesso:**
   - Os cards são injetados no DOM e os 4 cards superiores de métricas são atualizados instantaneamente.
   - O indicador de status no cabeçalho exibe `"API Conectada • Tempo Real"`.
5. **Tratamento de Falhas (`try/catch`):**
   - Caso a rede falhe ou a API fique inacessível, o erro é capturado no bloco `catch`.
   - A interface oculta o carregamento e apresenta o bloco visual `#error-state` com opções de **"Tentar Novamente"** e **"Modo Offline"**.

---

## ⚡ Atualização em Tempo Real e Simulação de Tráfego

O botão **"Atualizar"** (localizado no canto superior direito) é totalmente funcional e interativo:
- **Recálculo em Tempo Real:** Ao ser clicado, a aplicação ativa a rotação do ícone e recalcula dinamicamente a **Velocidade** (km/h), o **Fluxo Horário** (v/h) e o **Status de Tráfego** (Fluído, Moderado ou Intenso) com base nas condições da via.
- **Atualização dos Cards Estatísticos:** Os 4 cards estatísticos superiores (*"Pontos & Veículos"*, *"Tráfego Fluído"*, *"Pontos de Lentidão"* e *"Favoritos Salvos"*) são atualizados em tempo real com animação luminosa.
- **Sincronização no Modal:** Caso o modal de detalhes esteja aberto para algum veículo durante a atualização, seus dados são atualizados ao vivo sem necessidade de reabrir a janela.
- **Simulação Contínua Inteligente:** A central de operações também realiza ajustes periódicos suaves em segundo plano, mantendo o painel vivo como em uma central de tráfego real.

---

## 💾 Sistema de Favoritos com LocalStorage

O sistema permite favoritar tanto pelo ícone de estrela presente em cada card da listagem quanto diretamente pelo botão do Modal de Detalhes:

```javascript
// Exemplo conceitual da implementação no script.js:

// 1. Recuperação no carregamento da página:
const dataRaw = localStorage.getItem('smarttrafego_favorites_v1');
const favoritos = dataRaw ? JSON.parse(dataRaw) : [];

// 2. Persistência após adicionar/remover:
localStorage.setItem('smarttrafego_favorites_v1', JSON.stringify(Array.from(state.favorites)));
```

### Funcionalidades do Módulo de Favoritos:
- **Persistência Permanente:** Os dados permanecem salvos mesmo após fechar o navegador ou reiniciar o computador.
- **Filtro Rápido "⭐ Favoritos":** Uma aba dedicada na barra de controle filtra instantaneamente apenas os pontos favoritados, exibindo a contagem em tempo real.
- **Notificações Toast:** Cada ação de favoritar ou desfavoritar emite um feedback visual rápido e elegante no canto inferior da tela.

---

## 📁 Estrutura de Pastas do Projeto

```
smarttrafego-ai/
│
├── index.html            # Estrutura HTML5 semântica e acessível
├── style.css             # Estilização CSS3 pura, responsiva e dark mode
├── script.js             # Lógica Vanilla JS, fetch assíncrono e LocalStorage
├── README.md             # Documentação técnica e acadêmica do projeto
│
└── data/
    └── traffic-data.json # Dados estruturados de contingência (Modo Offline)
```

---

## 🚀 Como Executar a Aplicação (Passo a Passo)

Como a aplicação é 100% front-end nativa, **não é necessário instalar pacotes npm, nem configurar Python, Node.js ou bancos de dados**.

### Método 1: Via VS Code com a extensão Live Server (Recomendado)
1. Abra a pasta do projeto no **Visual Studio Code**.
2. Instale a extensão oficial **Live Server** (caso ainda não possua).
3. Clique com o botão direito sobre o arquivo `index.html` e selecione **"Open with Live Server"** (ou use o atalho `Alt + L, Alt + O`).
4. A aplicação abrirá automaticamente no seu navegador padrão no endereço `http://127.0.0.1:5500/index.html`.

### Método 2: Servidor HTTP Local Leve
Você também pode rodar qualquer servidor estático local via terminal:

- **Via Python:**
  ```bash
  python -m http.server 3000
  ```
  Acesse `http://localhost:3000` no seu navegador.

- **Via Node.js (npx serve):**
  ```bash
  npx serve .
  ```

### Método 3: Abertura Direta no Navegador
- Basta dar um **duplo clique** no arquivo `index.html` ou arrastá-lo para dentro de qualquer navegador moderno (Chrome, Edge, Firefox, Safari ou Opera).
- *Observação:* Ao abrir diretamente via `file:///`, a aplicação se conecta normalmente à API pública DummyJSON via HTTPS. Caso queira alternar para os dados locais, utilize um servidor estático local (como o Live Server do Método 1) para evitar bloqueios de CORS do protocolo de arquivo local.

---

## 📱 Testes de Responsividade

A interface foi projetada e testada nos seguintes breakpoints:
- **Mobile Pequeno / Smartphones:** `320px` a `640px` (Cards em coluna única, cabeçalho condensado, filtros com scroll horizontal).
- **Tablets e Telas Médias:** `641px` a `1024px` (Grid adaptativo de 2 colunas, métricas compactas).
- **Desktops e Telas Grandes:** `1025px` ou superior (Grid de 3 a 4 colunas, modal em 2 colunas, visualização ampla).

---

## 🎓 Conclusão e Avaliação Acadêmica

O projeto atende com rigor técnico todos os critérios estipulados para a disciplina de Programação Web, demonstrando domínio pleno da linguagem **JavaScript Vanilla**, manipulação eficiente da **DOM API**, consumo assíncrono de recursos remotos (**Fetch API**) e persistência client-side (**LocalStorage**), aliados a um código limpo, modular, documentado e com foco em acessibilidade e experiência do usuário (UX).
