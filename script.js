/**
 * ============================================================================
 * SMARTRAFEGO AI — LÓGICA FRONT-END VANILLA (ES6+)
 * Projeto Acadêmico: Programação Web / Front-End
 * 
 * REQUISITOS ATENDIDOS:
 * 1. Consumo dinâmico de API pública via Fetch API (GET) com async/await:
 *    - Endpoint: https://dummyjson.com/products?limit=20
 *    - Mapeamento dinâmico em pontos de tráfego/veículos urbanos
 *    - Loading spinner visual e tratamento robusto de erros com try/catch
 * 2. Atualização e simulação de tráfego em tempo real:
 *    - Botão "Atualizar" totalmente interativo com recálculo dinâmico de velocidade,
 *      fluxo horário (v/h), status (Fluído, Moderado, Intenso) e timestamp
 *    - Atualização automática dos cards superiores de estatísticas em tempo real
 *    - Auto-sincronização periódica inteligente (central de controle ITS)
 * 3. Manutenção dos requisitos obrigatórios:
 *    - Pesquisa em tempo real com debounce (por nome, modelo ou localização)
 *    - Filtros por status de tráfego e aba de favoritos
 *    - Sistema de Favoritos persistido no LocalStorage (JSON.stringify / JSON.parse)
 *    - Modal acessível para visualização de detalhes (ESC, clique externo)
 *    - 100% JavaScript Vanilla, HTML5 Semântico e CSS3 puro (sem frameworks)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONSTANTES E CONFIGURAÇÕES GLOBAIS
  // --------------------------------------------------------------------------
  
  // Endpoint da API pública externa (20 produtos retornados em JSON)
  const PUBLIC_API_URL = 'https://dummyjson.com/products?limit=20';
  
  // Endpoint de contingência local
  const LOCAL_DATA_URL = 'data/traffic-data.json';

  // Chave oficial de persistência no LocalStorage
  const STORAGE_KEY_FAVORITES = 'smarttrafego_favorites_v1';

  // Mapeamento dinâmico de categorias da API para categorias de transporte urbano
  const CATEGORY_MAP = {
    'beauty': 'Veículo de Entrega Rápida',
    'fragrances': 'Viatura de Ronda Inteligente',
    'furniture': 'Caminhão de Carga Pesada',
    'groceries': 'Veículo de Abastecimento Urbano',
    'home-decoration': 'Utilitário de Serviço Viário',
    'kitchen-accessories': 'Furgão de Suporte Operacional',
    'laptops': 'Central Móvel de Telemetria',
    'mens-shirts': 'Veículo Leve de Distribuição',
    'mens-shoes': 'Van de Transporte Comercial',
    'mens-watches': 'Viatura de Escolta & Apoio',
    'mobile-accessories': 'Veículo de Apoio Técnico',
    'motorcycle': 'Motocicleta Operacional',
    'skin-care': 'Transporte de Apoio Urbano',
    'smartphones': 'Unidade Móvel de Suporte',
    'sports-accessories': 'Viatura de Patrulhamento',
    'sunglasses': 'Veículo de Inspeção Viária',
    'vehicle': 'Veículo Executivo / Passeio',
    'womens-bags': 'Transporte Executivo Urbano',
    'womens-dresses': 'Veículo Metropolitano',
    'womens-jewellery': 'Veículo de Transporte Seguro',
    'womens-shoes': 'Transporte Logístico Leve',
    'womens-watches': 'Viatura de Operações Especiais'
  };

  // Catálogo curado de 20 vias expressas e avenidas com limites regulamentares e coordenadas GPS
  const URBAN_LOCATIONS = [
    { loc: 'Av. Paulista, altura 1578 - São Paulo, SP', coords: '-23.5614, -46.6559', limit: 50 },
    { loc: 'Marginal Pinheiros, km 12 - São Paulo, SP', coords: '-23.5989, -46.6912', limit: 70 },
    { loc: 'Marginal Tietê, Ponte das Bandeiras - São Paulo, SP', coords: '-23.5186, -46.6288', limit: 70 },
    { loc: 'Rodovia dos Imigrantes, km 16 - Diadema, SP', coords: '-23.6845, -46.6120', limit: 100 },
    { loc: 'Avenida Atlântica, Posto 4 - Rio de Janeiro, RJ', coords: '-22.9711, -43.1822', limit: 60 },
    { loc: 'Linha Amarela, Saída 4 - Rio de Janeiro, RJ', coords: '-22.8893, -43.2678', limit: 80 },
    { loc: 'Eixo Monumental, Setor Norte - Brasília, DF', coords: '-15.7894, -47.8906', limit: 60 },
    { loc: 'Av. Brigadeiro Faria Lima, 2200 - São Paulo, SP', coords: '-23.5765, -46.6893', limit: 50 },
    { loc: 'Rodovia Castello Branco, km 24 - Barueri, SP', coords: '-23.5042, -46.8617', limit: 100 },
    { loc: 'Avenida 23 de Maio, Viaduto Santa Ifigênia - São Paulo, SP', coords: '-23.5432, -46.6381', limit: 60 },
    { loc: 'Ponte Rio-Niterói, Vão Central - Rio de Janeiro, RJ', coords: '-22.8681, -43.1614', limit: 80 },
    { loc: 'Avenida das Américas, Barra da Tijuca - Rio de Janeiro, RJ', coords: '-23.0004, -43.3659', limit: 70 },
    { loc: 'Rodovia Presidente Dutra, km 220 - Guarulhos, SP', coords: '-23.4542, -46.5123', limit: 110 },
    { loc: 'Avenida Ipiranga, Centro Histórico - São Paulo, SP', coords: '-23.5448, -46.6433', limit: 40 },
    { loc: 'Rodovia Ayrton Senna, km 19 - São Paulo, SP', coords: '-23.4891, -46.5020', limit: 100 },
    { loc: 'Avenida Paralela, Sentido Aeroporto - Salvador, BA', coords: '-12.9421, -38.4128', limit: 80 },
    { loc: 'Via Expressa Leste-Oeste - Belo Horizonte, MG', coords: '-19.9234, -43.9512', limit: 70 },
    { loc: 'Avenida Beira-Mar, Meireles - Fortaleza, CE', coords: '-3.7259, -38.4972', limit: 50 },
    { loc: 'Rodovia Anhanguera, km 98 - Campinas, SP', coords: '-22.9123, -47.0734', limit: 100 },
    { loc: 'Corredor Norte-Sul, Túnel Ayrton Senna - São Paulo, SP', coords: '-23.5821, -46.6578', limit: 60 }
  ];

  // Galeria de imagens veiculares e de tráfego de alta resolução
  const VEHICLE_GALLERY = [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=800&q=80'
  ];

  // Base embutida de contingência caso ocorra bloqueio de CORS local em file://
  const EMBEDDED_FALLBACK_DATA = [
    {
      id: "mon-001",
      name: "Ponto de Monitoramento Av. Paulista - Masp",
      brand: "Central ITS",
      location: "Av. Paulista, altura 1578 - São Paulo, SP",
      category: "Veículo Executivo / Passeio",
      trafficStatus: "Moderado",
      speedLimit: 50,
      currentSpeed: 38,
      flowRate: 1420,
      confidence: 98.4,
      thumbnail: VEHICLE_GALLERY[0],
      description: "Sensor óptico de alta resolução com detecção inteligente de fluxo de tráfego na faixa central.",
      lastUpdate: "Agora mesmo",
      plateSample: "BRA-4X92",
      coordinates: "-23.5614, -46.6559"
    },
    {
      id: "mon-002",
      name: "Radar Inteligente Marginal Tietê - Ponte das Bandeiras",
      brand: "Radar Urbano",
      location: "Marginal Tietê, Ponte das Bandeiras - São Paulo, SP",
      category: "Caminhão de Carga Pesada",
      trafficStatus: "Intenso",
      speedLimit: 70,
      currentSpeed: 24,
      flowRate: 2950,
      confidence: 96.8,
      thumbnail: VEHICLE_GALLERY[1],
      description: "Sensoriamento contínuo de veículos de carga e veículos leves. Lentidão acentuada no trecho.",
      lastUpdate: "Agora mesmo",
      plateSample: "SPK-8812",
      coordinates: "-23.5186, -46.6288"
    },
    {
      id: "mon-003",
      name: "Sensor de Fluxo Rodovia dos Imigrantes - Km 16",
      brand: "Ecovias Telemetria",
      location: "Rodovia dos Imigrantes, km 16 - Diadema, SP",
      category: "Veículo Executivo / Passeio",
      trafficStatus: "Fluído",
      speedLimit: 100,
      currentSpeed: 96,
      flowRate: 880,
      confidence: 99.1,
      thumbnail: VEHICLE_GALLERY[2],
      description: "Trecho de alta velocidade com monitoramento de tempo seco e tráfego livre em todas as faixas.",
      lastUpdate: "Agora mesmo",
      plateSample: "RIO-9J31",
      coordinates: "-23.6845, -46.6120"
    },
    {
      id: "mon-004",
      name: "Estação Viária Copacabana - Av. Atlântica",
      brand: "CET-Rio",
      location: "Avenida Atlântica, Posto 4 - Rio de Janeiro, RJ",
      category: "Transporte Executivo Urbano",
      trafficStatus: "Fluído",
      speedLimit: 60,
      currentSpeed: 52,
      flowRate: 940,
      confidence: 97.5,
      thumbnail: VEHICLE_GALLERY[3],
      description: "Monitoramento à beira-mar com contagem contínua de veículos e excelente fluidez.",
      lastUpdate: "Agora mesmo",
      plateSample: "RJX-3H44",
      coordinates: "-22.9711, -43.1822"
    }
  ];

  // --------------------------------------------------------------------------
  // 2. ESTADO GLOBAL DA APLICAÇÃO (CLIENT-SIDE)
  // --------------------------------------------------------------------------
  const state = {
    items: [],           // Dados normalizados dos 20 pontos/veículos
    filteredItems: [],   // Itens ativos após busca e filtros
    favorites: new Set(),// Conjunto de IDs favoritados (persistido no LocalStorage)
    activeFilter: 'all', // Filtro ativo: 'all' | 'favorites' | 'Fluído' | 'Moderado' | 'Intenso'
    searchTerm: '',      // Termo atual da pesquisa
    sortBy: 'default',   // Critério de ordenação ativo
    selectedItem: null,  // Item aberto no Modal
    isUpdating: false,   // Bloqueio de concorrência na atualização
    autoTimer: null      // Temporizador para simulação suave periódica
  };

  // --------------------------------------------------------------------------
  // 3. REFERÊNCIAS AO DOM (CACHE DE ELEMENTOS)
  // --------------------------------------------------------------------------
  const DOM = {
    // Header & Status
    apiStatusText: document.getElementById('api-status-text'),
    refreshBtn: document.getElementById('refresh-btn'),
    
    // Cards Superiores de Métricas
    metricTotal: document.getElementById('metric-total-items'),
    metricFluid: document.getElementById('metric-fluid'),
    metricHeavy: document.getElementById('metric-heavy'),
    metricFavorites: document.getElementById('metric-favorites'),
    countAll: document.getElementById('count-all'),
    countFav: document.getElementById('count-fav'),

    // Controles: busca, filtros e ordenação
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    filterChips: document.querySelectorAll('.filter-chip'),
    sortSelect: document.getElementById('sort-select'),

    // Estados Visuais (Loading, Erro, Vazio)
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),
    fallbackDataBtn: document.getElementById('fallback-data-btn'),
    emptyState: document.getElementById('empty-state'),
    emptyDescription: document.getElementById('empty-description'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),

    // Grid de Cards
    cardsSection: document.getElementById('cards-section'),
    cardsGrid: document.getElementById('cards-grid'),

    // Modal de Detalhes
    modal: document.getElementById('details-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalCategory: document.getElementById('modal-category'),
    modalImage: document.getElementById('modal-image'),
    modalStatusBadge: document.getElementById('modal-status-badge'),
    modalLocationText: document.getElementById('modal-location-text'),
    modalDescription: document.getElementById('modal-description'),
    modalSpeed: document.getElementById('modal-speed'),
    modalSpeedLimit: document.getElementById('modal-speed-limit'),
    modalFlow: document.getElementById('modal-flow'),
    modalConfidence: document.getElementById('modal-confidence'),
    modalPlate: document.getElementById('modal-plate'),
    modalCoords: document.getElementById('modal-coords'),
    modalUpdate: document.getElementById('modal-update'),
    modalFavBtn: document.getElementById('modal-fav-btn'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalCloseAction: document.getElementById('modal-close-action'),

    // Toast Notification
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
  };

  // --------------------------------------------------------------------------
  // 4. PERSISTÊNCIA COM LOCALSTORAGE (JSON.stringify / JSON.parse)
  // --------------------------------------------------------------------------

  function carregarFavoritosLocalStorage() {
    try {
      const dataRaw = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (dataRaw) {
        const parsed = JSON.parse(dataRaw);
        if (Array.isArray(parsed)) {
          state.favorites = new Set(parsed);
        }
      }
    } catch (err) {
      console.warn('Erro ao ler favoritos do LocalStorage:', err);
      state.favorites = new Set();
    }
    atualizarContadorFavoritosUI();
  }

  function salvarFavoritosLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(Array.from(state.favorites)));
    } catch (err) {
      console.error('Falha ao gravar favoritos no LocalStorage:', err);
    }
    atualizarContadorFavoritosUI();
  }

  function alternarFavorito(itemId) {
    const idStr = String(itemId);
    const item = state.items.find(i => String(i.id) === idStr);
    const itemName = item ? item.name : 'Ponto';

    if (state.favorites.has(idStr)) {
      state.favorites.delete(idStr);
      exibirToast(`"${itemName}" removido dos favoritos.`);
    } else {
      state.favorites.add(idStr);
      exibirToast(`"${itemName}" adicionado aos favoritos! ★`);
    }

    salvarFavoritosLocalStorage();
    atualizarCardsFavoritosUI();

    if (state.selectedItem && String(state.selectedItem.id) === idStr) {
      atualizarBotaoModalFav(idStr);
    }

    if (state.activeFilter === 'favorites') {
      aplicarFiltrosEBusca();
    }
  }

  // --------------------------------------------------------------------------
  // 5. CONSUMO DINÂMICO DE API (Fetch API com async/await e try/catch)
  // --------------------------------------------------------------------------

  /**
   * Faz requisição HTTP assíncrona para a API pública externa.
   * Consome https://dummyjson.com/products?limit=20 e mapeia os dados dinamicamente.
   */
  async function carregarDadosTrafego(usarApenasLocal = false) {
    exibirEstado('loading');
    DOM.apiStatusText.textContent = 'Buscando API pública...';

    try {
      let produtosCarregados = [];

      if (!usarApenasLocal) {
        // Requisição HTTP via Fetch API com async/await
        const response = await fetch(PUBLIC_API_URL, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Falha ao conectar à API pública.`);
        }

        const data = await response.json();
        produtosCarregados = data.products || [];
        DOM.apiStatusText.textContent = 'API Conectada • Tempo Real';
      } else {
        // Modo local de contingência
        produtosCarregados = await carregarDadosLocaisViaFetch();
        DOM.apiStatusText.textContent = 'Modo Local (Offline)';
      }

      if (!produtosCarregados || produtosCarregados.length === 0) {
        throw new Error('Nenhum dado retornado da API.');
      }

      // Mapeamento dinâmico dos 20 produtos em itens de tráfego/veículos
      state.items = normalizarDadosApi(produtosCarregados);

      // Renderização inicial
      aplicarFiltrosEBusca();
      atualizarMetricasGerais();
      exibirEstado('content');

      // Inicia auto-simulação suave em segundo plano (atualiza a cada 15s)
      iniciarSimulacaoAutomatica();

    } catch (err) {
      console.error('Erro na requisição da API:', err);
      DOM.errorMessage.textContent = `${err.message} Verifique sua conexão de rede ou tente novamente.`;
      DOM.apiStatusText.textContent = 'Erro de Conexão';
      exibirEstado('error');
    }
  }

  /**
   * Consome dados de fallback caso a rede falhe
   */
  async function carregarDadosLocaisViaFetch() {
    try {
      const res = await fetch(LOCAL_DATA_URL, { method: 'GET' });
      if (!res.ok) throw new Error('Falha ao abrir arquivo local.');
      return await res.json();
    } catch (e) {
      console.warn('Fallback para dataset embutido:', e);
      return EMBEDDED_FALLBACK_DATA;
    }
  }

  /**
   * Mapeia os dados brutos da API pública transformando dinamicamente cada item
   * em um ponto de tráfego ou veículo urbano completo e estruturado.
   * @param {Array} produtos 
   * @returns {Array}
   */
  function normalizarDadosApi(produtos) {
    const letrasPlacas = ['BRA', 'SPK', 'RIO', 'DFB', 'KLA', 'MGT', 'PRX', 'BHZ', 'CTA', 'FOR'];

    return produtos.map((prod, index) => {
      const locObj = URBAN_LOCATIONS[index % URBAN_LOCATIONS.length];
      const categoriaFormatada = CATEGORY_MAP[prod.category] || 
        `${prod.category.charAt(0).toUpperCase() + prod.category.slice(1)} - Veículo Urbano`;

      // Simulação inicial realista de velocidade
      // Baseada no limite da via e na variação do rating do produto
      const baseRatio = 0.35 + (((prod.id * 17) % 60) / 100); // 0.35 a 0.95 do limite
      const speed = Math.round(locObj.limit * baseRatio);
      
      const status = calcularStatusPorVelocidade(speed, locObj.limit);
      const flow = calcularFluxoPorStatus(status, prod.id);

      const placa = `${letrasPlacas[index % letrasPlacas.length]}-${(index + 1) * 3}${prod.id % 90}`;
      const imagemVeiculo = VEHICLE_GALLERY[index % VEHICLE_GALLERY.length];

      return {
        id: String(prod.id),
        name: `Veículo ${prod.title}`,
        brand: prod.brand || 'Frota Inteligente',
        category: categoriaFormatada,
        location: locObj.loc,
        coordinates: locObj.coords,
        speedLimit: locObj.limit,
        currentSpeed: speed,
        trafficStatus: status,
        flowRate: flow,
        confidence: Number((96.0 + (prod.rating || 4) * 0.75).toFixed(1)),
        thumbnail: imagemVeiculo,
        description: `Monitoramento operacional de tráfego realizado na ${locObj.loc}. Unidade de telemetria identificada com ${prod.title}. Informações técnicas de circulação e conformidade com limites da via.`,
        plateSample: placa,
        lastUpdate: 'Agora mesmo'
      };
    });
  }

  // --------------------------------------------------------------------------
  // 6. ATUALIZAÇÃO EM TEMPO REAL E SIMULAÇÃO DE TRÁFEGO
  // --------------------------------------------------------------------------

  /**
   * Calcula dinamicamente o status do tráfego com base na velocidade atual e no limite da via:
   * - Fluído: >= 70% da velocidade limite (Verde)
   * - Moderado: entre 40% e 70% da velocidade limite (Âmbar)
   * - Intenso / Lentidão: < 40% da velocidade limite (Vermelho)
   */
  function calcularStatusPorVelocidade(velocidade, limite) {
    const ratio = velocidade / limite;
    if (ratio >= 0.70) return 'Fluído';
    if (ratio >= 0.40) return 'Moderado';
    return 'Intenso';
  }

  /**
   * Calcula a taxa de fluxo horário de veículos proporcional ao status da via
   */
  function calcularFluxoPorStatus(status, seed = 1) {
    if (status === 'Intenso') {
      // Retenção veicular acentuada e adensamento
      return 2400 + Math.floor(Math.random() * 800) + (seed % 100);
    } else if (status === 'Moderado') {
      // Fluxo intermediário com velocidade constante
      return 1300 + Math.floor(Math.random() * 700) + (seed % 80);
    } else {
      // Vias livres e fluxo contínuo
      return 700 + Math.floor(Math.random() * 500) + (seed % 50);
    }
  }

  /**
   * Atualiza as métricas de tráfego em tempo real para todos os veículos:
   * - Altera a velocidade de forma dinâmica e plausível
   * - Recalcula o status (Fluído, Moderado, Intenso)
   * - Recalcula a vazão horária de tráfego (v/h)
   * - Atualiza os cards da tela e as métricas do topo instantaneamente
   * @param {boolean} acaoDoUsuario - Indica se foi disparado manualmente pelo botão "Atualizar"
   */
  function simularAtualizacaoTrafego(acaoDoUsuario = true) {
    if (state.items.length === 0) {
      carregarDadosTrafego();
      return;
    }

    if (state.isUpdating) return;
    state.isUpdating = true;

    // Efeito visual no botão de atualizar
    if (acaoDoUsuario) {
      DOM.refreshBtn.classList.add('spinning');
      DOM.apiStatusText.textContent = 'Atualizando telemetria em tempo real...';
    }

    // Hora formatada da atualização
    const agoraStr = `Agora (${new Date().toLocaleTimeString('pt-BR')})`;

    // Recalcula dinamicamente para cada item
    state.items = state.items.map(item => {
      // Variação estocástica realista de velocidade (ex: oscilação entre -8 km/h e +8 km/h)
      const variacao = Math.floor(Math.random() * 17) - 8;
      let novaVelocidade = item.currentSpeed + variacao;

      // Restrições físicas: mínimo 12 km/h, máximo velocidade da via + 8 km/h
      const minSpeed = 12;
      const maxSpeed = item.speedLimit + 8;
      novaVelocidade = Math.max(minSpeed, Math.min(maxSpeed, novaVelocidade));

      // Recalcula status e fluxo
      const novoStatus = calcularStatusPorVelocidade(novaVelocidade, item.speedLimit);
      const novoFluxo = calcularFluxoPorStatus(novoStatus, Number(item.id));

      return {
        ...item,
        currentSpeed: novaVelocidade,
        trafficStatus: novoStatus,
        flowRate: novoFluxo,
        lastUpdate: agoraStr
      };
    });

    // Re-renderiza a lista respeitando filtros e busca ativos
    aplicarFiltrosEBusca();

    // Atualiza automaticamente os 4 cards superiores de estatísticas
    atualizarMetricasGerais(true);

    // Se o modal de detalhes estiver aberto, atualiza suas informações em tempo real
    if (state.selectedItem) {
      const itemAtualizado = state.items.find(i => String(i.id) === String(state.selectedItem.id));
      if (itemAtualizado) {
        atualizarModalEmTempoReal(itemAtualizado);
      }
    }

    // Finalização e feedback visual
    setTimeout(() => {
      DOM.refreshBtn.classList.remove('spinning');
      DOM.apiStatusText.textContent = 'API Conectada • Tempo Real';
      state.isUpdating = false;

      if (acaoDoUsuario) {
        exibirToast('Métricas de tráfego atualizadas em tempo real! (Velocidade e Fluxo recalculados)');
      }
    }, 450);
  }

  /**
   * Temporizador periódico suave em segundo plano
   */
  function iniciarSimulacaoAutomatica() {
    if (state.autoTimer) clearInterval(state.autoTimer);
    // Atualiza sutilmente a cada 18 segundos caso o usuário não clique no botão
    state.autoTimer = setInterval(() => {
      if (!document.hidden && state.items.length > 0) {
        simularAtualizacaoTrafego(false);
      }
    }, 18000);
  }

  // --------------------------------------------------------------------------
  // 7. ATUALIZAÇÃO DOS CARDS SUPERIORES DE ESTATÍSTICAS
  // --------------------------------------------------------------------------

  /**
   * Atualiza automaticamente os 4 cards estatísticos superiores:
   * - "Pontos & Veículos"
   * - "Tráfego Fluído"
   * - "Pontos de Lentidão"
   * - "Favoritos Salvos"
   * @param {boolean} animar - Adiciona efeito luminoso de atualização
   */
  function atualizarMetricasGerais(animar = false) {
    const total = state.items.length;
    const fluidos = state.items.filter(i => i.trafficStatus === 'Fluído').length;
    const intensos = state.items.filter(i => i.trafficStatus === 'Intenso').length;
    const favs = state.favorites.size;

    DOM.metricTotal.textContent = total;
    DOM.metricFluid.textContent = fluidos;
    DOM.metricHeavy.textContent = intensos;
    DOM.metricFavorites.textContent = favs;

    DOM.countAll.textContent = total;
    DOM.countFav.textContent = favs;

    if (animar) {
      [DOM.metricTotal, DOM.metricFluid, DOM.metricHeavy, DOM.metricFavorites].forEach(elem => {
        elem.classList.remove('updated');
        void elem.offsetWidth; // Força reflow do navegador
        elem.classList.add('updated');
      });
    }
  }

  function atualizarContadorFavoritosUI() {
    const favCount = state.favorites.size;
    DOM.metricFavorites.textContent = favCount;
    DOM.countFav.textContent = favCount;
  }

  // --------------------------------------------------------------------------
  // 8. FILTRAGEM, BUSCA EM TEMPO REAL E ORDENAÇÃO
  // --------------------------------------------------------------------------

  function aplicarFiltrosEBusca() {
    let result = [...state.items];

    // 1. Pesquisa textual em tempo real
    if (state.searchTerm.trim() !== '') {
      const term = state.searchTerm.toLowerCase().trim();
      result = result.filter(item => {
        return (
          item.name.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          item.plateSample.toLowerCase().includes(term)
        );
      });
    }

    // 2. Filtro por Abas (Todos, Favoritos, Fluído, Moderado, Intenso)
    if (state.activeFilter === 'favorites') {
      result = result.filter(item => state.favorites.has(String(item.id)));
    } else if (state.activeFilter !== 'all') {
      result = result.filter(item => item.trafficStatus === state.activeFilter);
    }

    // 3. Ordenação
    switch (state.sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
        break;
      case 'speed-desc':
        result.sort((a, b) => b.currentSpeed - a.currentSpeed);
        break;
      case 'flow-desc':
        result.sort((a, b) => b.flowRate - a.flowRate);
        break;
      default:
        break;
    }

    state.filteredItems = result;
    renderizarCards(state.filteredItems);
  }

  function debounce(func, wait = 220) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // --------------------------------------------------------------------------
  // 9. RENDERIZAÇÃO DO DOM (CARDS E ESTADOS)
  // --------------------------------------------------------------------------

  function renderizarCards(items) {
    DOM.cardsGrid.innerHTML = '';

    if (items.length === 0) {
      DOM.cardsSection.classList.add('hidden');
      DOM.emptyState.classList.remove('hidden');

      if (state.activeFilter === 'favorites') {
        DOM.emptyDescription.textContent = 'Nenhum ponto ou veículo favoritado no momento. Clique na estrela ★ de qualquer card para salvá-lo aqui!';
      } else if (state.searchTerm) {
        DOM.emptyDescription.textContent = `Nenhum registro encontrado para "${state.searchTerm}".`;
      } else {
        DOM.emptyDescription.textContent = 'Nenhum item corresponde ao filtro selecionado.';
      }
      return;
    }

    DOM.emptyState.classList.add('hidden');
    DOM.cardsSection.classList.remove('hidden');

    const fragment = document.createDocumentFragment();

    items.forEach(item => {
      const isFav = state.favorites.has(String(item.id));
      const card = document.createElement('article');
      card.className = 'traffic-card';
      card.setAttribute('data-id', item.id);

      card.innerHTML = `
        <div class="card-media">
          <img 
            src="${item.thumbnail}" 
            alt="${item.name}" 
            class="card-img" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';"
          />
          <div class="card-badge-top">
            <span class="badge-status ${item.trafficStatus}">${item.trafficStatus}</span>
          </div>
          <button 
            type="button" 
            class="btn-fav ${isFav ? 'favorited' : ''}" 
            data-fav-id="${item.id}"
            title="${isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}"
            aria-label="${isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}"
          >
            ★
          </button>
        </div>

        <div class="card-content">
          <span class="card-category">${item.category}</span>
          <h3 class="card-title">${item.name}</h3>
          
          <div class="card-location">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${item.location}</span>
          </div>

          <div class="card-metrics">
            <div class="metric-mini">
              <span class="mini-label">Velocidade</span>
              <span class="mini-value">${item.currentSpeed} km/h</span>
            </div>
            <div class="metric-mini">
              <span class="mini-label">Fluxo / Hora</span>
              <span class="mini-value">${item.flowRate} v/h</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="card-plate">${item.plateSample}</span>
            <button type="button" class="btn-details" data-detail-id="${item.id}">
              <span>Ver Detalhes</span>
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      `;

      fragment.appendChild(card);
    });

    DOM.cardsGrid.appendChild(fragment);
  }

  function atualizarCardsFavoritosUI() {
    const favButtons = DOM.cardsGrid.querySelectorAll('.btn-fav');
    favButtons.forEach(btn => {
      const id = btn.getAttribute('data-fav-id');
      const isFav = state.favorites.has(id);
      if (isFav) {
        btn.classList.add('favorited');
        btn.title = 'Remover dos Favoritos';
      } else {
        btn.classList.remove('favorited');
        btn.title = 'Adicionar aos Favoritos';
      }
    });
  }

  function exibirEstado(estado) {
    if (estado === 'loading') {
      DOM.loadingState.classList.remove('hidden');
      DOM.errorState.classList.add('hidden');
      DOM.cardsSection.classList.add('hidden');
      DOM.emptyState.classList.add('hidden');
    } else if (estado === 'error') {
      DOM.loadingState.classList.add('hidden');
      DOM.errorState.classList.remove('hidden');
      DOM.cardsSection.classList.add('hidden');
      DOM.emptyState.classList.add('hidden');
    } else {
      DOM.loadingState.classList.add('hidden');
      DOM.errorState.classList.add('hidden');
      DOM.cardsSection.classList.remove('hidden');
    }
  }

  // --------------------------------------------------------------------------
  // 10. MODAL DE DETALHES (ACESSIBILIDADE E TEMPO REAL)
  // --------------------------------------------------------------------------

  function abrirModalDetalhes(itemId) {
    const item = state.items.find(i => String(i.id) === String(itemId));
    if (!item) return;

    state.selectedItem = item;

    DOM.modalTitle.textContent = item.name;
    DOM.modalCategory.textContent = item.category;
    DOM.modalImage.src = item.thumbnail;
    DOM.modalImage.alt = item.name;

    DOM.modalStatusBadge.textContent = item.trafficStatus;
    DOM.modalStatusBadge.className = `badge-status ${item.trafficStatus}`;

    DOM.modalLocationText.textContent = item.location;
    DOM.modalDescription.textContent = item.description;

    DOM.modalSpeed.textContent = `${item.currentSpeed} km/h`;
    DOM.modalSpeedLimit.textContent = `${item.speedLimit} km/h`;
    DOM.modalFlow.textContent = `${item.flowRate} veículos/hora`;
    DOM.modalConfidence.textContent = `${item.confidence}%`;

    DOM.modalPlate.textContent = item.plateSample;
    DOM.modalCoords.textContent = item.coordinates;
    DOM.modalUpdate.textContent = item.lastUpdate;

    atualizarBotaoModalFav(item.id);

    DOM.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    DOM.closeModalBtn.focus();
  }

  function atualizarModalEmTempoReal(item) {
    state.selectedItem = item;
    DOM.modalStatusBadge.textContent = item.trafficStatus;
    DOM.modalStatusBadge.className = `badge-status ${item.trafficStatus}`;
    DOM.modalSpeed.textContent = `${item.currentSpeed} km/h`;
    DOM.modalFlow.textContent = `${item.flowRate} veículos/hora`;
    DOM.modalUpdate.textContent = item.lastUpdate;
  }

  function fecharModalDetalhes() {
    DOM.modal.classList.add('hidden');
    document.body.style.overflow = '';
    state.selectedItem = null;
  }

  function atualizarBotaoModalFav(itemId) {
    const isFav = state.favorites.has(String(itemId));
    const favText = DOM.modalFavBtn.querySelector('.fav-text');

    if (isFav) {
      DOM.modalFavBtn.classList.add('favorited');
      favText.textContent = 'Remover dos Favoritos ★';
    } else {
      DOM.modalFavBtn.classList.remove('favorited');
      favText.textContent = 'Adicionar aos Favoritos ☆';
    }
  }

  // --------------------------------------------------------------------------
  // 11. TOAST NOTIFICATION NATIVO
  // --------------------------------------------------------------------------
  let toastTimer = null;

  function exibirToast(mensagem) {
    if (toastTimer) clearTimeout(toastTimer);

    DOM.toastMessage.textContent = mensagem;
    DOM.toast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      DOM.toast.classList.add('hidden');
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // 12. REGISTRO DE EVENTOS (EVENT LISTENERS)
  // --------------------------------------------------------------------------
  function registrarEventos() {

    // Botão "Atualizar" - Simula e recalcula métricas de tráfego em tempo real
    DOM.refreshBtn.addEventListener('click', () => {
      simularAtualizacaoTrafego(true);
    });

    // Pesquisa em tempo real com debounce
    DOM.searchInput.addEventListener('input', debounce((e) => {
      state.searchTerm = e.target.value;
      if (state.searchTerm.length > 0) {
        DOM.clearSearchBtn.classList.remove('hidden');
      } else {
        DOM.clearSearchBtn.classList.add('hidden');
      }
      aplicarFiltrosEBusca();
    }, 220));

    // Limpar campo de pesquisa
    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.searchTerm = '';
      DOM.clearSearchBtn.classList.add('hidden');
      DOM.searchInput.focus();
      aplicarFiltrosEBusca();
    });

    // Filtros de Status e Favoritos
    DOM.filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        state.activeFilter = chip.getAttribute('data-filter');
        aplicarFiltrosEBusca();
      });
    });

    // Seletor de Ordenação
    DOM.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      aplicarFiltrosEBusca();
    });

    // Delegação de eventos nos Cards (Favoritar ou Detalhes)
    DOM.cardsGrid.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.btn-fav');
      if (favBtn) {
        e.stopPropagation();
        const id = favBtn.getAttribute('data-fav-id');
        alternarFavorito(id);
        return;
      }

      const detailBtn = e.target.closest('.btn-details');
      if (detailBtn) {
        const id = detailBtn.getAttribute('data-detail-id');
        abrirModalDetalhes(id);
        return;
      }

      const card = e.target.closest('.traffic-card');
      if (card) {
        const id = card.getAttribute('data-id');
        abrirModalDetalhes(id);
      }
    });

    // Eventos de Fechamento do Modal
    DOM.closeModalBtn.addEventListener('click', fecharModalDetalhes);
    DOM.modalCloseAction.addEventListener('click', fecharModalDetalhes);

    DOM.modal.addEventListener('click', (e) => {
      if (e.target === DOM.modal) {
        fecharModalDetalhes();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !DOM.modal.classList.contains('hidden')) {
        fecharModalDetalhes();
      }
    });

    DOM.modalFavBtn.addEventListener('click', () => {
      if (state.selectedItem) {
        alternarFavorito(state.selectedItem.id);
      }
    });

    // Botões de Recuperação de Erro
    DOM.retryBtn.addEventListener('click', () => {
      carregarDadosTrafego(false);
    });

    DOM.fallbackDataBtn.addEventListener('click', () => {
      carregarDadosTrafego(true);
    });

    // Botão Limpar Filtros do Estado Vazio
    DOM.resetFiltersBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.searchTerm = '';
      DOM.clearSearchBtn.classList.add('hidden');
      state.activeFilter = 'all';

      DOM.filterChips.forEach(chip => {
        if (chip.getAttribute('data-filter') === 'all') {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });

      aplicarFiltrosEBusca();
    });
  }

  // --------------------------------------------------------------------------
  // 13. INICIALIZAÇÃO DA APLICAÇÃO (BOOTSTRAP)
  // --------------------------------------------------------------------------
  function iniciar() {
    carregarFavoritosLocalStorage();
    registrarEventos();
    carregarDadosTrafego();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();
