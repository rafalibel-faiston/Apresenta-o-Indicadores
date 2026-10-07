// Regressão da camada histórica da planilha.
//
// Rode com `npm test`. Cobre o que não pode quebrar quando a planilha vira um
// banco de meses: leitura da competência em qualquer notação, isolamento entre
// meses, o fallback para os dados do código e a geração dos slides comparativos.

import { csvToObjects } from '../src/data/sheet/csv';
import { buildWorkbook } from '../src/data/sheet/loadSlides';
import { normalizeCompetencia, competenciaAbbr } from '../src/data/sheet/competencia';
import { slidesData } from '../src/data/slidesData';

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}` + (ok ? '' : `\n      esperado ${JSON.stringify(expected)}, veio ${JSON.stringify(actual)}`));
}

// --- competência parsing -----------------------------------------------
check('mes ISO', normalizeCompetencia('2026-09'), '2026-09');
check('mes BR', normalizeCompetencia('09/2026'), '2026-09');
check('mes curto', normalizeCompetencia('SET.26'), '2026-09');
check('mes nome', normalizeCompetencia('setembro/2026'), '2026-09');
check('mes acento', normalizeCompetencia('MARÇO/2026'), '2026-03');
check('mes vazio', normalizeCompetencia(''), null);
check('mes lixo', normalizeCompetencia('abacaxi'), null);
check('abrev', competenciaAbbr('2026-09'), 'SET.26');

// --- workbook com 3 competências ---------------------------------------
const meta = csvToObjects(`mes,slide,key,value
2026-07,global,mesAbrev,JUL.26
2026-08,global,mesAbrev,AGO.26
2026-09,global,mesAbrev,SET.26
2026-07,estoque-atual,total,40000000
2026-08,estoque-atual,total,44000000
2026-09,estoque-atual,total,48249094.05
`);

const kpis = csvToObjects(`mes,slide,order,label,value,type,isHighlight
2026-07,custo-consolidado,1,Custo Logístico Total,50000,currency,TRUE
2026-08,custo-consolidado,1,Custo Logístico Total,55000,currency,TRUE
2026-09,custo-consolidado,1,Custo Logístico Total,60386.92,currency,TRUE
2026-07,correios,1,Custo Total,4000,currency,TRUE
2026-09,correios,1,Custo Total,4573.11,currency,TRUE
`);

const breakdown = csvToObjects(`mes,slide,order,category,val,share
2026-08,custo-consolidado,1,Transportadora,40000,72.7
2026-08,custo-consolidado,2,Correios,5000,9.1
2026-09,custo-consolidado,1,Transportadora,46022.29,76.21
2026-09,custo-consolidado,2,Correios,4573.11,7.57
`);

const entradaSaida = csvToObjects(`mes,slide,lado,title,nfs,equipments,value
2026-08,entrada-saida,entrada,NF Entrada,10,500,1000000
2026-08,entrada-saida,saida,NF Saída,120,280,800000
2026-09,entrada-saida,entrada,NF Entrada,12,589,1290246.36
2026-09,entrada-saida,saida,NF Saída,134,305,889918.21
`);

const data = {
  Meta: meta,
  KPIs: kpis,
  ConsolidadoBreakdown: breakdown,
  EntradaSaida: entradaSaida,
};

const wb = buildWorkbook(data as any, slidesData);

check('competências detectadas', wb.competencias.map((c) => c.competencia), ['2026-07', '2026-08', '2026-09']);
check('rótulo vem do Meta', wb.competencias.map((c) => c.abbr), ['JUL.26', 'AGO.26', 'SET.26']);
check('snapshots ordenados', wb.snapshots.map((s) => s.custoLogistico), [50000, 55000, 60386.92]);
check('estoque por mês', wb.snapshots.map((s) => s.estoqueTotal), [40000000, 44000000, 48249094.05]);
check('saída de setembro', wb.snapshots[2].saida, { nfs: 134, equipments: 305, value: 889918.21 });

// Isolamento entre meses: julho não tem breakdown, setembro tem.
check('breakdown de julho vazio', wb.snapshots[0].custoPorModalidade.length, 0);
// Agosto não preencheu nenhuma aba de estoque/correios → esses indicadores ficam
// nulos no comparativo em vez de herdar o número estático do código.
check('correios de agosto fora do comparativo', wb.snapshots[1].expedicoes[0].custo, null);
check('estoque de agosto veio da planilha', wb.snapshots[1].estoqueTotal, 44000000);
check('breakdown de setembro', wb.snapshots[2].custoPorModalidade.map((m) => m.category), ['Transportadora', 'Correios']);

// Slide de julho não pode carregar o custo de setembro.
const deckJul = wb.slidesFor('2026-07');
const correiosJul = deckJul.find((s) => s.id === 'correios');
check('correios de julho isolado', correiosJul?.content.kpis[0].value, 4000);

const deckSet = wb.slidesFor('2026-09');
const correiosSet = deckSet.find((s) => s.id === 'correios');
check('correios de setembro', correiosSet?.content.kpis[0].value, 4573.11);

// Agosto não preencheu a aba KPIs de correios → mantém o dado estático do código.
const deckAgo = wb.slidesFor('2026-08');
const correiosAgo = deckAgo.find((s) => s.id === 'correios');
const estaticoCorreios = slidesData.find((s) => s.id === 'correios') as any;
check('correios de agosto cai no estático', correiosAgo?.content.kpis[0].value, estaticoCorreios.content.kpis[0].value);

// Slides comparativos.
const evolucao = deckSet.find((s) => s.id === 'evolucao-mensal') as any;
const consolidado = deckSet.find((s) => s.id === 'comparativo-consolidado') as any;
check('slide de evolução existe', !!evolucao, true);
check('slide consolidado existe', !!consolidado, true);
check('série tem 3 pontos', evolucao.content.serie.map((p: any) => p.value), [50000, 55000, 60386.92]);
check('variação MoM de setembro', evolucao.content.kpis[1].value, '+9.8%');
check('acumulado do período', Math.round(evolucao.content.kpis[3].value), 165387);
check('consolidado tem 3 colunas', consolidado.content.meses.map((m: any) => m.label), ['JUL.26', 'AGO.26', 'SET.26']);
check('numeração sem buracos', deckSet.map((s) => s.number).every((n, i) => n === i + 1), true);
check('comparativo entra depois do custo-consolidado',
  deckSet.findIndex((s) => s.id === 'evolucao-mensal') - deckSet.findIndex((s) => s.id === 'custo-consolidado'), 1);

// Planilha legada, sem coluna de mês: continua funcionando como snapshot único.
const legacy = buildWorkbook({ KPIs: csvToObjects(`slide,order,label,value,type
correios,1,Custo Total,999,currency
`) } as any, slidesData);
check('legado sem competência', legacy.competencias.length, 0);
check('legado usa fallback', (legacy.fallbackSlides.find((s) => s.id === 'correios') as any).content.kpis[0].value, 999);

// Um único mês não gera comparativo (não há o que comparar).
const unico = buildWorkbook({ KPIs: csvToObjects(`mes,slide,order,label,value,type
2026-09,correios,1,Custo Total,999,currency
`) } as any, slidesData);
check('um mês não gera comparativo', unico.slidesFor('2026-09').some((s) => s.id === 'evolucao-mensal'), false);

console.log(failures === 0 ? '\nTODOS OS TESTES PASSARAM' : `\n${failures} TESTE(S) FALHARAM`);
process.exit(failures === 0 ? 0 : 1);
