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
    subtitle: "Consolidado por projeto - Custos, embarques e equipamentos (JUN.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 8501.43, type: "currency", isHighlight: true },
        { label: "Total Embarques", value: 167, type: "number" },
        { label: "Equipamentos", value: 167, type: "number" },
        { label: "Custo Médio", value: 50.91, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: ZAMP – R$ 2.984,49" },
        { type: "success", text: "Menor custo: ACER – R$ 9,94" }
      ],
      projects: [
        { project: "ZAMP", cost: 2984.49, shipments: 35, equipments: 35, averageCost: 85.27 },
        { project: "NTT", cost: 2513.96, shipments: 33, equipments: 33, averageCost: 76.18 },
        { project: "ITAÚ", cost: 1625.70, shipments: 56, equipments: 56, averageCost: 29.03 },
        { project: "VIVO VITA", cost: 396.60, shipments: 11, equipments: 11, averageCost: 36.05 },
        { project: "KLABIN", cost: 337.47, shipments: 13, equipments: 13, averageCost: 25.96 },
        { project: "OPEX", cost: 211.42, shipments: 1, equipments: 1, averageCost: 211.42 },
        { project: "BEMOBI", cost: 141.47, shipments: 4, equipments: 4, averageCost: 35.37 },
        { project: "T-SYSTEMS", cost: 83.77, shipments: 6, equipments: 6, averageCost: 13.96 },
        { project: "TELCOWEB", cost: 64.67, shipments: 2, equipments: 2, averageCost: 32.34 },
        { project: "ANIVERSARIANTES FAISTON", cost: 58.67, shipments: 1, equipments: 1, averageCost: 58.67 },
        { project: "MONTADORA VW", cost: 48.73, shipments: 3, equipments: 3, averageCost: 16.24 },
        { project: "CEUB", cost: 24.54, shipments: 1, equipments: 1, averageCost: 24.54 },
        { project: "ACER", cost: 9.94, shipments: 1, equipments: 1, averageCost: 9.94 }
      ]
    }
  },
  {
    id: "transportadoras",
    number: 3,
    title: "Expedições Transportadoras",
    subtitle: "Custo consolidado por projeto (JUN.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 38135.50, type: "currency", isHighlight: true },
        { label: "Notas Fiscais / Embarques", value: 36, type: "number" },
        { label: "Equipamentos", value: 304, type: "number" }
      ],
      distribution: [
        { name: "BESTLOG", value: 15011.77, percentage: 39.36, color: "from-indigo-500 to-violet-500" },
        { name: "TEKLOG", value: 10000.00, percentage: 26.22, color: "from-blue-500 to-cyan-500" },
        { name: "RED CARGAS", value: 8111.98, percentage: 21.27, color: "from-emerald-500 to-teal-500" },
        { name: "SCALT", value: 5011.75, percentage: 13.14, color: "from-purple-500 to-pink-500" }
      ],
      projects: [
        { project: "NTT", cost: 23989.05, shipments: 23, equipments: 182, averageCost: 1043.00 },
        { project: "ZAMP", cost: 9311.88, shipments: 4, equipments: 91, averageCost: 2327.97 },
        { project: "ICARROS", cost: 1843.47, shipments: 1, equipments: 8, averageCost: 1843.47 },
        { project: "ALLCARE", cost: 651.79, shipments: 3, equipments: 3, averageCost: 217.26 },
        { project: "METODO", cost: 644.29, shipments: 1, equipments: 2, averageCost: 644.29 },
        { project: "VIVO VITA", cost: 590.68, shipments: 1, equipments: 8, averageCost: 590.68 },
        { project: "FLEURY", cost: 419.74, shipments: 1, equipments: 8, averageCost: 419.74 },
        { project: "MATRIZ TRANSPORTES", cost: 367.32, shipments: 1, equipments: 1, averageCost: 367.32 },
        { project: "NAVEGACAO GUARITA", cost: 317.28, shipments: 1, equipments: 1, averageCost: 317.28 }
      ],
      commentary: [
        { type: "info", text: "NTT e ZAMP somam R$ 33.300,93 (87,3% do custo consolidado)." },
        { type: "link", text: "NTT concentra 182 dos 304 equipamentos transportados." }
      ]
    }
  },
  {
    id: "cia-aerea",
    number: 4,
    title: "Expedições Cia Aérea",
    subtitle: "Consolidado GOL - Custo total e equipamentos (JUN.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 2060.95, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 9, type: "number" },
        { label: "Custo Médio / Equip.", value: 228.99, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: C&A – R$ 1.504,81" },
        { type: "success", text: "Menor custo: CEUB – R$ 84,16" }
      ],
      projects: [
        { project: "C&A", cost: 1504.81, equipments: 3, averageCost: 501.60 },
        { project: "BEMOBI", cost: 186.16, equipments: 1, averageCost: 186.16 },
        { project: "HPE", cost: 157.35, equipments: 2, averageCost: 78.68 },
        { project: "VIVO VITA", cost: 128.47, equipments: 2, averageCost: 64.24 },
        { project: "CEUB", cost: 84.16, equipments: 1, averageCost: 84.16 }
      ]
    }
  },
  {
    id: "courier",
    number: 5,
    title: "Expedições Courier",
    subtitle: "Consolidado LOGGI - Custos, embarques e equipamentos (JUN.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 3633.68, type: "currency", isHighlight: true },
        { label: "Nº de Embarques", value: 42, type: "number" },
        { label: "Qtd. Equipamentos", value: 42, type: "number" },
        { label: "Custo Médio / Emb.", value: 86.52, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: HPE – R$ 769,85 (8 equipamentos)" },
        { type: "success", text: "Menor custo: SIMPAR – R$ 68,82 (1 equipamento)" }
      ],
      projects: [
        { project: "HPE", cost: 769.85, shipments: 8, equipments: 8, averageCost: 96.23 },
        { project: "BEMOBI", cost: 701.24, shipments: 6, equipments: 6, averageCost: 116.87 },
        { project: "T-SYSTEMS", cost: 541.91, shipments: 5, equipments: 5, averageCost: 108.38 },
        { project: "OPEX", cost: 410.16, shipments: 7, equipments: 7, averageCost: 58.59 },
        { project: "ZAMP", cost: 272.81, shipments: 3, equipments: 3, averageCost: 90.94 },
        { project: "C&A", cost: 233.63, shipments: 3, equipments: 3, averageCost: 77.88 },
        { project: "VIVO VITA", cost: 225.46, shipments: 2, equipments: 2, averageCost: 112.73 },
        { project: "TELCOWEB", cost: 225.12, shipments: 5, equipments: 5, averageCost: 45.02 },
        { project: "ICARROS", cost: 107.98, shipments: 1, equipments: 1, averageCost: 107.98 },
        { project: "NTT", cost: 76.70, shipments: 1, equipments: 1, averageCost: 76.70 },
        { project: "SIMPAR", cost: 68.82, shipments: 1, equipments: 1, averageCost: 68.82 }
      ]
    }
  },
  {
    id: "dedicados",
    number: 6,
    title: "Expedições Dedicados",
    subtitle: "Consolidado por projeto e rota (JUN.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 4020.00, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 14, type: "number" }
      ],
      commentary: [
        { type: "info", text: "Maior custo de rota: CASARINI – R$ 2.450,00" },
        { type: "success", text: "Custo por projetos: NTT lidera com R$ 1.550,00 (6 equipamentos)" }
      ],
      rotas: [
        { transportadora: "CASARINI", total: 2450.00, breakdown: [{ project: "NTT", val: 1200.00 }, { project: "ZAMP", val: 500.00 }, { project: "T-SYSTEMS", val: 500.00 }, { project: "TELCOWEB", val: 250.00 }] },
        { transportadora: "WASHINGTON", total: 950.00, breakdown: [{ project: "ZAMP", val: 550.00 }, { project: "NTT", val: 350.00 }, { project: "T-SYSTEMS", val: 50.00 }] },
        { transportadora: "SEVERINO", total: 620.00, breakdown: [{ project: "OPEX", val: 620.00 }] }
      ],
      projects: [
        { project: "NTT", cost: 1550.00, equipments: 6 },
        { project: "ZAMP", cost: 1050.00, equipments: 3 },
        { project: "T-SYSTEMS", cost: 550.00, equipments: 3 },
        { project: "OPEX", cost: 620.00, equipments: 1 },
        { project: "TELCOWEB", cost: 250.00, equipments: 1 }
      ]
    }
  },
  {
    id: "self-storage",
    number: 7,
    title: "Custo mensal Self Storage",
    subtitle: "Valores consolidados por UF para projeto NTT (JUN.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 1139.27, type: "currency", isHighlight: true },
        { label: "Projeto Atendido", value: "NTT", type: "text" },
        { label: "Regiões", value: 3, type: "number" }
      ],
      commentary: [
        { type: "info", text: "Operação PE e PR: Dedicados à armazenagem e movimentação exclusiva de NTT." },
        { type: "info", text: "Operação DF: Atuação direta com equipe NTT e gestão local de spare parts." }
      ],
      regions: [
        { uf: "PE", project: "NTT", cost: 446.76, text: "Estrutura dedicada em Recife" },
        { uf: "DF", project: "NTT", cost: 438.15, text: "Atuação com NTT e gestão de armazenagem" },
        { uf: "PR", project: "NTT", cost: 254.36, text: "Incentivo e operação exclusivas" }
      ]
    }
  },
  {
    id: "custo-consolidado",
    number: 8,
    title: "Custo Consolidado Logística",
    subtitle: "Resumo e distribuição geral por modalidade (JUN.26)",
    category: "financials",
    content: {
      kpis: [
        { label: "Custo Logístico Total", value: 57490.83, type: "currency", isHighlight: true }
      ],
      breakdown: [
        { category: "Transportadora", val: 38135.50, share: 66.33, color: "#6366f1" },
        { category: "Correios", val: 8501.43, share: 14.79, color: "#8b5cf6" },
        { category: "Dedicados", val: 4020.00, share: 6.99, color: "#ec4899" },
        { category: "Courier (Loggi)", val: 3633.68, share: 6.32, color: "#06b6d4" },
        { category: "Cia Aérea", val: 2060.95, share: 3.58, color: "#3b82f6" },
        { category: "Self Storage", val: 1139.27, share: 1.98, color: "#10b981" }
      ],
      projects: [
        { name: "NTT", value: 29268.98 },
        { name: "ZAMP", value: 13619.18 },
        { name: "ICARROS", value: 1951.45 },
        { name: "C&A", value: 1738.44 },
        { name: "ITAÚ", value: 1625.70 },
        { name: "VIVO VITA", value: 1341.21 },
        { name: "OPEX", value: 1241.58 },
        { name: "T-SYSTEMS", value: 1175.68 },
        { name: "BEMOBI", value: 1028.87 },
        { name: "HPE", value: 927.20 },
        { name: "ALLCARE", value: 651.79 },
        { name: "METODO", value: 644.29 },
        { name: "TELCOWEB", value: 539.79 },
        { name: "FLEURY", value: 419.74 },
        { name: "MATRIZ TRANSPORTES", value: 367.32 },
        { name: "KLABIN", value: 337.47 },
        { name: "NAVEGACAO GUARITA", value: 317.28 },
        { name: "CEUB", value: 108.70 },
        { name: "SIMPAR", value: 68.82 },
        { name: "Aniversariantes Faiston", value: 58.67 },
        { name: "MONTADORA VW", value: 48.73 },
        { name: "ACER", value: 9.94 }
      ]
    }
  },
  {
    id: "entrada-saida",
    number: 9,
    title: "Consolidado Entrada e Saída",
    subtitle: "Movimentação física de Notas Fiscais e equipamentos comercializados (JUN.26)",
    category: "operations",
    content: {
      entrada: {
        title: "NF Entrada",
        nfs: 2,
        equipments: 9,
        value: 553476.22,
        details: [
          { client: "NTT", qty: 9 }
        ]
      },
      saida: {
        title: "NF Saída",
        nfs: 129,
        equipments: 700,
        value: 1887864.85,
        details: [
          { client: "VITA", qty: 129 },
          { client: "NTT", qty: 69 },
          { client: "BEMOBI", qty: 8 },
          { client: "HPE", qty: 7 },
          { client: "TELCOWEB", qty: 6 },
          { client: "T-SYSTEMS", qty: 6 },
          { client: "C&A", qty: 4 },
          { client: "FLEURY", qty: 3 },
          { client: "ALL CARE", qty: 2 },
          { client: "CEUB", qty: 2 },
          { client: "KLABIN", qty: 2 },
          { client: "METSO", qty: 2 },
          { client: "NAVEGACAO GUARITA", qty: 2 },
          { client: "METODO", qty: 1 },
          { client: "VEXIA", qty: 1 }
        ]
      }
    }
  },
  {
    id: "estoque-atual",
    number: 10,
    title: "Estoque Atual",
    subtitle: "Valor patrimonial de mercadorias custodiadas por categoria (JUN.26)",
    category: "operations",
    content: {
      total: 43865390.68,
      groups: [
        { name: "Estoque com NF", value: 35353837.80, percentage: 80.6, color: "bg-[#0054ec]" },
        { name: "Estoque sem NF", value: 5099877.20, percentage: 11.6, color: "bg-[#fd11a4]" },
        { name: "Guarda de Técnico", value: 836581.06, percentage: 1.9, color: "bg-[#9b1dbf]" },
        { name: "Ativos e Outros", value: 2575094.62, percentage: 5.9, color: "bg-[#fd5665]" }
      ],
      guardaTecnica: [
        { client: "NTT", qty: 85, value: 449775.80 },
        { client: "ARCOS DOURADOS", qty: 95, value: 386805.26 }
      ],
      ativosOutros: [
        { name: "Ativos Fixos Faiston", value: 1275094.62, desc: "Equipamentos e infraestrutura própria" },
        { name: "Outros e Reservas", value: 1300000.00, desc: "Reservas operacionais e itens diversos" }
      ],
      semNf: [
        { client: "NTT_TRAG", qty: 855, value: 4524215.40 },
        { client: "ARCOS DOURADOS REVERSA", qty: 435, value: 435000.00 },
        { client: "ARCOS DOURADOS RMA", qty: 40, value: 140661.80 }
      ],
      topProjectsWithNF: [
        { project: "NTT_SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 12644285.31, itemQty: 334 },
        { project: "NTT_PROJETO F240242 - Evotech Fase 2", value: 5556029.56, itemQty: 257 },
        { project: "NTT_GESTÃO DE SPARE - IS20405", value: 3827786.71, itemQty: 155 },
        { project: "NTT - INSTALAÇÃO DE 48 SWITCHES E 180 APS", value: 3022942.04, itemQty: 488 },
        { project: "NTT_INSTALAÇÃO 614 ANTENAS - F250727", value: 2137702.21, itemQty: 337 },
        { project: "NTT_SUSTENTAÇÃO DE 610 EQUIPAMENTOS - F231369", value: 1031936.00, itemQty: 149 },
        { project: "NTT_INSTALAÇÃO DE 1793 DE SWITCH - F231490", value: 819637.20, itemQty: 138 },
        { project: "NTT_SUSTENTAÇÃO 9000 SW - F221082", value: 755279.17, itemQty: 128 },
        { project: "NTT - SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 664680.82, itemQty: 10 },
        { project: "NTT_IMPLANTAÇÃO 9000 SW - F221082", value: 536521.49, itemQty: 86 },
        { project: "NTT_INSTALAÇÃO DE 550 SWITCH - F221082", value: 347947.37, itemQty: 257 },
        { project: "FAISTON", value: 235500.83, itemQty: 46 },
        { project: "NTT_INSTALAÇÃO 300 CPE SDWAN - IS211010", value: 204459.19, itemQty: 39 },
        { project: "NTT_INSTALAÇÃO 1700 SW - IS21667", value: 177652.84, itemQty: 29 },
        { project: "NTT_USP BREAK AND FIX - F231346", value: 130796.80, itemQty: 17 },
        { project: "ITAÚ", value: 122765.00, itemQty: 136 },
        { project: "VITA", value: 76486.03, itemQty: 15 },
        { project: "NTT_CHESF BREAK AND FIX - IS20652", value: 74756.08, itemQty: 7 },
        { project: "NTT_SUSTENTACAO 300 CPE SDWAN - IS211010", value: 68789.24, itemQty: 13 },
        { project: "NTT_SUSTENTAÇÃO DE 124 AP - F221082", value: 67785.92, itemQty: 16 },
        { project: "FLEURY", value: 54652.57, itemQty: 6 },
        { project: "SPARE ITEMS - MPLS do cliente Banco Bradesco", value: 47968.74, itemQty: 16 },
        { project: "SDwan_250", value: 40080.70, itemQty: 22 },
        { project: "TELCOWEB", value: 24750.00, itemQty: 11 },
        { project: "ENSONO", value: 24290.79, itemQty: 7 },
        { project: "SIMPAR", value: 23960.00, itemQty: 17 },
        { project: "NTT_SUPORTE 1700 SW - IS21776", value: 18377.88, itemQty: 3 },
        { project: "ARCOS DOURADOS", value: 14276.03, itemQty: 5 },
        { project: "MÉTODO", value: 13772.80, itemQty: 3 },
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
        { label: "Qtd. Total Descartada", value: 11306, type: "number" },
        { label: "Receita Líquida Lotes", value: 11500.00, type: "currency", isHighlight: true }
      ],
      lotes: [
        { name: "Lote 1", qty: 420, value: 1100.00, desc: "HDs, Notebooks, Fontes, Cabos, Fãs" },
        { name: "Lote 2", qty: 334, value: 820.00, desc: "CPUs, Monitores, Ventiladores, Placas" },
        { name: "Lote 3", qty: 608, value: 2300.00, desc: "Servidores, Placas, Cabos, Baterias" },
        { name: "Lote 4", qty: 4924, value: 2500.00, desc: "Fontes, Carcaças de SW, HDs, Cabos" },
        { name: "Lote 5", qty: 4085, value: 3000.00, desc: "Roteadores, Switches, Módulos, Antenas" },
        { name: "Lote 7", qty: 114, value: 980.00, desc: "TVs, HDs, Notebooks, Máq. de Cartão" },
        { name: "Lote 8", qty: 6, value: 350.00, desc: "Switches Cisco/Juniper, Servidor HP, Riverbed" },
        { name: "Lote 9", qty: 815, value: 450.00, desc: "Ferros, Cabos, TV, Monitor" }
      ]
    }
  },
  {
    id: "todo-gerencial",
    number: 12,
    title: "Todo Gerencial da Logística de Custos",
    subtitle: "Saving mensal, utilizado e projeção anual (MAI.26)",
    category: "financials",
    content: {
      totalSaving: 40670.98,
      totalUtilizado: 11106.33,
      saldoSaving: 29564.65,
      savingItems: [
        { item: 1, desc: "Descarte sustentável - Lotes 1, 2 e 3", qty: 1362, value: 4220.00, utilizado: true },
        { item: 2, desc: "Descarte sustentável - Lotes 4 e 5", qty: 9009, value: 5550.00, utilizado: true },
        { item: 3, desc: "Redução Notebook Método", qty: 51, value: 5212.80, obs: "Cancelamento do seguro" },
        { item: 4, desc: "Ajuste rateio condomínio 280", qty: null, value: 5148.99, obs: "Redução de HC — água, luz" },
        { item: 5, desc: "Redução Notebook ALLCARE e ENSONO", qty: 137, value: 10617.85, obs: "Cancelamento do seguro" },
        { item: 6, desc: "Venda de 5 TVs", qty: 5, value: 4000.00 },
        { item: 7, desc: "Descarte sustentável - Lote 6", qty: 52, value: 3000.00 },
        { item: 8, desc: "Descarte sustentável - Lote 7", qty: 114, value: 980.00 },
        { item: 9, desc: "Descarte sustentável - Lote 8", qty: 200, value: 200.00 },
        { item: 10, desc: "Renovação Tiflux", qty: null, value: 1741.34 }
      ],
      utilizadoItems: [
        { desc: "Identidade Visual", value: 5217.93, obs: "Ref. itens 1 e 2" },
        { desc: "Manutenção AR - Data center", value: 1600.00, obs: "Ref. itens 1 e 2" },
        { desc: "Visual Set IA", value: 1200.00, obs: "Ref. itens 1 e 2" },
        { desc: "Geladeira", value: 1788.00, obs: "Ref. itens 1 e 2" },
        { desc: "Manutenção banheiro masculino", value: 1300.40 },
        { desc: "Colocação de Azulejos", value: 350.00 }
      ],
      savingAnual: [
        { item: 3, desc: "Redução Notebook Método", mensal: 5212.80, anual: 52128.00 },
        { item: 4, desc: "Ajuste rateio condomínio 280", mensal: 5148.99, anual: 51489.90 },
        { item: 5, desc: "Redução Notebook ALLCARE e ENSONO", mensal: 10617.85, anual: 95560.65 },
        { item: 9, desc: "Renovação Tiflux", mensal: 20896.07, anual: 41792.13 }
      ]
    }
  },
  {
    id: "divisor-seguros",
    number: 13,
    title: "DEPARTAMENTO DE SEGUROS",
    subtitle: "Gestão de Riscos, Apólices e Garantia Patrimonial",
    category: "divider",
    content: {
      totalProtected: 50282577.29,
      monthlyBillingCost: 57616.80,
      activePolicies: 8
    }
  },
  {
    id: "seguros-patrimonial",
    number: 14,
    title: "Garantia Patrimonial de Estoque",
    subtitle: "Estrutura securitária regular e estoque em transição fiscal",
    category: "insurance",
    content: {
      kpis: [
        { label: "Valor Patrimonial Acumulado", value: 40453715.00, type: "currency", isHighlight: true },
        { label: "Custo Mensal da Apólice", value: 30409.62, type: "currency" },
        { label: "Limite de Cobertura Base", value: 45000000.00, type: "currency" }
      ],
      coberturas: [
        { name: "Projetos Faiston", value: 32778743.18, share: 81.03 },
        { name: "Ativos Fixos Faiston", value: 1275094.62, share: 3.15 },
        { name: "Outros e Reservas", value: 1300000.00, share: 3.21 },
        { name: "Clientes Sem NF (NTT/Arcos)", value: 5099877.20, share: 12.61 }
      ],
      semNfBreakdown: [
        { name: "NTT_TRAG", qty: 855, value: 4524215.40 },
        { name: "Arcos Dourados Reversa", qty: 435, value: 435000.00 },
        { name: "Arcos Dourados RMA", qty: 40, value: 140661.80 }
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
    number: 15,
    title: "Seguros de Trânsito & Guarda Técnica",
    subtitle: "Proteção extraordinária de ativos e estoque em pontos satélites",
    category: "insurance",
    content: {
      sections: [
        {
          title: "Seguro Extra (Trânsito & Satélites)",
          totalValue: 6217208.83,
          monthlyCost: 16786.46,
          subItems: [
            { name: "Equipamentos em TRÂNSITO (Faiston)", value: 2952860.90, cost: 7972.72, rate: "0,27% a.m" },
            { name: "Guarda Técnica (Bases NTT / Arcos)", value: 3264347.93, cost: 8813.74, rate: "0,27% a.m" }
          ],
          desc: "Mitigação completa de perdas por extravio ou furto durante transferências ou estocagem temporária em hubs de terceiros."
        },
        {
          title: "Seguro ZAMP (BK Servidores)",
          totalValue: 2480295.00,
          monthlyCost: 4960.58,
          subItems: [
            { name: "Equipamentos Zamp BK", value: 2480295.00, cost: 4960.58, rate: "0,20% a.m" }
          ],
          desc: "Apólice em conformidade com o projeto specific de hardware robusto voltado a servidores do cliente Burger King (Zamp)."
        }
      ]
    }
  },
  {
    id: "seguros-trags",
    number: 16,
    title: "Seguro TRAGs e Arcos Dourados",
    subtitle: "Atuação em desativação e garantia de roubo local pós-entrega",
    category: "insurance",
    content: {
      sections: [
        {
          title: "Seguro de TRAGs (Reversa & Desativação)",
          totalValue: 391569.52,
          monthlyCost: 1057.24,
          rate: "0,27% a.m",
          phases: [
            { client: "Fase 27", val: 21165.92, minCost: 57.15 },
            { client: "Fase 27 - 2", val: 370403.60, minCost: 1000.09 }
          ],
          desc: "Cobertura de Responsabilidade Civil durante postagem e remessa de itens substituídos até a recepção física no estoque."
        },
        {
          title: "Seguro Arcos Dourados Instalação",
          totalValue: 396458.75,
          monthlyCost: 1070.44,
          rate: "0,27% a.m",
          phases: [
            { client: "Unidades em Instalação", qty: 127, val: 396458.75 }
          ],
          desc: "Janela securitária estendida de 30 dias cobrindo roubo local em lojas recém-equipadas antes da homologação final do cliente."
        }
      ]
    }
  },
  {
    id: "seguros-satelite",
    number: 17,
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
            { name: "11ª Apólice", value: 2789.82, cost: 33.48 },
            { name: "12ª Apólice", value: 1200.00, cost: 14.40 },
            { name: "13ª Apólice", value: 800.00, cost: 9.60 },
            { name: "14ª Apólice", value: 784.80, cost: 9.42 }
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
    number: 18,
    title: "Composição de Despesa de Faturas de Seguros",
    subtitle: "Conciliação mensal, endossos e ajustes de mensalidade (JUN.26)",
    category: "financials",
    content: {
      total: 53423.07,
      kpis: [
        { label: "Fatura Líquida Consolidada", value: 53423.07, type: "currency", isHighlight: true }
      ],
      invoiceItems: [
        { label: "Patrimonial", name: "Seguro Patrimonial", value: 32910.57, sub: "Estoque fixo" },
        { label: "Extra", name: "Seguro Extra", value: 14318.68, sub: "Trânsito e bases satélites" },
        { label: "Arcos", name: "Arcos Dourados", value: 2415.83, sub: "Instalações" },
        { label: "Starlink", name: "Starlink", value: 1446.95, sub: "Antenas em campo" },
        { label: "TRAG", name: "Seguro TRAG 23/Fase 2", value: 1215.50, sub: "Transportes e reversas" },
        { label: "Simpar", name: "Simpar", value: 684.54, sub: "Apólice dedicada Simpar" },
        { label: "Fluke", name: "Fluke", value: 431.00, sub: "Instrumentos de medição" }
      ],
      comments: [
        "Conciliação fechou com faturas auditadas e prêmios aplicados por categoria, acumulando R$ 53.423,07 mensais para uma proteção do patrimônio Faiston.",
        "Diferenças identificadas entre as taxas aplicadas nas faturas físicas e as apólices digitais estão sob análise técnica."
      ]
    }
  },
  {
    id: "agradecimento",
    number: 19,
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
