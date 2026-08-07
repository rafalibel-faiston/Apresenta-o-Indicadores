import { Slide } from '../types';

export const slidesData: Slide[] = [
  {
    id: "capa",
    number: 1,
    title: "faiston",
    subtitle: "INSPIRAR POR MEIO DA TECNOLOGIA",
    category: "cover",
    content: {
      slogan: "Evoluindo junto com nossos clientes",
      year: "2026",
      department: "LOGÍSTICA & SEGUROS"
    }
  },
  {
    id: "correios",
    number: 2,
    title: "Expedições Correios",
    subtitle: "Consolidado por projeto - Custos, embarques e equipamentos (AGO.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 10817.67, type: "currency", isHighlight: true },
        { label: "Total Embarques", value: 149, type: "number" },
        { label: "Equipamentos", value: 149, type: "number" },
        { label: "Custo Médio", value: 72.60, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: NTT – R$ 3.952,86" },
        { type: "success", text: "Menor custo: T-SYSTEMS – R$ 46,93" }
      ],
      projects: [
        { project: "NTT", cost: 3952.86, shipments: 51, equipments: 51, averageCost: 77.51 },
        { project: "ITAÚ", cost: 2044.82, shipments: 45, equipments: 45, averageCost: 45.44 },
        { project: "VIVO VITA", cost: 1998.79, shipments: 28, equipments: 28, averageCost: 71.39 },
        { project: "ZAMP", cost: 820.32, shipments: 7, equipments: 7, averageCost: 117.19 },
        { project: "TELCOWEB", cost: 743.86, shipments: 7, equipments: 7, averageCost: 106.27 },
        { project: "ANIVERSARIANTES FAISTON", cost: 380.97 },
        { project: "OPEX", cost: 259.04 },
        { project: "KLABIN", cost: 186.23, shipments: 2, equipments: 2, averageCost: 93.12 },
        { project: "BEMOBI", cost: 142.77, shipments: 4, equipments: 4, averageCost: 35.69 },
        { project: "HPE", cost: 91.73, shipments: 2, equipments: 2, averageCost: 45.87 },
        { project: "C&A", cost: 86.05, shipments: 1, equipments: 1, averageCost: 86.05 },
        { project: "ALLCARE", cost: 63.30, shipments: 1, equipments: 1, averageCost: 63.30 },
        { project: "T-SYSTEMS", cost: 46.93, shipments: 1, equipments: 1, averageCost: 46.93 }
      ]
    }
  },
  {
    id: "transportadoras",
    number: 3,
    title: "Expedições Transportadoras",
    subtitle: "Custo consolidado por projeto (AGO.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 15623.55, type: "currency", isHighlight: true },
        { label: "Notas Fiscais / Embarques", value: 58, type: "number" },
        { label: "Equipamentos", value: 150, type: "number" }
      ],
      distribution: [
        { name: "RED CARGAS", value: 9670.61, percentage: 61.90, color: "from-emerald-500 to-teal-500" },
        { name: "SCALT", value: 5575.18, percentage: 35.68, color: "from-purple-500 to-pink-500" },
        { name: "BESTLOG", value: 377.76, percentage: 2.42, color: "from-indigo-500 to-violet-500" }
      ],
      projects: [
        { project: "NTT", cost: 10281.98, shipments: 38, equipments: 92, averageCost: 270.58 },
        { project: "ICARROS", cost: 2164.55, shipments: 9, equipments: 11, averageCost: 240.51 },
        { project: "ZAMP", cost: 1991.05, shipments: 3, equipments: 3, averageCost: 663.68 },
        { project: "FLEURY", cost: 280.56, shipments: 2, equipments: 27, averageCost: 140.28 },
        { project: "HABRAS", cost: 250.00, shipments: 1, equipments: 10, averageCost: 250.00 },
        { project: "ALLCARE", cost: 243.93, shipments: 2, equipments: 3, averageCost: 121.97 },
        { project: "ENSONO", cost: 151.83, shipments: 1, equipments: 2, averageCost: 151.83 },
        { project: "TELCOWEB", cost: 139.12, shipments: 1, equipments: 1, averageCost: 139.12 },
        { project: "METODO", cost: 120.53, shipments: 1, equipments: 1, averageCost: 120.53 }
      ],
      commentary: [
        { type: "info", text: "NTT e ICARROS somam R$ 12.446,53 (79,7% do custo consolidado)." },
        { type: "link", text: "NTT concentra 92 dos 150 equipamentos transportados." }
      ]
    }
  },
  {
    id: "cia-aerea",
    number: 4,
    title: "Expedições Cia Aérea",
    subtitle: "Consolidado GOL - Custo total e equipamentos (AGO.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 2078.42, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 13, type: "number" },
        { label: "Custo Médio / Equip.", value: 159.88, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: NTT – R$ 864,96" },
        { type: "success", text: "Menor custo: BEMOBI – R$ 59,71" }
      ],
      projects: [
        { project: "NTT", cost: 864.96, equipments: 3, averageCost: 288.32 },
        { project: "HPE", cost: 570.58, equipments: 7, averageCost: 81.51 },
        { project: "CEUB", cost: 502.97, equipments: 1, averageCost: 502.97 },
        { project: "VIVO VITA", cost: 80.20, equipments: 1, averageCost: 80.20 },
        { project: "BEMOBI", cost: 59.71, equipments: 1, averageCost: 59.71 }
      ]
    }
  },
  {
    id: "courier",
    number: 5,
    title: "Expedições Courier",
    subtitle: "Consolidado LOGGI - Custos, embarques e equipamentos (AGO.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 2478.69, type: "currency", isHighlight: true },
        { label: "Nº de Embarques", value: 28, type: "number" },
        { label: "Qtd. Equipamentos", value: 28, type: "number" },
        { label: "Custo Médio / Emb.", value: 88.52, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: HPE – R$ 828,01 (9 equipamentos)" },
        { type: "success", text: "Menor custo: VIVO VITA – R$ 84,83 (1 equipamento)" }
      ],
      projects: [
        { project: "HPE", cost: 828.01, shipments: 9, equipments: 9, averageCost: 92.00 },
        { project: "BEMOBI", cost: 337.95, shipments: 3, equipments: 3, averageCost: 112.65 },
        { project: "TELCOWEB", cost: 311.32, shipments: 4, equipments: 4, averageCost: 77.83 },
        { project: "OPEX", cost: 244.21, shipments: 5, equipments: 5, averageCost: 48.84 },
        { project: "NTT", cost: 227.16, shipments: 2, equipments: 2, averageCost: 113.58 },
        { project: "CEUB", cost: 190.33, shipments: 2, equipments: 2, averageCost: 95.17 },
        { project: "T-SYSTEMS", cost: 149.69, shipments: 1, equipments: 1, averageCost: 149.69 },
        { project: "METSO", cost: 105.19, shipments: 1, equipments: 1, averageCost: 105.19 },
        { project: "VIVO VITA", cost: 84.83, shipments: 1, equipments: 1, averageCost: 84.83 }
      ]
    }
  },
  {
    id: "dedicados",
    number: 6,
    title: "Expedições Dedicados",
    subtitle: "Consolidado por projeto e rota (AGO.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 4970.00, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 176, type: "number" }
      ],
      commentary: [
        { type: "info", text: "Maior custo de rota: CASARINI – R$ 2.120,00" },
        { type: "success", text: "Custo por projetos: ZAMP lidera com R$ 2.820,00 (134 equipamentos)" }
      ],
      rotas: [
        { transportadora: "CASARINI", total: 2120.00, breakdown: [{ project: "NTT", val: 1050.00 }, { project: "ZAMP", val: 1070.00 }] },
        { transportadora: "SEVERINO", total: 790.00, breakdown: [{ project: "NTT", val: 240.00 }, { project: "ZAMP", val: 550.00 }] },
        { transportadora: "THOMÉ", total: 760.00, breakdown: [{ project: "ZAMP", val: 600.00 }, { project: "FLEURY", val: 160.00 }] },
        { transportadora: "WASHINGTON", total: 750.00, breakdown: [{ project: "NTT", val: 150.00 }, { project: "ZAMP", val: 600.00 }] },
        { transportadora: "ERIC LIBEL", total: 550.00, breakdown: [{ project: "NTT", val: 300.00 }, { project: "T-SYSTEMS", val: 250.00 }] }
      ],
      projects: [
        { project: "ZAMP", cost: 2820.00, equipments: 134 },
        { project: "NTT", cost: 1740.00, equipments: 40 },
        { project: "T-SYSTEMS", cost: 250.00, equipments: 1 },
        { project: "FLEURY", cost: 160.00, equipments: 1 }
      ]
    }
  },
  {
    id: "self-storage",
    number: 7,
    title: "Custo mensal Self Storage",
    subtitle: "Valores consolidados por UF para projeto NTT (AGO.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 1147.81, type: "currency", isHighlight: true },
        { label: "Projeto Atendido", value: "NTT", type: "text" },
        { label: "Regiões", value: 3, type: "number" }
      ],
      commentary: [
        { type: "info", text: "Operação PE e PR: Dedicados à armazenagem e movimentação exclusiva de NTT." },
        { type: "info", text: "Operação DF: Atuação direta com equipe NTT e gestão local de spare parts." }
      ],
      regions: [
        { uf: "PE", project: "NTT", cost: 446.76, text: "Estrutura dedicada em Recife" },
        { uf: "DF", project: "NTT", cost: 446.69, text: "Atuação com NTT e gestão de armazenagem" },
        { uf: "PR", project: "NTT", cost: 254.36, text: "Incentivo e operação exclusivas" }
      ]
    }
  },
  {
    id: "custo-consolidado",
    number: 8,
    title: "Custo Consolidado Logística",
    subtitle: "Resumo e distribuição geral por modalidade (AGO.26)",
    category: "financials",
    content: {
      kpis: [
        { label: "Custo Logístico Total", value: 37116.14, type: "currency", isHighlight: true }
      ],
      breakdown: [
        { category: "Transportadora", val: 15623.55, share: 42.09, color: "#6366f1" },
        { category: "Correios", val: 10817.67, share: 29.15, color: "#8b5cf6" },
        { category: "Dedicados", val: 4970.00, share: 13.39, color: "#ec4899" },
        { category: "Courier (Loggi)", val: 2478.69, share: 6.68, color: "#06b6d4" },
        { category: "Cia Aérea", val: 2078.42, share: 5.60, color: "#3b82f6" },
        { category: "Self Storage", val: 1147.81, share: 3.09, color: "#10b981" }
      ],
      projects: [
        { name: "NTT", value: 18214.77 },
        { name: "ZAMP", value: 5631.37 },
        { name: "ICARROS", value: 2164.55 },
        { name: "VIVO VITA", value: 2163.82 },
        { name: "ITAÚ", value: 2044.82 },
        { name: "HPE", value: 1490.32 },
        { name: "TELCOWEB", value: 1194.30 },
        { name: "CEUB", value: 693.30 },
        { name: "BEMOBI", value: 540.43 },
        { name: "OPEX", value: 503.25 },
        { name: "T-SYSTEMS", value: 446.62 },
        { name: "FLEURY", value: 440.56 },
        { name: "Aniversariantes Faiston", value: 380.97 },
        { name: "ALLCARE", value: 307.23 },
        { name: "HABRAS", value: 250.00 },
        { name: "KLABIN", value: 186.23 },
        { name: "ENSONO", value: 151.83 },
        { name: "METODO", value: 120.53 },
        { name: "METSO", value: 105.19 },
        { name: "C&A", value: 86.05 }
      ]
    }
  },
  {
    id: "entrada-saida",
    number: 9,
    title: "Consolidado Entrada e Saída",
    subtitle: "Movimentação física de Notas Fiscais e equipamentos comercializados (AGO.26)",
    category: "operations",
    content: {
      entrada: {
        title: "NF Entrada",
        nfs: 8,
        equipments: 176,
        value: 1869644.00,
        details: [
          { client: "NTT", qty: 164, value: 1813666.64 },
          { client: "HABRAS", qty: 11, value: 49500.00 },
          { client: "METODO", qty: 1, value: 6477.36 }
        ]
      },
      saida: {
        title: "NF Saída",
        nfs: 96,
        equipments: 289,
        value: 1357476.82,
        details: [
          { client: "NTT", qty: 53 },
          { client: "HPE", qty: 18 },
          { client: "VITA", qty: 4 },
          { client: "BEMOBI", qty: 4 },
          { client: "TELCOWEB", qty: 6 },
          { client: "ZAMP", qty: 3 },
          { client: "ALL CARE", qty: 2 },
          { client: "FLEURY", qty: 2 },
          { client: "CEUB", qty: 1 },
          { client: "HABRAS", qty: 1 },
          { client: "METODO", qty: 1 },
          { client: "T SYSTEMS", qty: 1 }
        ]
      }
    }
  },
  {
    id: "estoque-atual",
    number: 10,
    title: "Estoque Atual",
    subtitle: "Valor patrimonial de mercadorias custodiadas por categoria (AGO.26)",
    category: "operations",
    content: {
      total: 45276955.17,
      groups: [
        { name: "Estoque com NF", value: 36777137.06, percentage: 81.23, color: "bg-[#0054ec]" },
        { name: "Estoque sem NF", value: 5129327.17, percentage: 11.33, color: "bg-[#fd11a4]" },
        { name: "Guarda de Técnico", value: 795396.32, percentage: 1.76, color: "bg-[#9b1dbf]" },
        { name: "Ativos e Outros", value: 2575094.62, percentage: 5.69, color: "bg-[#fd5665]" }
      ],
      guardaTecnica: [
        { client: "NTT", qty: 85, value: 449775.80 },
        { client: "ARCOS DOURADOS", qty: 106, value: 345620.52 }
      ],
      ativosOutros: [
        { name: "Ativos Fixos Faiston", value: 1275094.62, desc: "Equipamentos e infraestrutura própria" },
        { name: "Outros e Reservas", value: 1300000.00, desc: "Reservas operacionais e itens diversos" }
      ],
      semNf: [
        { client: "NTT_TRAG", qty: 862, value: 4561255.76 },
        { client: "ARCOS DOURADOS REVERSA", qty: 498, value: 498000.00 },
        { client: "ARCOS DOURADOS RMA", qty: 49, value: 70071.41 }
      ],
      topProjectsWithNF: [
        { project: "NTT_SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 12633285.31, itemQty: 332 },
        { project: "PROJETO F240242 - Evotech Fase 2", value: 5556029.56, itemQty: 257 },
        { project: "NTT_GESTÃO DE SPARE - IS20405", value: 3827786.71, itemQty: 155 },
        { project: "NTT - INSTALAÇÃO DE 48 SWITCHES E 180 APS", value: 3033525.00, itemQty: 490 },
        { project: "NTT_INSTALAÇÃO 614 ANTENAS - F250727", value: 1820535.71, itemQty: 287 },
        { project: "NTT_TBRA", value: 1432863.60, itemQty: 151 },
        { project: "NTT_SUSTENTAÇÃO DE 610 EQUIPAMENTOS - F231369", value: 1031936.00, itemQty: 149 },
        { project: "NTT_INSTALAÇÃO DE 1793 DE SWITCH - F231490", value: 819637.20, itemQty: 138 },
        { project: "NTT_SUSTENTAÇÃO 9000 SW - F221082", value: 734113.25, itemQty: 124 },
        { project: "NTT - SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 664680.82, itemQty: 10 },
        { project: "NTT_IMPLANTAÇÃO 9000 SW - F221082", value: 531230.01, itemQty: 85 },
        { project: "NTT_SUSTENTAÇÃO F5", value: 359379.28, itemQty: 8 },
        { project: "NTT_INSTALAÇÃO DE 550 SWITCH - F221082", value: 347947.37, itemQty: 257 },
        { project: "FAISTON", value: 235500.83, itemQty: 46 },
        { project: "NTT_INSTALAÇÃO 300 CPE SDWAN - IS211010", value: 204459.19, itemQty: 39 },
        { project: "NTT_INSTALAÇÃO 1700 SW - IS21667", value: 177652.84, itemQty: 29 },
        { project: "NTT_USP BREAK AND FIX - F231346", value: 122795.30, itemQty: 16 },
        { project: "ITAÚ", value: 122765.00, itemQty: 136 },
        { project: "VITA", value: 76486.03, itemQty: 15 },
        { project: "NTT_CHESF BREAK AND FIX - IS20652", value: 74756.08, itemQty: 7 },
        { project: "NTT_SUSTENTACAO 300 CPE SDWAN - IS211010", value: 68789.24, itemQty: 13 },
        { project: "NTT_SUSTENTAÇÃO DE 124 AP - F221082", value: 67785.92, itemQty: 16 },
        { project: "SPARE ITEMS - MPLS do cliente Banco Bradesco", value: 47968.74, itemQty: 16 },
        { project: "SDwan_250", value: 40080.70, itemQty: 22 },
        { project: "TELCOWEB", value: 24750.00, itemQty: 11 },
        { project: "ENSONO", value: 24290.79, itemQty: 7 },
        { project: "SIMPAR", value: 23960.00, itemQty: 17 },
        { project: "FLEURY", value: 21786.20, itemQty: 4 },
        { project: "MÉTODO", value: 20250.16, itemQty: 4 },
        { project: "NTT_SUPORTE 1700 SW - IS21776", value: 18377.88, itemQty: 3 },
        { project: "ARCOS DOURADOS", value: 12923.06, itemQty: 4 },
        { project: "NTT_BREAK FIX - F260189", value: 10840.80, itemQty: 3 },
        { project: "ALLCARE", value: 10399.66, itemQty: 25 },
        { project: "CONECT", value: 2474.20, itemQty: 1 }
      ]
    }
  },
  {
    id: "descarte-sustentavel",
    number: 11,
    title: "Descarte Sustentável Salien",
    subtitle: "Reciclagem e desfazimento ecológico de ativos eletrônicos",
    category: "operations",
    content: {
      kpis: [
        { label: "Qtd. Total Descartada", value: 11339, type: "number" },
        { label: "Receita Líquida Lotes", value: 12050.00, type: "currency", isHighlight: true }
      ],
      lotes: [
        { name: "Lote 1", qty: 420, value: 1100.00, desc: "HDs, Notebooks, Fontes, Cabos, Fãs" },
        { name: "Lote 2", qty: 334, value: 820.00, desc: "CPUs, Monitores, Ventiladores, Placas" },
        { name: "Lote 3", qty: 608, value: 2300.00, desc: "Servidores, Placas, Cabos, Baterias" },
        { name: "Lote 4", qty: 4924, value: 2500.00, desc: "Fontes, Carcaças de SW, HDs, Cabos" },
        { name: "Lote 5", qty: 4085, value: 3000.00, desc: "Roteadores, Switches, Módulos, Antenas" },
        { name: "Lote 7", qty: 114, value: 980.00, desc: "TVs, HDs, Notebooks, Máq. de Cartão" },
        { name: "Lote 8", qty: 6, value: 350.00, desc: "Switches Cisco/Juniper, Servidor HP, Riverbed" },
        { name: "Lote 9", qty: 815, value: 450.00, desc: "Ferros, Cabos, TV, Monitor" },
        { name: "Lote 10", qty: 33, value: 550.00, desc: "Notebooks Diversos, Desktops Dell Optiplex 7050" }
      ]
    }
  },
  {
    id: "laboratorio-tecnico",
    number: 12,
    title: "Laboratório Técnico",
    subtitle: "Reparos e manutenções de equipamentos — Julho/26 (29/06 a 30/07)",
    category: "operations",
    content: {
      kpis: [
        { label: "Chamados Atendidos", value: 41, type: "number" },
        { label: "Equipamentos Reparados", value: 28, type: "number", isHighlight: true },
        { label: "Em Análise / Pendente", value: 13, type: "number" }
      ],
      categorias: [
        {
          name: "Redes NTT — Switches & APs",
          total: 21,
          reparados: 19,
          pendentes: 2,
          desc: "13 APs Cisco CW9166I-ROW preparados para configuração e 6 switches C9200L-24P zerados/testados; 2 switches com falha de inicialização (TAM Init Failed) sem conserto."
        },
        {
          name: "Notebooks & Equip. Corporativos",
          total: 16,
          reparados: 9,
          pendentes: 7,
          desc: "Trocas de tela, dobradiças, bases com teclado, fonte reparada e upgrade de memória; pendências aguardando orçamento (HP 250 G8 não aprovado, Lenovo V14 G2 em análise externa)."
        },
        {
          name: "Impressoras Zebra (T-Systems)",
          total: 2,
          reparados: 0,
          pendentes: 2,
          desc: "2 impressoras ZT510 em análise, aguardando peças (rolete, correia e pezinhos da cabeça de impressão)."
        },
        {
          name: "Equipamentos de Clientes (Icarros)",
          total: 2,
          reparados: 0,
          pendentes: 2,
          desc: "MacBook A1398 com bateria estufada e Dell G7 7588 com bateria incompatível, ambos aguardando peça/orçamento."
        }
      ]
    }
  },
  {
    id: "todo-gerencial",
    number: 13,
    title: "Controle de Saving - Logistica",
    subtitle: "Saving mensal, utilizado e projeção anual (AGO.26)",
    category: "financials",
    content: {
      totalSaving: 41820.98,
      totalUtilizado: 21328.93,
      saldoSaving: 20492.05,
      savingItems: [
        { item: 1, desc: "Descarte sustentável - Lotes 1, 2 e 3", qty: 1362, value: 4220.00, utilizado: true },
        { item: 2, desc: "Descarte sustentável - Lotes 4 e 5", qty: 9009, value: 5550.00, utilizado: true },
        { item: 3, desc: "Redução Notebook Método", qty: 51, value: 5212.80, obs: "Cancelamento do seguro" },
        { item: 4, desc: "Ajuste rateio condomínio 280", qty: 4, value: 5148.99, obs: "Redução de HC — água, luz" },
        { item: 5, desc: "Redução Notebook ALLCARE e ENSONO", qty: 137, value: 10617.85, obs: "Cancelamento do seguro" },
        { item: 6, desc: "Venda de 5 TVs", qty: 5, value: 4000.00 },
        { item: 7, desc: "Descarte sustentável - Lote 6", qty: 52, value: 3000.00 },
        { item: 8, desc: "Descarte sustentável - Lote 7", qty: 114, value: 980.00 },
        { item: 9, desc: "Renovação Tiflux", qty: null, value: 1741.34 },
        { item: 10, desc: "Descarte sustentável - Lote 8", qty: 6, value: 350.00 },
        { item: 11, desc: "Descarte sustentável - Lote 9", qty: null, value: 450.00 },
        { item: 12, desc: "Descarte sustentável - Lote 10", qty: 33, value: 550.00 }
      ],
      utilizadoItems: [
        { desc: "Identidade Visual", value: 5217.93 },
        { desc: "Manutenção AR - Data center", value: 1600.00 },
        { desc: "Visual Set IA - Tarifação", value: 1200.00 },
        { desc: "Geladeira", value: 1788.00 },
        { desc: "Manutenção tomadas Financeiro", value: 55.00 },
        { desc: "Movimentação máquina de café p/ 280", value: 80.00 },
        { desc: "Roubo Notebook - Método", value: 7449.00 },
        { desc: "Visual Set IA - Rastreabilidade", value: 2240.00 },
        { desc: "Treinamento Empilhadeira - Logística", value: 1699.00 }
      ],
      savingAnual: [
        { item: 3, desc: "Redução Notebook Método", mensal: 5212.80, anual: 62553.60 },
        { item: 4, desc: "Ajuste rateio condomínio 280", mensal: 5148.99, anual: 61787.88 },
        { item: 5, desc: "Redução Notebook ALLCARE e ENSONO", mensal: 10617.85, anual: 127414.20 },
        { item: 9, desc: "Renovação Tiflux", mensal: 1741.34, anual: 20896.08 }
      ]
    }
  },
  {
    id: "divisor-seguros",
    number: 14,
    title: "DEPARTAMENTO DE SEGUROS",
    subtitle: "Gestão de Riscos, Apólices e Garantia Patrimonial",
    category: "divider",
    content: {
      totalProtected: 48861060.26,
      monthlyBillingCost: 54093.45,
      activePolicies: 7
    }
  },
  {
    id: "seguros-patrimonial",
    number: 15,
    title: "Garantia Patrimonial de Estoque",
    subtitle: "Estrutura securitária regular e estoque em transição fiscal",
    category: "insurance",
    content: {
      kpis: [
        { label: "Valor Patrimonial Acumulado", value: 41906464.23, type: "currency", isHighlight: true },
        { label: "Custo Mensal da Apólice", value: 32910.57, type: "currency" },
        { label: "Limite de Cobertura Base", value: 45000000.00, type: "currency" }
      ],
      coberturas: [
        { name: "Projetos Faiston", value: 34202042.44, share: 81.62 },
        { name: "Ativos Fixos Faiston", value: 1275094.62, share: 3.04 },
        { name: "Outros e Reservas", value: 1300000.00, share: 3.10 },
        { name: "Clientes Sem NF (NTT/Arcos)", value: 5129327.17, share: 12.24 }
      ],
      semNfBreakdown: [
        { name: "NTT_TRAG", qty: 862, value: 4561255.76 },
        { name: "Arcos Dourados Reversa", qty: 498, value: 498000.00 },
        { name: "Arcos Dourados RMA", qty: 49, value: 70071.41 }
      ],
      comentarios: [
        "A apólice cobre todos os equipamentos que entraram em nosso estoque físico até a devida saída regulamentada.",
        "Destaque: NTT representa o maior volume segurado em estoque regular (projetos).",
        "Ativos Fixos abrangem estruturas físicas corporativas: mobiliário de escritório e equipamentos técnicos.",
        "Em caso de sinistro extraordinário, as câmeras de CFTV são acionadas como exigência comprovatória contratual."
      ]
    }
  },
  {
    id: "seguros-extra",
    number: 16,
    title: "Seguros de Trânsito & Guarda Técnica",
    subtitle: "Proteção extraordinária de ativos e estoque em pontos satélites",
    category: "insurance",
    content: {
      sections: [
        {
          title: "Seguro Extra (Trânsito & Satélites)",
          totalValue: 6013455.95,
          monthlyCost: 16236.33,
          subItems: [
            { name: "Equipamentos em TRÂNSITO (Faiston)", value: 2733304.21, cost: 7379.92, rate: "0,27% a.m" },
            { name: "Guarda Técnica (Bases NTT / Arcos)", value: 3280151.74, cost: 8856.41, rate: "0,27% a.m" }
          ],
          desc: "Mitigação completa de perdas por extravio ou furto durante transferências ou estocagem temporária em hubs de terceiros."
        }
      ]
    }
  },
  {
    id: "seguros-trags",
    number: 17,
    title: "Seguro TRAGs e Arcos Dourados",
    subtitle: "Atuação em desativação e garantia de roubo local pós-entrega",
    category: "insurance",
    content: {
      sections: [
        {
          title: "Seguro de TRAGs (Reversa & Desativação)",
          totalValue: 253991.04,
          monthlyCost: 685.78,
          rate: "0,27% a.m",
          phases: [
            { client: "Fase 27", val: 253991.04, minCost: 685.78 }
          ],
          desc: "Cobertura de Responsabilidade Civil durante postagem e remessa de itens substituídos até a recepção física no estoque."
        },
        {
          title: "Seguro Arcos Dourados Instalação",
          totalValue: 343818.85,
          monthlyCost: 928.31,
          rate: "0,27% a.m",
          phases: [
            { client: "Unidades em Instalação", qty: 90, val: 343818.85 }
          ],
          desc: "Janela securitária estendida de 30 dias cobrindo roubo local em lojas recém-equipadas antes da homologação final do cliente."
        }
      ]
    }
  },
  {
    id: "seguros-satelite",
    number: 18,
    title: "Seguro Starlink & Medição",
    subtitle: "Antenas satelitais e calibradores",
    category: "insurance",
    content: {
      sections: [
        {
          title: "Antenas Operacionais STARLINK",
          totalValue: 238330.19,
          monthlyCost: 2859.96,
          rate: "1,20% a.m",
          desc: "Cobertura física integral contra avarias climáticas ou vandalismo operacional, com participação obrigatória estabilizada de 10% sobre sinistros.",
          apolices: [
            { name: "1ª Apólice", value: 82924.82, cost: 995.10 },
            { name: "2ª Apólice", value: 126689.46, cost: 1520.27 },
            { name: "3ª Apólice", value: 3988.64, cost: 47.86 },
            { name: "4ª Apólice", value: 2327.48, cost: 27.93 },
            { name: "5ª Apólice", value: 3347.99, cost: 40.18 },
            { name: "6ª Apólice", value: 2007.92, cost: 24.10 },
            { name: "7ª Apólice", value: 2789.82, cost: 33.48 },
            { name: "8ª Apólice", value: 1693.11, cost: 20.32 },
            { name: "9ª Apólice", value: 3812.39, cost: 45.75 },
            { name: "10ª Apólice", value: 5958.74, cost: 71.50 },
            { name: "11ª Apólice", value: 2789.82, cost: 33.48 }
          ]
        },
        {
          title: "Equipamento FLUKE Dedicado",
          totalValue: 105000.00,
          monthlyCost: 472.50,
          rate: "0,45% a.m",
          desc: "Garantia especial para calibradores condutivímetros portáteis de alta precisão cedidos sob regime de comodato ao parceiro T-Systems."
        }
      ]
    }
  },
  {
    id: "custo-fatura",
    number: 19,
    title: "Composição de Despesa de Faturas de Seguros",
    subtitle: "Conciliação mensal, endossos e ajustes de mensalidade (AGO.26)",
    category: "financials",
    content: {
      total: 55772.36,
      kpis: [
        { label: "Fatura Líquida Consolidada", value: 55772.36, type: "currency", isHighlight: true }
      ],
      invoiceItems: [
        { label: "Patrimonial", name: "Seguro Patrimonial", value: 32910.57, sub: "Estoque fixo" },
        { label: "Extra", name: "Seguro Extra / Guarda Técnica", value: 16121.17, sub: "Trânsito e bases satélites" },
        { label: "Arcos", name: "Arcos Dourados", value: 2067.42, sub: "Instalações" },
        { label: "Starlink", name: "Starlink", value: 1103.81, sub: "Antenas em campo" },
        { label: "Simpar", name: "Simpar", value: 684.54, sub: "Apólice dedicada Simpar" },
        { label: "Zamp", name: "Zamp", value: 208.15, sub: "Apólice dedicada Zamp" },
        { label: "Fluke", name: "Fluke", value: 430.97, sub: "Instrumentos de medição" },
        { label: "Opex", name: "Opex", value: 6029.80, sub: "Ajuste administrativo do mês" },
        { label: "Mensalidade", name: "Mensalidade", value: 35.00, sub: "Taxa fixa mensal" },
        { label: "Estorno", name: "Estorno", value: -3819.07, sub: "Crédito de conciliação", isCredit: true }
      ],
      comments: [
        "Conciliação fechou com faturas auditadas e prêmios aplicados por categoria, acumulando R$ 55.772,36 mensais para uma proteção do patrimônio Faiston.",
        "Fatura do mês inclui ajustes extraordinários: taxa Opex (R$ 6.029,80), mensalidade fixa (R$ 35,00) e estorno de crédito (-R$ 3.819,07).",
        "Diferenças identificadas entre as taxas aplicadas nas faturas físicas e as apólices digitais estão sob análise técnica."
      ]
    }
  },
  {
    id: "agradecimento",
    number: 20,
    title: "Obrigado!",
    subtitle: "Sempre evoluindo por meio de tecnologia e cooperação",
    category: "contact",
    content: {
      presenter: "Bruna Higa",
      role: "Gestão Securitária e Logística",
      contact: {
        phone: "+55 11 97632-9349",
        email: "bruna.higa@faiston.com",
        web: "faiston.com"
      }
    }
  }
];
