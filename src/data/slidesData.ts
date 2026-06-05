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
    subtitle: "Consolidado por projeto - Custos, embarques e equipamentos (MAI.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 15118.89, type: "currency", isHighlight: true },
        { label: "Total Embarques", value: 268, type: "number" },
        { label: "Equipamentos", value: 268, type: "number" },
        { label: "Custo Médio", value: 56.41, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: ZAMP – R$ 10.721,88" },
        { type: "success", text: "Menor custo: BEMOBI / T-SYSTEMS – R$ 28,85" },
        { type: "stats", text: "Total de embarques consolidados no período: 268" }
      ],
      projects: [
        { project: "ZAMP", cost: 10721.88, shipments: 141, equipments: 141, averageCost: 76.04 },
        { project: "NTT", cost: 2184.31, shipments: 35, equipments: 35, averageCost: 62.41 },
        { project: "ITAÚ", cost: 1133.22, shipments: 47, equipments: 47, averageCost: 24.11 },
        { project: "VIVO VITA", cost: 400.88, shipments: 18, equipments: 18, averageCost: 22.27 },
        { project: "KLABIN", cost: 196.67, shipments: 5, equipments: 5, averageCost: 39.33 },
        { project: "OPEX", cost: 146.69, shipments: 8, equipments: 8, averageCost: 18.34 },
        { project: "ANIVERSÁRIANTES FAISTON", cost: 95.43, shipments: 6, equipments: 6, averageCost: 15.91 },
        { project: "ERICSSON", cost: 93.31, shipments: 2, equipments: 2, averageCost: 46.66 },
        { project: "HPE", cost: 44.51, shipments: 2, equipments: 2, averageCost: 22.26 },
        { project: "TELCOWEB", cost: 44.29, shipments: 2, equipments: 2, averageCost: 22.15 },
        { project: "BEMOBI", cost: 28.85, shipments: 1, equipments: 1, averageCost: 28.85 },
        { project: "T-SYSTEMS", cost: 28.85, shipments: 1, equipments: 1, averageCost: 28.85 }
      ]
    }
  },
  {
    id: "transportadoras",
    number: 3,
    title: "Expedições Transportadoras",
    subtitle: "Custo consolidado por projeto (MAI.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 33893.50, type: "currency", isHighlight: true },
        { label: "Notas Fiscais / Embarques", value: 61, type: "number" },
        { label: "Equipamentos", value: 220, type: "number" }
      ],
      distribution: [
        { name: "BESTLOG", value: 17569.00, percentage: 52, color: "from-indigo-500 to-violet-500" },
        { name: "SCALT", value: 16324.50, percentage: 48, color: "from-purple-500 to-pink-500" }
      ],
      projects: [
        { project: "NTT", cost: 18007.93, shipments: 21, equipments: 49, averageCost: 857.52 },
        { project: "ZAMP", cost: 7378.00, shipments: 4, equipments: 47, averageCost: 1844.50 },
        { project: "FLEURY", cost: 5878.50, shipments: 25, equipments: 111, averageCost: 235.14 },
        { project: "VIVO VITA", cost: 2120.97, shipments: 9, equipments: 11, averageCost: 235.66 },
        { project: "CONNECT", cost: 508.10, shipments: 2, equipments: 2, averageCost: 254.05 }
      ],
      commentary: [
        { type: "info", text: "NTT e ZAMP somam R$ 25.385,93 (74,9% do custo consolidado)." },
        { type: "link", text: "FLEURY concentra 111 dos 220 equipamentos transportados." }
      ]
    }
  },
  {
    id: "cia-aerea",
    number: 4,
    title: "Expedições Cia Aérea",
    subtitle: "Consolidado GOL - Custo total e equipamentos (MAI.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 4532.03, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 9, type: "number" },
        { label: "Custo Médio / Equip.", value: 503.56, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: NTT – R$ 3.613,45" },
        { type: "success", text: "Menor custo: VIVO VITA – R$ 75,70" }
      ],
      projects: [
        { project: "NTT", cost: 3613.45, equipments: 1, averageCost: 3613.45 },
        { project: "HPE", cost: 510.95, equipments: 4, averageCost: 127.74 },
        { project: "BEMOBI", cost: 331.93, equipments: 3, averageCost: 110.64 },
        { project: "VIVO VITA", cost: 75.70, equipments: 1, averageCost: 75.70 }
      ]
    }
  },
  {
    id: "courier",
    number: 5,
    title: "Expedições Courier",
    subtitle: "Consolidado LOGGI - Custos, embarques e equipamentos (MAI.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 3077.77, type: "currency", isHighlight: true },
        { label: "Nº de Embarques", value: 38, type: "number" },
        { label: "Qtd. Equipamentos", value: 38, type: "number" },
        { label: "Custo Médio / Emb.", value: 80.99, type: "currency" }
      ],
      commentary: [
        { type: "info", text: "Maior custo: HPE – R$ 1.209,17 (12 equipamentos)" },
        { type: "success", text: "Menor custo: BEMOBI – R$ 32,35 (1 equipamento)" }
      ],
      projects: [
        { project: "HPE", cost: 1209.17, shipments: 12, equipments: 12, averageCost: 100.76 },
        { project: "T-SYSTEMS", cost: 741.18, shipments: 9, equipments: 9, averageCost: 82.35 },
        { project: "NTT", cost: 378.37, shipments: 5, equipments: 5, averageCost: 75.67 },
        { project: "ZAMP", cost: 212.82, shipments: 3, equipments: 3, averageCost: 70.94 },
        { project: "TELCOWEB", cost: 162.74, shipments: 3, equipments: 3, averageCost: 54.25 },
        { project: "OPEX", cost: 128.64, shipments: 3, equipments: 3, averageCost: 42.88 },
        { project: "ICARROS", cost: 111.49, shipments: 1, equipments: 1, averageCost: 111.49 },
        { project: "VIVO VITA", cost: 101.01, shipments: 1, equipments: 1, averageCost: 101.01 },
        { project: "BEMOBI", cost: 32.35, shipments: 1, equipments: 1, averageCost: 32.35 }
      ]
    }
  },
  {
    id: "dedicados",
    number: 6,
    title: "Expedições Dedicados",
    subtitle: "Consolidado por projeto e rota (MAI.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 3495.00, type: "currency", isHighlight: true },
        { label: "Qtd. Equipamentos", value: 83, type: "number" }
      ],
      commentary: [
        { type: "info", text: "Maior custo de rota: WASHINGTON – R$ 1.550,00" },
        { type: "success", text: "Custo por projetistas: NTT lidera com R$ 1.520,00 (39 equipamentos)" }
      ],
      rotas: [
        { transportadora: "CASARINI", total: 1650.00, breakdown: [{ project: "NTT", val: 950.00 }, { project: "ZAMP", val: 700.00 }] },
        { transportadora: "WASHINGTON", total: 1550.00, breakdown: [{ project: "T-SYSTEMS", val: 750.00 }, { project: "NTT", val: 400.00 }, { project: "HPE", val: 200.00 }, { project: "OPEX", val: 200.00 }] },
        { transportadora: "SEVERINO", total: 170.00, breakdown: [{ project: "NTT", val: 170.00 }] },
        { transportadora: "THOMÉ", total: 125.00, breakdown: [{ project: "METSO", val: 125.00 }] }
      ],
      projects: [
        { project: "NTT", cost: 1520.00, equipments: 39 },
        { project: "T-SYSTEMS", cost: 750.00, equipments: 3 },
        { project: "ZAMP", cost: 700.00, equipments: 38 },
        { project: "HPE", cost: 200.00, equipments: 1 },
        { project: "OPEX", cost: 200.00, equipments: 1 },
        { project: "METSO", cost: 125.00, equipments: 1 }
      ]
    }
  },
  {
    id: "self-storage",
    number: 7,
    title: "Custo mensal Self Storage",
    subtitle: "Valores consolidados por UF para projeto NTT (MAI.26)",
    category: "expeditions",
    content: {
      kpis: [
        { label: "Custo Total", value: 1116.90, type: "currency", isHighlight: true },
        { label: "Projeto Atendido", value: "NTT", type: "text" },
        { label: "Regiões", value: 3, type: "number" }
      ],
      commentary: [
        { type: "info", text: "Operação PE e PR: Dedicados à armazenagem e movimentação exclusiva de NTT." },
        { type: "info", text: "Operação DF: Atuação direta com equipe NTT e gestão local de spare parts." }
      ],
      regions: [
        { uf: "DF", project: "NTT", cost: 438.15, text: "Atuação com NTT e gestão de armazenagem" },
        { uf: "PR", project: "NTT", cost: 435.09, text: "Incentivo e operação exclusivas" },
        { uf: "PE", project: "NTT", cost: 243.66, text: "Estrutura dedicada em Recife" }
      ]
    }
  },
  {
    id: "custo-consolidado",
    number: 8,
    title: "Custo Consolidado Logística",
    subtitle: "Resumo e distribuição geral por modalidade (MAI.26)",
    category: "financials",
    content: {
      kpis: [
        { label: "Custo Logístico Total", value: 61234.09, type: "currency", isHighlight: true }
      ],
      breakdown: [
        { category: "Transportadora", val: 33893.50, share: 55.35, color: "#6366f1" },
        { category: "Correios", val: 15118.89, share: 24.69, color: "#8b5cf6" },
        { category: "Cia Aérea", val: 4532.03, share: 7.40, color: "#3b82f6" },
        { category: "Dedicados", val: 3495.00, share: 5.71, color: "#ec4899" },
        { category: "Courier (Loggi)", val: 3077.77, share: 5.03, color: "#06b6d4" },
        { category: "Self Storage", val: 1116.90, share: 1.82, color: "#10b981" }
      ],
      projects: [
        { name: "NTT", value: 26820.96 },
        { name: "ZAMP", value: 19012.70 },
        { name: "FLEURY", value: 5878.50 },
        { name: "VIVO VITA", value: 2698.56 },
        { name: "HPE", value: 1964.63 },
        { name: "T-SYSTEMS", value: 1520.03 },
        { name: "ITAÚ", value: 1133.22 },
        { name: "CONNECT", value: 508.10 },
        { name: "OPEX", value: 475.33 },
        { name: "BEMOBI", value: 393.13 },
        { name: "TELCOWEB", value: 207.03 },
        { name: "KLABIN", value: 196.67 },
        { name: "METSO", value: 125.00 },
        { name: "ICARROS", value: 111.49 },
        { name: "Aniversariantes Faiston", value: 95.43 },
        { name: "ERICSSON", value: 93.31 }
      ]
    }
  },
  {
    id: "entrada-saida",
    number: 9,
    title: "Consolidado Entrada e Saída",
    subtitle: "Movimentação física de Notas Fiscais e equipamentos comercializados (MAI.26)",
    category: "operations",
    content: {
      entrada: {
        title: "NF Entrada",
        nfs: 3,
        equipments: 64,
        value: 227356.41,
        details: [
          { client: "FLEURY", qty: 33 },
          { client: "VIVO VITA", qty: 31 }
        ]
      },
      saida: {
        title: "NF Saída",
        nfs: 117,
        equipments: 374,
        value: 2206610.38,
        details: [
          { client: "FLEURY", qty: 117 },
          { client: "KLABIN", qty: 76 },
          { client: "NTT", qty: 75 },
          { client: "VITA", qty: 42 },
          { client: "HPE", qty: 28 },
          { client: "BEMOBI", qty: 11 },
          { client: "ZAMP", qty: 11 },
          { client: "TELCOWEB", qty: 6 },
          { client: "T-SYSTEMS", qty: 3 },
          { client: "VEXIA", qty: 3 },
          { client: "TELETEX", qty: 2 }
        ]
      }
    }
  },
  {
    id: "estoque-atual",
    number: 10,
    title: "Estoque Atual",
    subtitle: "Valor patrimonial de mercadorias custodiadas por categoria (MAI.26)",
    category: "operations",
    content: {
      total: 44636731.17,
      groups: [
        { name: "Estoque com NF", value: 36348371.57, percentage: 81.4, color: "bg-indigo-500" },
        { name: "Estoque sem NF", value: 4895800.96, percentage: 11.0, color: "bg-pink-500" },
        { name: "Guarda de Técnico", value: 817464.02, percentage: 1.8, color: "bg-cyan-500" },
        { name: "Ativos e Outros", value: 2575094.62, percentage: 5.8, color: "bg-purple-500" }
      ],
      guardaTecnica: [
        { client: "NTT", qty: 85, value: 449775.80 },
        { client: "ARCOS DOURADOS", qty: 91, value: 367688.22 }
      ],
      semNf: [
        { client: "NTT_TRAG", qty: 817, value: 4323139.16 },
        { client: "ARCOS DOURADOS REVERSA", qty: 432, value: 432000.00 },
        { client: "ARCOS DOURADOS RMA", qty: 40, value: 140661.80 }
      ],
      topProjectsWithNF: [
        { project: "NTT_SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 12644285.31, itemQty: 334 },
        { project: "NTT_PROJETO F240242 - Evotech Fase 2", value: 5625845.95, itemQty: 260 },
        { project: "NTT_GESTÃO DE SPARE - IS20405", value: 3827786.71, itemQty: 155 },
        { project: "NTT - INSTALAÇÃO DE 48 SWITCHES E 180 APS", value: 3022942.04, itemQty: 488 },
        { project: "NTT_INSTALAÇÃO 614 ANTENAS - F250727", value: 2810095.19, itemQty: 443 },
        { project: "NTT_INSTALAÇÃO DE 1793 DE SWITCH - F231490", value: 819637.20, itemQty: 138 },
        { project: "NTT - SUPORTE E MANUTENÇÃO BASE CISCO - BRADESCO", value: 664680.82, itemQty: 10 },
        { project: "NTT_SUSTENTAÇÃO 9000 SW - F221082", value: 760570.65, itemQty: 129 },
        { project: "NTT_SUSTENTAÇÃO DE 610 EQUIPAMENTOS - F231369", value: 1051704.81, itemQty: 150 },
        { project: "NTT_IMPLANTAÇÃO 9000 SW - F221082", value: 536521.49, itemQty: 86 },
        { project: "NTT_INSTALAÇÃO DE 550 SWITCH - F221082", value: 350366.27, itemQty: 259 },
        { project: "NTT_INSTALAÇÃO 300 CPE SDWAN - IS211010", value: 204459.19, itemQty: 39 },
        { project: "NTT_INSTALAÇÃO 1700 SW - IS21667", value: 177652.84, itemQty: 29 },
        { project: "NTT_USP BREAK AND FIX - F231346", value: 146799.80, itemQty: 19 },
        { project: "NTT_CHESF BREAK AND FIX - IS20652", value: 74756.08, itemQty: 7 },
        { project: "NTT_SUSTENTAÇÃO DE 124 AP - F221082", value: 67785.92, itemQty: 16 },
        { project: "NTT_SUSTENTACAO 300 CPE SDWAN - IS211010", value: 68789.24, itemQty: 13 },
        { project: "NTT_SUPORTE 1700 SW - IS21776", value: 18377.88, itemQty: 3 },
        { project: "FAISTON", value: 235500.83, itemQty: 46 },
        { project: "FLEURY", value: 176241.21, itemQty: 12 },
        { project: "VITA", value: 156094.08, itemQty: 31 },
        { project: "ITAÚ", value: 122765.00, itemQty: 136 },
        { project: "SPARE ITEMS - MPLS do cliente Banco Bradesco", value: 47968.74, itemQty: 16 },
        { project: "SDwan_250", value: 40080.70, itemQty: 22 },
        { project: "ENSONO", value: 24290.79, itemQty: 7 },
        { project: "SIMPAR", value: 23960.00, itemQty: 17 },
        { project: "MÉTODO", value: 19354.42, itemQty: 4 },
        { project: "TELCOWEB", value: 24750.00, itemQty: 11 },
        { project: "ARCOS DOURADOS", value: 16339.93, itemQty: 6 },
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
        { label: "Qtd. Total Descartada", value: 10371, type: "number" },
        { label: "Receita Líquida Lotes", value: 9720.00, type: "currency", isHighlight: true }
      ],
      lotes: [
        { name: "Lote 1", qty: 420, value: 1100.00, desc: "HDS, Notebooks, Cabos, Fontes" },
        { name: "Lote 2", qty: 334, value: 820.00, desc: "CPUs, Placas, Monitores, Chaleira" },
        { name: "Lote 3", qty: 608, value: 2300.00, desc: "Servidores, Baterias, Cabos" },
        { name: "Lote 4", qty: 4924, value: 2500.00, desc: "Fontes, Cabos, Carcaça, HDS, Placas, Fans" },
        { name: "Lote 5", qty: 4085, value: 3000.00, desc: "Antenas, Nobreak, Fontes, Monitores, Adaptadores, Switches" }
      ]
    }
  },
  {
    id: "todo-gerencial",
    number: 12,
    title: "Todo Gerencial da Logística de Custos",
    subtitle: "Resumo executivo de gastos e savings do período (MAI.26)",
    category: "financials",
    content: {
      totalSpent: 61234.09,
      totalSavings: 9280.00,
      savingsRate: 15.2,
      breakdown: [
        { category: "Transportadora", spent: 33893.50, saving: 4200.00, color: "#6366f1" },
        { category: "Correios", spent: 15118.89, saving: 1850.00, color: "#8b5cf6" },
        { category: "Cia Aérea", spent: 4532.03, saving: 980.00, color: "#3b82f6" },
        { category: "Dedicados", spent: 3495.00, saving: 1450.00, color: "#ec4899" },
        { category: "Courier (Loggi)", spent: 3077.77, saving: 650.00, color: "#06b6d4" },
        { category: "Self Storage", spent: 1116.90, saving: 150.00, color: "#10b981" }
      ],
      actions: [
        { type: "saving", text: "Renegociação BESTLOG/SCALT gerou saving de R$ 4.200 em transportadoras — contrato ajustado em ABR.26." },
        { type: "saving", text: "Otimização de rotas Dedicados (CASARINI e WASHINGTON) economizou R$ 1.450 em relação ao mês anterior." },
        { type: "alert", text: "Cia Aérea ainda acima da meta: potencial de saving adicional de R$ 1.800 via consolidação de cargas GOL." },
        { type: "next", text: "Próxima ação: Renegociação de contrato Self Storage PE prevista para JUN.26 com meta de redução de 12%." }
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
      totalProtected: 49068326.13,
      monthlyBillingCost: 65220.70,
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
        { label: "Valor Patrimonial Acumulado", value: 41244172.53, type: "currency", isHighlight: true },
        { label: "Custo Mensal da Apólice", value: 30409.62, type: "currency" },
        { label: "Limite de Cobertura Base", value: 45000000.00, type: "currency" }
      ],
      coberturas: [
        { name: "Projetos Faiston", value: 33773276.95, share: 81.89 },
        { name: "Ativos Fixos Faiston", value: 1275094.62, share: 3.09 },
        { name: "Outros e Reservas", value: 1300000.00, share: 3.15 },
        { name: "Clientes Sem NF (NTT/Arcos)", value: 4895800.96, share: 11.87 }
      ],
      semNfBreakdown: [
        { name: "NTT_TRAG", qty: 817, value: 4323139.16 },
        { name: "Arcos Dourados Reversa", qty: 432, value: 432000.00 },
        { name: "Arcos Dourados RMA", qty: 40, value: 140661.80 }
      ],
      comentarios: [
        "A apólice cobre todos os equipamentos que entraram em nosso estoque físico até a devida saída regulamentada.",
        "Destaque: NTT representa o maior volume segurado em estoque regular (projetos).",
        "Ativos Fixos abrangem estruturas físicas corporativas: notebooks, mobiliário de escritório e técnico.",
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
          totalValue: 5403140.62,
          monthlyCost: 14588.48,
          subItems: [
            { name: "Equipamentos em TRÂNSITO (Faiston)", value: 2171800.74, cost: 5863.86, rate: "0,27% a.m" },
            { name: "Guarda Técnica (Bases NTT / Arcos)", value: 3231339.88, cost: 8724.62, rate: "0,27% a.m" }
          ],
          desc: "Mitigação completa de perdas por extravio ou furto durante transferências ou estocagem temporária em hubs de terceiros."
        },
        {
          title: "Seguro ZAMP (BK Servidores)",
          totalValue: 24198.00,
          monthlyCost: 48.40,
          subItems: [
            { name: "Equipamentos Zamp BK", value: 24198.00, cost: 48.40, rate: "0,20% a.m" }
          ],
          desc: "Apólice em conformidade com o projeto specific de hardware robusto voltado a servidores do cliente Burger King (Zamp)."
        }
      ]
    }
  },
  {
    id: "seguros-trags",
    number: 16,
    title: "Seguro TRAGs & Instalações",
    subtitle: "Atuação em desativação e garantia de roubo local pós-entrega",
    category: "insurance",
    content: {
      sections: [
        {
          title: "Seguro de TRAGs (Reversa & Desativação)",
          totalValue: 428609.88,
          monthlyCost: 1157.25,
          rate: "0,27% a.m",
          phases: [
            { client: "Fase 25 - 1", val: 31748.88, minCost: 85.72 },
            { client: "Fase 25 - 2", val: 396861.00, minCost: 1071.52 }
          ],
          desc: "Cobertura de Responsabilidade Civil durante postagem e remessa de itens substituídos até a recepção física no estoque."
        },
        {
          title: "Seguro Arcos Dourados Instalação",
          totalValue: 894607.31,
          monthlyCost: 2415.44,
          rate: "0,27% a.m",
          phases: [
            { client: "Unidades em Instalação", qty: 241, val: 894607.31 }
          ],
          desc: "Janela securitária estendida de 30 dias cobrindo roubo local em lojas recém-equipadas antes da homologação final do cliente."
        }
      ]
    }
  },
  {
    id: "seguros-satelite",
    number: 17,
    title: "Seguro Starlink, Medição & Notebooks",
    subtitle: "Antenas satelitais, calibradores e notebooks corporativos",
    category: "insurance",
    content: {
      sections: [
        {
          title: "Antenas Operacionais STARLINK",
          totalValue: 1200.00,
          monthlyCost: 14.40,
          rate: "1,20% a.m",
          desc: "Cobertura física integral contra avarias climáticas ou vandalismo operacional, com participação obrigatória estabilizada de 10% sobre sinistros.",
          apolices: [
            { name: "Apólice Dedicada", value: 1200.00 }
          ]
        },
        {
          title: "Equipamento FLUKE Dedicado",
          totalValue: 105000.00,
          monthlyCost: 472.50,
          rate: "0,45% a.m",
          desc: "Garantia especial para calibradores condutivímetros portáteis de alta precisão cedidos sob regime de comodato ao parceiro T-Systems."
        },
        {
          title: "Seguro de Notebooks Corporativos",
          totalValue: 991595.79,
          monthlyCost: 16163.01,
          rate: "1,63% a.m",
          desc: "Cobertura especial para notebooks corporativos de uso externo por consultores e técnicos das operações.",
          apolices: [
            { name: "ALLCARE 49 MAQUINAS", value: 94334.70 },
            { name: "ENSONO 88 MAQUINAS", value: 590061.71 },
            { name: "METODO 51 MAQUINAS", value: 307199.38 }
          ]
        }
      ]
    }
  },
  {
    id: "custo-fatura",
    number: 18,
    title: "Composição de Despesa de Faturas de Seguros",
    subtitle: "Conciliação mensal, endossos e ajustes de mensalidade (MAI.26)",
    category: "financials",
    content: {
      total: 65220.70,
      kpis: [
        { label: "Fatura Líquida Consolidada", value: 65220.70, type: "currency", isHighlight: true }
      ],
      invoiceItems: [
        { label: "Patrimonial", name: "Seguro Patrimonial", value: 30409.62, sub: "Estoque fixo" },
        { label: "Extra", name: "Seguro Extra", value: 14588.48, sub: "Trânsito e bases satélites" },
        { label: "Notebooks", name: "Notebooks Corporativos", value: 16163.01, sub: "Equipamentos portáteis externos" },
        { label: "Arcos", name: "Arcos Dourados", value: 2415.44, sub: "Instalações" },
        { label: "TRAG", name: "Seguro TRAG 24/25", value: 1157.25, sub: "Reversas" },
        { label: "Fluke", name: "Fluke", value: 472.50, sub: "Instrumentos de medição" },
        { label: "Starlink", name: "Starlink", value: 14.40, sub: "Antenas em campo" }
      ],
      comments: [
        "Conciliação fechou com faturas auditadas e prêmios aplicados por categoria, acumulando R$ 65.220,70 mensais para uma proteção de mais de R$ 49M.",
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
