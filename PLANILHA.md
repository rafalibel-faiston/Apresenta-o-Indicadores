# Alimentando a apresentação via planilha Excel (.xlsx)

Os dados da apresentação (`src/data/slidesData.ts`) são gerados a partir de
uma planilha Excel (`.xlsx`), rodando um comando no terminal. Não é
necessário editar código nem mexer em nenhum serviço externo — só preencher a
planilha e rodar o import.

## Como funciona

- Um único arquivo `.xlsx`, com várias **abas** (guias na parte inferior),
  uma para cada tipo de informação — os nomes e colunas de cada aba estão
  documentados mais abaixo.
- Rode `npm run importar-planilha -- caminho/para/arquivo.xlsx`. O comando lê
  o arquivo, atualiza `src/data/slidesData.ts` com os dados novos e arquiva o
  mês anterior automaticamente (ver seção seguinte).
- Se uma aba estiver ausente ou vazia, o app mantém os dados que já tinha
  naquela aba — a importação nunca quebra a apresentação por causa de uma
  aba faltando.
- Você pode preencher só algumas abas para começar; o resto continua vindo
  dos dados já salvos até você preencher.

## Configuração

1. Crie a planilha `.xlsx` com as abas descritas abaixo (nomes **exatamente**
   como especificado, sensível a maiúsculas/minúsculas).
2. Preencha os números do mês.
3. Rode:
   ```
   npm run importar-planilha -- caminho/para/arquivo.xlsx
   ```
4. Confira o resultado (`git diff` em `src/data/slidesData.ts` e
   `src/data/meta.ts`) e faça o commit/push normalmente — o site é
   redeployado a partir daí.

## Importando a planilha e guardando o histórico dos meses anteriores

Rodar `npm run importar-planilha -- arquivo.xlsx` faz o seguinte:

1. Lê todas as abas do arquivo `.xlsx`.
2. **Antes** de sobrescrever qualquer coisa, salva uma cópia completa do mês
   que estava salvo até então em `src/data/history/AAAA-MM.json` — os dados
   dos meses anteriores nunca são perdidos.
3. Atualiza `src/data/slidesData.ts` com os dados novos da planilha (esses
   passam a ser os dados fixos exibidos pela apresentação).
4. Atualiza `src/data/meta.ts` com o novo mês (`currentMesAbrev`).

Depois de rodar, confira o `git diff` e faça o commit normalmente — é o mesmo
fluxo que já era feito manualmente todo mês (ver histórico de commits tipo
"Atualiza dados dos slides com fechamento de JUN.26"), só que automático.

Na apresentação, um seletor de mês aparece no cabeçalho (ao lado de
"LOGÍSTICA & SEGUROS · MÊS.AA") sempre que houver algum mês arquivado,
permitindo visualizar/exportar os slides de meses anteriores.

## Formato dos números

- Escreva números simples nas células: `1234.56` ou `1234,56` (os dois
  funcionam). **Não** escreva `R$ 1.234,56` com o símbolo — deixe só o
  número; a formatação em Real é feita pelo próprio app.
- Colunas booleanas (`isHighlight`, `utilizado`, `isCredit`) aceitam
  `TRUE`/`FALSE`, `SIM`/`NAO` ou `1`/`0`. Deixe em branco para "não".
- A coluna `order` (quando existir) define a ordem de exibição das linhas
  daquela aba — use `1`, `2`, `3`... Se ficar em branco, a ordem some para 0
  (pode misturar linhas de slides/tabs diferentes na mesma aba sem problema).

## IDs de slide válidos

Use exatamente estes valores na coluna `slide`:

