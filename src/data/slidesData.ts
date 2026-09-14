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
    subtitle: "Consolidado por projeto - Custos, embarques e equipamentos (SET.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 4573.11, type: "currency", isHighlight: true },
        { label: "Total Embarques", value: 89, type: "number" },
        { label: "Equipamentos", value: 89, type: "number" },
        { label: "Custo Médio", value: 51.38, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: NTT – R$ 1.964,54" },
        { type: "success", text: "Menor custo: ITAÚ – R$ 54,54" }
      ],
      projects: [
        { project: "NTT", cost: 1964.54, shipments: 26, equipments: 26, averageCost: 75.56 },
        { project: "OPEX", cost: 978.04, shipments: 36, equipments: 36, averageCost: 27.17 },
        { project: "VIVO VITA", cost: 567.81, shipments: 10, equipments: 10, averageCost: 56.78 },
        { project: "TELCOWEB", cost: 322.64, shipments: 4, equipments: 4, averageCost: 80.66 },
        { project: "KLABIN", cost: 311.94, shipments: 4, equipments: 4, averageCost: 77.99 },
        { project: "BEMOBI", cost: 178.33, shipments: 4, equipments: 4, averageCost: 44.58 },
        { project: "HPE", cost: 111.27, shipments: 2, equipments: 2, averageCost: 55.64 },
        { project: "ZAMP", cost: 84.00, shipments: 2, equipments: 2, averageCost: 42.00 },
        { project: "ITAÚ", cost: 54.54, shipments: 1, equipments: 1, averageCost: 54.54 }
      ]
    }
  },
  {
    id: "transportadoras",
    number: 3,
    title: "Expedições Transportadoras",
    subtitle: "Custo consolidado por projeto (SET.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 46022.29, type: "currency", isHighlight: true },
        { label: "Notas Fiscais / Embarques", value: 97, type: "number" },
        { label: "Equipamentos", value: 462, type: "number" }
      ],
      distribution: [
        { name: "RED CARGAS", value: 32331.76, percentage: 70.25, color: "from-emerald-500 to-teal-500" },
        { name: "BESTLOG", value: 7661.82, percentage: 16.65, color: "from-indigo-500 to-violet-500" },
        { name: "SCALT", value: 6028.71, percentage: 13.10, color: "from-purple-500 to-pink-500" }
      ],
      projects: [
        { project: "ZAMP", cost: 19898.80, shipments: 17, equipments: 264, averageCost: 1170.52 },
        { project: "NTT", cost: 17830.20, shipments: 47, equipments: 147, averageCost: 379.37 },
        { project: "ICARROS", cost: 4899.19, shipments: 18, equipments: 32, averageCost: 272.18 },
        { project: "ALLCARE", cost: 851.92, shipments: 5, equipments: 5, averageCost: 170.38 },
        { project: "T-SYSTEMS", cost: 641.77, shipments: 1, equipments: 1, averageCost: 641.77 },
        { project: "VIVO VITA", cost: 556.31, shipments: 2, equipments: 2, averageCost: 278.16 },
        { project: "ENSONO", cost: 396.33, shipments: 3, equipments: 3, averageCost: 132.11 },
        { project: "STARLINK", cost: 344.94, shipments: 1, equipments: 4, averageCost: 344.94 },
        { project: "OPEX", cost: 239.39, shipments: 1, equipments: 1, averageCost: 239.39 },
        { project: "FLEURY", cost: 225.00, shipments: 1, equipments: 1, averageCost: 225.00 },
        { project: "TELCOWEB", cost: 138.44, shipments: 1, equipments: 2, averageCost: 138.44 }
      ],
      commentary: [
        { type: "info", text: "ZAMP e NTT somam R$ 37.729,00 (82,0% do custo consolidado)." },
        { type: "link", text: "ZAMP concentra 264 dos 462 equipamentos transportados." }
      ]
    }
  },
  {
    id: "cia-aerea",
    number: 4,
    title: "Expedições Cia Aérea",
    subtitle: "Consolidado GOL - Custo total e equipamentos (SET.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 2332.97, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 21, type: "number" },
        { label: "Custo Médio / Equip.", value: 111.09, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: NTT – R$ 1.172,32" },
        { type: "success", text: "Menor custo: C&A – R$ 99,25" }
      ],
      projects: [
        { project: "NTT", cost: 1172.32, equipments: 5, averageCost: 234.46 },
        { project: "HPE", cost: 565.20, equipments: 8, averageCost: 70.65 },
        { project: "VIVO VITA", cost: 496.20, equipments: 7, averageCost: 70.89 },
        { project: "C&A", cost: 99.25, equipments: 1, averageCost: 99.25 }
      ]
    }
  },
  {
    id: "courier",
    number: 5,
    title: "Expedições Courier",
    subtitle: "Consolidado LOGGI - Custos, embarques e equipamentos (SET.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 3560.74, type: "currency", isHighlight: true },
        { label: "Nº de Embarques", value: 36, type: "number" },
        { label: "Qtd. Equipamentos", value: 36, type: "number" },
        { label: "Custo Médio / Emb.", value: 98.91, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: HPE – R$ 1.141,09 (12 equipamentos)" },
        { type: "success", text: "Menor custo: ALLCARE – R$ 97,01 (1 equipamento)" }
      ],
      projects: [
        { project: "HPE", cost: 1141.09, shipments: 12, equipments: 12, averageCost: 95.09 },
        { project: "T-SYSTEMS", cost: 752.47, shipments: 8, equipments: 8, averageCost: 94.06 },
        { project: "BEMOBI", cost: 477.12, shipments: 3, equipments: 3, averageCost: 159.04 },
        { project: "ZAMP", cost: 343.06, shipments: 3, equipments: 3, averageCost: 114.35 },
        { project: "STARLINK", cost: 268.18, shipments: 2, equipments: 2, averageCost: 134.09 },
        { project: "C&A", cost: 228.52, shipments: 2, equipments: 2, averageCost: 114.26 },
        { project: "TELCOWEB", cost: 146.36, shipments: 2, equipments: 2, averageCost: 73.18 },
        { project: "OPEX", cost: 106.93, shipments: 3, equipments: 3, averageCost: 35.64 },
        { project: "ALLCARE", cost: 97.01, shipments: 1, equipments: 1, averageCost: 97.01 }
      ]
    }
  },
  {
    id: "dedicados",
    number: 6,
    title: "Expedições Dedicados",
    subtitle: "Consolidado por projeto e rota (SET.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 2750.00, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 33, type: "number" }
      ],
      commentary: [
        { type: "info", text: "Maior custo de rota: WASHINGTON – R$ 2.050,00" },
        { type: "success", text: "Custo por projetos: BIONOVIS lidera com R$ 750,00" }
      ],
      rotas: [
        { transportadora: "WASHINGTON", total: 2050.00, breakdown: [{ project: "BIONOVIS", val: 750.00 }, { project: "HABRAS", val: 600.00 }, { project: "NTT", val: 300.00 }, { project: "VIVO VITA", val: 300.00 }, { project: "ZAMP", val: 100.00 }] },
        { transportadora: "THOMÉ", total: 400.00, breakdown: [{ project: "T-SYSTEMS", val: 400.00 }] },
        { transportadora: "CASARINI", total: 300.00, breakdown: [{ project: "NTT", val: 300.00 }] }
      ],
      projects: [
        { project: "BIONOVIS", cost: 750.00 },
        { project: "NTT", cost: 600.00, equipments: 12 },
        { project: "HABRAS", cost: 600.00, equipments: 11 },
        { project: "T-SYSTEMS", cost: 400.00, equipments: 1 },
        { project: "VIVO VITA", cost: 300.00, equipments: 6 },
        { project: "ZAMP", cost: 100.00, equipments: 3 }
      ]
    }
  },
  {
    id: "self-storage",
    number: 7,
    title: "Custo mensal Self Storage",
    subtitle: "Valores consolidados por UF para projeto NTT (SET.26)",
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
    subtitle: "Resumo e distribuição geral por modalidade (SET.26)",
    category: "financials",
    content: {
      kpis: [
        { label: "Custo Logístico Total", value: 60386.92, type: "currency", isHighlight: true }
      ],
      breakdown: [
        { category: "Transportadora", val: 46022.29, share: 76.21, color: "#6366f1" },
        { category: "Correios", val: 4573.11, share: 7.57, color: "#8b5cf6" },
        { category: "Courier (Loggi)", val: 3560.74, share: 5.90, color: "#06b6d4" },
        { category: "Dedicados", val: 2750.00, share: 4.55, color: "#ec4899" },
        { category: "Cia Aérea", val: 2332.97, share: 3.86, color: "#3b82f6" },
        { category: "Self Storage", val: 1147.81, share: 1.90, color: "#10b981" }
      ],
      projects: [
        { name: "NTT", value: 22714.87 },
        { name: "ZAMP", value: 20425.86 },
        { name: "ICARROS", value: 4899.19 },
        { name: "VIVO VITA", value: 1920.32 },
        { name: "HPE", value: 1817.56 },
        { name: "T-SYSTEMS", value: 1794.24 },
        { name: "OPEX", value: 1324.36 },
        { name: "ALLCARE", value: 948.93 },
        { name: "BIONOVIS", value: 750.00 },
        { name: "BEMOBI", value: 655.45 },
        { name: "STARLINK", value: 613.12 },
        { name: "TELCOWEB", value: 607.44 },
        { name: "HABRAS", value: 600.00 },
        { name: "ENSONO", value: 396.33 },
        { name: "C&A", value: 327.77 },
        { name: "KLABIN", value: 311.94 },
        { name: "FLEURY", value: 225.00 },
        { name: "ITAÚ", value: 54.54 }
      ]
    }
  },
  {
    id: "entrada-saida",
    number: 9,
    title: "Consolidado Entrada e Saída",
    subtitle: "Movimentação física de Notas Fiscais e equipamentos comercializados (SET.26)",
    category: "operations",
    content: {
      entrada: {
        title: "NF Entrada",
        nfs: 12,
        equipments: 589,
        value: 1290246.36,
        details: []
      },
      saida: {
        title: "NF Saída",
        nfs: 134,
        equipments: 305,
        value: 889918.21,
        details: [
          { client: "ZAMP", qty: 127 },
          { client: "BIONOVIS", qty: 43 },
          { client: "NTT", qty: 30 },
          { client: "HPE", qty: 25 },
          { client: "VITA", qty: 23 },
          { client: "TELCOWEB", qty: 18 },
          { client: "HABRAS", qty: 12 },
          { client: "T-SYSTEMS", qty: 7 },
          { client: "BEMOBI", qty: 6 },
          { client: "C&A", qty: 5 },
          { client: "METSO", qty: 4 },
          { client: "OPEX", qty: 4 },
          { client: "ENSONO", qty: 1 }
        ]
      }
    }
  },
  {
    id: "estoque-atual",
    number: 10,
    title: "Estoque Atual",
    subtitle: "Valor patrimonial de mercadorias custodiadas por categoria (SET.26)",
    category: "operations",
    content: {
      total: 48249094.05,
      groups: [
        { name: "Projetos com NF", value: 38120726.23, percentage: 79.01, color: "bg-[#0054ec]" },
        { name: "Estoque sem NF", value: 6757876.88, percentage: 14.01, color: "bg-[#fd11a4]" },
        { name: "Ativos e Outros", value: 2575094.62, percentage: 5.34, color: "bg-[#fd5665]" },
        { name: "Guarda de Técnico", value: 795396.32, percentage: 1.65, color: "bg-[#9b1dbf]" }
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
        { client: "ZAMP SERVIDORES REVERSA", qty: 248, value: 3000552.00 },
        { client: "NTT_RMA", qty: 43, value: 1312873.06 },
        { client: "NTT_TRAG", qty: 218, value: 1153542.64 },
        { client: "ZAMP STARBUCKS REVERSA", qty: 158, value: 562087.72 },
        { client: "ARCOS DOURADOS REVERSA", qty: 520, value: 540124.37 },
        { client: "ARCOS DOURADOS RMA", qty: 55, value: 188697.09 }
      ],
      topProjectsWithNF: [
        { project: "NTT_SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 12633285.31, itemQty: 332 },
        { project: "NTT_PROJETO F240242 - Evotech Fase 2", value: 5556029.56, itemQty: 257 },
        { project: "ZAMP", value: 4065303.86, itemQty: 1255 },
        { project: "NTT_GESTÃO DE SPARE - IS20405", value: 3827786.71, itemQty: 155 },
        { project: "NTT - INSTALAÇÃO DE 48 SWITCHES E 180 APS", value: 2961580.80, itemQty: 487 },
        { project: "NTT_TBRA", value: 1432705.40, itemQty: 149 },
        { project: "NTT_INSTALAÇÃO 614 ANTENAS - F250727", value: 1395532.60, itemQty: 220 },
        { project: "NTT_SUSTENTAÇÃO DE 610 EQUIPAMENTOS - F231369", value: 1031936.00, itemQty: 149 },
        { project: "NTT_INSTALAÇÃO DE 1793 DE SWITCH - F231490", value: 819637.20, itemQty: 138 },
        { project: "NTT_SUSTENTAÇÃO 9000 SW - F221082", value: 686489.93, itemQty: 115 },
        { project: "NTT - SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 664680.82, itemQty: 10 },
        { project: "ALL CARE", value: 530602.10, itemQty: 463 },
        { project: "NTT_IMPLANTAÇÃO 9000 SW - F221082", value: 525938.53, itemQty: 84 },
        { project: "NTT_SUSTENTAÇÃO F5", value: 359379.28, itemQty: 8 },
        { project: "NTT_INSTALAÇÃO DE 550 SWITCH - F221082", value: 347947.37, itemQty: 257 },
        { project: "FAISTON", value: 235500.83, itemQty: 46 },
        { project: "NTT_INSTALAÇÃO 300 CPE SDWAN - IS211010", value: 204459.19, itemQty: 39 },
        { project: "NTT_INSTALAÇÃO 1700 SW - IS21667", value: 177652.84, itemQty: 29 },
        { project: "ITAÚ", value: 122765.00, itemQty: 136 },
        { project: "NTT_USP BREAK AND FIX - F231346", value: 114793.80, itemQty: 15 },
        { project: "NTT_CHESF BREAK AND FIX - IS20652", value: 74756.08, itemQty: 7 },
        { project: "NTT_SUSTENTACAO 300 CPE SDWAN - IS211010", value: 68789.24, itemQty: 13 },
        { project: "NTT_SUSTENTAÇÃO DE 124 AP - F221082", value: 67785.92, itemQty: 16 },
        { project: "SPARE ITEMS - MPLS do cliente Banco Bradesco", value: 47968.74, itemQty: 16 },
        { project: "SDwan_250", value: 40080.70, itemQty: 22 },
        { project: "TELCOWEB", value: 24750.00, itemQty: 11 },
        { project: "ENSONO", value: 24290.79, itemQty: 7 },
        { project: "SIMPAR", value: 23960.00, itemQty: 17 },
        { project: "MÉTODO", value: 20250.16, itemQty: 4 },
        { project: "NTT_SUPORTE 1700 SW - IS21776", value: 18377.88, itemQty: 3 },
        { project: "NTT_BREAK FIX - F260189", value: 10600.00, itemQty: 2 },
        { project: "CONECT", value: 2474.20, itemQty: 1 },
        { project: "ARCOS DOURADOS", value: 2063.90, itemQty: 1 },
        { project: "FLEURY", value: 571.49, itemQty: 1 }
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
    subtitle: "Reparos e manutenções de equipamentos — Setembro/26",
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
    id: "divisor-seguros",
    number: 13,
    title: "DEPARTAMENTO DE SEGUROS",
    subtitle: "Gestão de Riscos, Apólices e Garantia Patrimonial",
    category: "divider",
    content: {
      totalProtected: 53574272.36,
      monthlyBillingCost: 51881.51,
      activePolicies: 7
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
        { label: "Valor Patrimonial Acumulado", value: 47453697.73, type: "currency", isHighlight: true },
        { label: "Custo Mensal da Apólice", value: 32910.57, type: "currency" },
        { label: "Limite de Cobertura Base", value: 45000000.00, type: "currency" }
      ],
      coberturas: [
        { name: "Projetos Faiston", value: 38120726.23, share: 80.33 },
        { name: "Ativos Fixos Faiston", value: 1275094.62, share: 2.69 },
        { name: "Outros e Reservas", value: 1300000.00, share: 2.74 },
        { name: "Clientes Sem NF (NTT/Arcos/Zamp)", value: 6757876.88, share: 14.24 }
      ],
      semNfBreakdown: [
        { name: "Zamp Servidores Reversa", qty: 248, value: 3000552.00 },
        { name: "NTT_RMA", qty: 43, value: 1312873.06 },
        { name: "NTT_TRAG", qty: 218, value: 1153542.64 },
        { name: "Zamp Starbucks Reversa", qty: 158, value: 562087.72 },
        { name: "Arcos Dourados Reversa", qty: 520, value: 540124.37 },
        { name: "Arcos Dourados RMA", qty: 55, value: 188697.09 }
      ],
      comentarios: [
        "A apólice cobre todos os equipamentos que entraram em nosso estoque físico até a devida saída regulamentada.",
        "Destaque: NTT representa o maior volume segurado em estoque regular (projetos).",
        "Ativos Fixos abrangem estruturas físicas corporativas: mobiliário de escritório e equipamentos técnicos.",
        "Em caso de sinistro extraordinário, as câmeras de CFTV são acionadas como exigência comprovatória contratual.",
        "Valor segurado concilia com o Estoque Atual: R$ 48.249.094,05 custodiados menos R$ 795.396,32 de Guarda de Técnico, que é coberta pela apólice de Seguro Extra."
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
          totalValue: 4858726.11,
          monthlyCost: 13118.56,
          subItems: [
            { name: "Equipamentos em TRÂNSITO (Faiston)", value: 1699502.51, cost: 4588.66, rate: "0,27% a.m" },
            { name: "Guarda Técnica (Bases NTT / Arcos)", value: 3159223.60, cost: 8529.90, rate: "0,27% a.m" }
          ],
          desc: "Mitigação completa de perdas por extravio ou furto durante transferências ou estocagem temporária em hubs de terceiros."
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
          totalValue: 201076.35,
          monthlyCost: 542.91,
          rate: "0,27% a.m",
          phases: [
            { client: "Fase 28", val: 201076.35, minCost: 542.91 }
          ],
          desc: "Cobertura de Responsabilidade Civil durante postagem e remessa de itens substituídos até a recepção física no estoque."
        },
        {
          title: "Seguro Arcos Dourados Instalação",
          totalValue: 713149.29,
          monthlyCost: 1925.50,
          rate: "0,27% a.m",
          phases: [
            { client: "Unidades em Instalação", qty: 177, val: 713149.29 }
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
          totalValue: 242622.88,
          monthlyCost: 2911.47,
          rate: "1,20% a.m",
          desc: "Cobertura física integral contra avarias climáticas ou vandalismo operacional, com participação obrigatória estabilizada de 10% sobre sinistros.",
          apolices: [
            { name: "1ª Apólice", value: 82924.82, cost: 995.10 },
            { name: "2ª Apólice", value: 126689.46, cost: 1520.27 },
            { name: "3ª Apólice", value: 3988.64, cost: 47.86 },
            { name: "4ª Apólice", value: 5675.47, cost: 68.11 },
            { name: "5ª Apólice", value: 2007.92, cost: 24.10 },
            { name: "6ª Apólice", value: 1693.11, cost: 20.32 },
            { name: "7ª Apólice", value: 3812.39, cost: 45.75 },
            { name: "8ª Apólice", value: 5958.74, cost: 71.50 },
            { name: "9ª Apólice", value: 2789.82, cost: 33.48 },
            { name: "10ª Apólice", value: 1200.00, cost: 14.40 },
            { name: "11ª Apólice", value: 800.00, cost: 9.60 },
            { name: "12ª Apólice", value: 784.80, cost: 9.42 },
            { name: "13ª Apólice", value: 4297.71, cost: 51.57 }
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
    title: "Faturas de Seguros — CNPJ Principal",
    subtitle: "Conciliação mensal, endossos e ajustes de mensalidade (SET.26)",
    category: "financials",
    content: {
      total: 58953.59,
      kpis: [
        { label: "Fatura CNPJ Principal", value: 58953.59, type: "currency", isHighlight: true }
      ],
      invoiceItems: [
        { label: "Patrimonial", name: "Seguro Patrimonial", value: 32910.57, sub: "Estoque fixo" },
        { label: "Extra", name: "Seguro Extra / Guarda Técnica", value: 14110.24, sub: "Trânsito e bases satélites" },
        { label: "BD Costs", name: "BD Costs", value: 5000.00, sub: "Serviços de gestão e corretagem" },
        { label: "Arcos", name: "Arcos Dourados", value: 2376.06, sub: "Instalações" },
        { label: "TRAG", name: "TRAG", value: 1775.82, sub: "Reversa e desativação" },
        { label: "Starlink", name: "Starlink", value: 1036.68, sub: "Antenas em campo" },
        { label: "Simpar", name: "Simpar", value: 684.54, sub: "Apólice dedicada Simpar" },
        { label: "Zamp", name: "Zamp", value: 593.71, sub: "Apólice dedicada Zamp" },
        { label: "Fluke", name: "Fluke", value: 430.97, sub: "Instrumentos de medição" },
        { label: "Mensalidade", name: "Mensalidade", value: 35.00, sub: "Taxa fixa mensal" }
      ],
      comments: [
        "Fatura do CNPJ principal fecha em R$ 58.953,59, concentrando todas as apólices operacionais da Faiston.",
        "Patrimonial (R$ 32.910,57) e Extra / Guarda Técnica (R$ 14.110,24) respondem por 79,8% da fatura do mês.",
        "Mês sem estorno de crédito; BD Costs (R$ 5.000,00) e mensalidade fixa (R$ 35,00) seguem como despesas recorrentes."
      ]
    }
  },
  {
    id: "custo-fatura-gerenciamento",
    number: 19,
    title: "Faturas de Seguros — CNPJ Gerenciamento",
    subtitle: "Conciliação mensal do CNPJ de gerenciamento (SET.26)",
    category: "financials",
    content: {
      total: 73.12,
      kpis: [
        { label: "Fatura CNPJ Gerenciamento", value: 73.12, type: "currency", isHighlight: true }
      ],
      invoiceItems: [
        { label: "Starlink", name: "Starlink", value: 57.63, sub: "Antenas vinculadas ao CNPJ de gerenciamento" },
        { label: "Indevido", name: "Cobrança Indevida", value: 15.49, sub: "Em contestação junto à corretora" }
      ],
      comments: [
        "Fatura do CNPJ de gerenciamento fecha em R$ 73,12, valor residual frente aos R$ 58.953,59 do CNPJ principal.",
        "Cobrança indevida de R$ 15,49 identificada na conciliação e já aberta para contestação junto à corretora.",
        "Somadas, as duas faturas totalizam R$ 59.026,71 de despesa mensal com seguros."
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
