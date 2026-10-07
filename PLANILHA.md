# Alimentando a apresentação via Google Sheets

A apresentação pode ler seus dados de uma planilha do Google Sheets em vez do
código. Isso é opcional: se a variável `VITE_GOOGLE_SHEET_ID` não estiver
configurada, o app usa os dados fixos de `src/data/slidesData.ts` normalmente.

## A coluna `mes` — a planilha é um histórico, não uma foto

**Toda aba aceita uma coluna `mes`**, e é ela que transforma a planilha num
banco de dados de indicadores. A regra é simples: **ninguém apaga nada**. Todo
mês você acrescenta linhas novas com a competência daquele mês, e os meses
anteriores continuam ali, intactos.

| mes | slide | order | label | value | type |
|---|---|---|---|---|---|
| `2026-08` | `correios` | 1 | Custo Total | 4011.20 | currency |
| `2026-09` | `correios` | 1 | Custo Total | 4573.11 | currency |

Com o histórico preenchido o app ganha duas coisas:

- **Seletor de competência** no cabeçalho: dá para reabrir qualquer mês já
  apresentado, exatamente como ele foi apresentado. O link aceita `?mes=2026-09`
  para abrir direto num mês específico.
- **Dois slides comparativos automáticos**, que não existem em mês nenhum da
  planilha porque são calculados a partir dela: *Evolução Mensal do Custo
  Logístico* (série histórica, variação mês a mês e variação por modalidade) e
  *Comparativo Consolidado* (todos os indicadores × todas as competências, com
  a coluna de fechamento do período).

Ambos aparecem sozinhos a partir da **segunda** competência preenchida — com um
mês só não há o que comparar.

### Formatos aceitos na coluna `mes`

Escreva como for mais natural; o app normaliza todos para a mesma competência:

`2026-09` · `09/2026` · `SET.26` · `set/26` · `setembro/2026` · `SETEMBRO 2026`

### Regras da coluna `mes`

- **Deixar `mes` em branco** faz a linha valer para **todos** os meses. Use isso
  só para constantes que não mudam (um título, um texto fixo). Números do mês
  nunca devem ficar sem competência.
- Uma planilha **sem nenhuma coluna `mes`** continua funcionando como antes,
  como uma foto de um mês só — nada quebra, só não existe comparativo.
- **Um mês só entra no comparativo nas abas que ele realmente preencheu.** Se
  setembro tem `KPIs` mas ninguém preencheu `ConsolidadoBreakdown`, a
  apresentação de setembro continua mostrando o dado do código (para nunca ficar
  vazia), mas o comparativo mostra `—` naquela linha em vez de repetir um número
  que não é daquele mês. Na prática: **preencha o mês inteiro**, senão o
  histórico fica furado.
- `global.mesAbrev` pode ter uma linha por competência, para controlar o rótulo
  (`SET.26`) que aparece no cabeçalho e nos gráficos daquele mês. Sem ele, o
  rótulo é gerado automaticamente a partir da competência.

## Como funciona

- Uma única planilha do Google Sheets, com várias **abas** (guias na parte
  inferior), uma para cada tipo de informação.
- A planilha precisa estar compartilhada como **"Qualquer pessoa com o
  link" → Leitor**. Não é necessário publicar na web nem criar chave de API.
- O app lê cada aba pela URL pública de exportação em CSV do Google Sheets
  (não depende de login nem de credenciais).
- Ao abrir a apresentação, ela busca todas as abas e substitui os dados
  estáticos. Se uma aba estiver vazia, com nome errado, ou a planilha estiver
  fora do ar, o app mantém os últimos dados que já tinha no código — a
  apresentação nunca fica quebrada por causa da planilha.
- Você pode preencher só algumas abas para começar; o resto continua vindo
  do código até você preencher.

## Configuração

1. Crie a planilha no Google Sheets com as abas descritas abaixo (nomes
   **exatamente** como especificado, sensível a maiúsculas/minúsculas).
2. Compartilhe: botão **Compartilhar** → **Qualquer pessoa com o link** →
   permissão **Leitor**.
3. Copie o ID da planilha a partir da URL:
   `https://docs.google.com/spreadsheets/d/`**`ESTE_TRECHO`**`/edit`
4. Configure a variável de ambiente `VITE_GOOGLE_SHEET_ID` com esse ID
   (no Railway: Settings → Variables; localmente: copie `env.example` para
   `.env` e cole o ID).
5. Todo início de mês, abra a planilha e **acrescente** as linhas do mês novo,
   preenchendo a coluna `mes` com a competência (ex.: `2026-10`). Não apague nem
   sobrescreva os meses anteriores — é o histórico deles que alimenta os slides
   comparativos. A apresentação busca os dados a cada carregamento da página —
   não precisa gerar build nem fazer deploy.

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

Os slides `evolucao-mensal` e `comparativo-consolidado` são **gerados** a partir
do histórico — não têm abas próprias e não devem aparecer na coluna `slide`.

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