| slide id | Título |
|---|---|
| `capa` | Capa |
| `correios` | Expedições Correios |
| `transportadoras` | Expedições Transportadoras |
| `cia-aerea` | Expedições Cia Aérea |
| `courier` | Expedições Courier |
| `dedicados` | Expedições Dedicados |
| `self-storage` | Custo mensal Self Storage |
| `custo-consolidado` | Custo Consolidado Logística |
| `entrada-saida` | Consolidado Entrada e Saída |
| `estoque-atual` | Estoque Atual |
| `descarte-sustentavel` | Descarte Sustentável Salien |
| `todo-gerencial` | Todo Gerencial da Logística de Custos |
| `divisor-seguros` | Divisor "Departamento de Seguros" |
| `seguros-patrimonial` | Garantia Patrimonial de Estoque |
| `seguros-extra` | Seguros de Trânsito & Guarda Técnica |
| `seguros-trags` | Seguro TRAGs e Arcos Dourados |
| `seguros-satelite` | Seguro Starlink & Medição |
| `custo-fatura` | Composição de Despesa de Faturas de Seguros |

O slide `agradecimento` (contato) não tem dados mensais e não precisa de
planilha.

## Abas e colunas

### `Meta` — valores únicos por slide
| slide | key | value |
|---|---|---|
| `global` | `mesAbrev` | `JUL.26` |
| `capa` | `slogan` | Evoluindo junto com nossos clientes |
| `capa` | `departamento` | LOGÍSTICA & SEGUROS |
| `capa` | `mes` | JULHO |
| `capa` | `year` | 2026 |
| `divisor-seguros` | `totalProtected` | 47802282.29 |
| `divisor-seguros` | `monthlyBillingCost` | 52656.22 |
| `divisor-seguros` | `activePolicies` | 7 |
| `estoque-atual` | `total` | 43865390.68 |
| `custo-fatura` | `total` | 53423.07 |
| `todo-gerencial` | `totalSaving` | 41270.98 |
| `todo-gerencial` | `totalUtilizado` | 19040.33 |
| `todo-gerencial` | `saldoSaving` | 22230.65 |

`global.mesAbrev` também atualiza o "JUN.26" que aparece no cabeçalho do app.

### `Slides` — título/subtítulo (opcional)
| slide | title | subtitle |
|---|---|---|
| `correios` | Expedições Correios | Consolidado por projeto - Custos, embarques e equipamentos (JUL.26) |

Deixe em branco qualquer slide cujo título/subtítulo não precisa mudar.

### `KPIs` — cartões de destaque no topo de vários slides
| slide | order | label | value | type | isHighlight |
|---|---|---|---|---|---|
| `correios` | 1 | Custo Total | 8501.43 | currency | TRUE |
| `correios` | 2 | Total Embarques | 167 | number | |

`type`: `currency`, `number` ou `text`. Usada por: `correios`, `cia-aerea`,
`courier`, `dedicados`, `self-storage`, `descarte-sustentavel`,
`seguros-patrimonial`, `custo-fatura`. (`transportadoras` também usa KPIs,
ver aba `Projects`/`Distribution` abaixo — os KPIs dela vêm da mesma aba
`KPIs`.)

### `Commentary` — observações/comentários em texto
| slide | order | type | text |
|---|---|---|---|
| `correios` | 1 | info | Maior custo: ZAMP – R$ 2.984,49 |
| `correios` | 2 | success | Menor custo: ACER – R$ 9,94 |

`type`: `info`, `success`, `stats` ou `link` (deixe em branco = `info`).
Usada por: `correios`, `transportadoras`, `cia-aerea`, `courier`,
`dedicados`, `self-storage`. Também é reaproveitada (ignorando a coluna
`type`) para os textos simples de `seguros-patrimonial` (comentários) e
`custo-fatura` (observações de conciliação).

### `Projects` — tabela de projetos (custo/embarques/equipamentos)
| slide | order | project | cost | shipments | equipments | averageCost |
|---|---|---|---|---|---|---|
| `correios` | 1 | ZAMP | 2984.49 | 35 | 35 | 85.27 |

Deixe `shipments`/`equipments`/`averageCost` em branco se não existirem para
aquele slide. Usada por: `correios`, `transportadoras`, `cia-aerea`,
`courier`, `dedicados`.

### `Distribution` — divisão por transportadora (só `transportadoras`)
| slide | order | name | value | percentage |
|---|---|---|---|---|
| `transportadoras` | 1 | BESTLOG | 15011.77 | 39.36 |

### `Rotas` e `RotasBreakdown` — só `dedicados`
`Rotas`: `slide | order | transportadora | total`
`RotasBreakdown`: `slide | rotaOrder | project | val` (`rotaOrder` = valor da
coluna `order` da linha correspondente em `Rotas`)

| slide | order | transportadora | total |
|---|---|---|---|
| `dedicados` | 1 | CASARINI | 2450.00 |

| slide | rotaOrder | project | val |
|---|---|---|---|
| `dedicados` | 1 | NTT | 1200.00 |
| `dedicados` | 1 | ZAMP | 500.00 |

### `Regions` — só `self-storage`
| slide | order | uf | project | cost | text |
|---|---|---|---|---|---|
| `self-storage` | 1 | PE | NTT | 446.76 | Estrutura dedicada em Recife |

### `ConsolidadoBreakdown` e `ConsolidadoProjects` — só `custo-consolidado`
`ConsolidadoBreakdown`: `slide | order | category | val | share`
`ConsolidadoProjects`: `slide | order | name | value`

### `EntradaSaida` e `EntradaSaidaDetails` — só `entrada-saida`
`EntradaSaida`: `slide | lado | title | nfs | equipments | value`
(`lado` = `entrada` ou `saida`, uma linha para cada)
`EntradaSaidaDetails`: `slide | lado | order | client | qty`

### Estoque Atual — `EstoqueGroups`, `EstoqueGuardaTecnica`, `EstoqueAtivosOutros`, `EstoqueSemNf`, `EstoqueTopProjetos`
- `EstoqueGroups`: `slide | order | name | value | percentage`
- `EstoqueGuardaTecnica`: `slide | order | client | qty | value`
- `EstoqueAtivosOutros`: `slide | order | name | value | desc`
- `EstoqueSemNf`: `slide | order | client | qty | value`
- `EstoqueTopProjetos`: `slide | order | project | value | itemQty`

(o valor total do estoque fica na aba `Meta`, chave `total`)

### `DescarteLotes` — só `descarte-sustentavel`
`slide | order | name | qty | value | desc`

### Todo Gerencial — `TodoSavingItems`, `TodoUtilizadoItems`, `TodoSavingAnual`
- `TodoSavingItems`: `slide | order | item | desc | qty | value | utilizado | obs`
- `TodoUtilizadoItems`: `slide | order | desc | value | obs`
- `TodoSavingAnual`: `slide | order | item | desc | mensal | anual`

(totais gerais ficam na aba `Meta`: `totalSaving`, `totalUtilizado`,
`saldoSaving`)

### Seguros — `SegurosCoberturas`, `SegurosSemNfBreakdown` (só `seguros-patrimonial`)
- `SegurosCoberturas`: `slide | order | name | value | share`
- `SegurosSemNfBreakdown`: `slide | order | name | qty | value`

### Seguros — `SegurosSections`, `SegurosSubItems`, `SegurosPhases`, `SegurosApolices` (`seguros-extra`, `seguros-trags`, `seguros-satelite`)
`SegurosSections`: `slide | order | title | totalValue | monthlyCost | rate | desc`
(cada linha é um "bloco" de seguro; `monthlyCost`, `rate` e `desc` são opcionais)

As três abas abaixo referenciam a seção pelo `order` dela em `SegurosSections`
(coluna `sectionOrder`) — preencha só a que se aplica a cada seção:
- `SegurosSubItems`: `slide | sectionOrder | name | value | cost | rate`
- `SegurosPhases`: `slide | sectionOrder | client | val | minCost | qty`
- `SegurosApolices`: `slide | sectionOrder | name | value | cost`

### `FaturaInvoiceItems` — só `custo-fatura`
`slide | order | label | name | value | sub | isCredit`

(o total da fatura fica na aba `Meta`, chave `total`; as observações de
conciliação usam a aba `Commentary`)

## O que continua fixo no código

Cores, ícones, classes visuais e o slide de contato (`agradecimento`) não
vêm da planilha — continuam definidos em `src/data/slidesData.ts` e nos
componentes em `src/components/`.
