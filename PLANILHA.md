# Alimentando a apresentação via Google Sheets

A apresentação pode ler seus dados de uma planilha do Google Sheets em vez do
código. Isso é opcional: se a variável `VITE_GOOGLE_SHEET_ID` não estiver
configurada, o app usa os dados fixos de `src/data/slidesData.ts` normalmente.

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
5. Todo início de mês, lance os dados do mês novo (veja "Base mês a mês"
   abaixo). A apresentação busca os dados a cada carregamento da página, então
   não precisa gerar build nem fazer deploy.

## Base mês a mês (automática)

A planilha guarda o **histórico de todos os meses**. A apresentação monta
sozinha a lista de meses disponíveis, abre no mais recente e tem um seletor de
mês no cabeçalho (ao lado de "LOGÍSTICA & SEGUROS"). O mês escolhido vai pra
URL (`?mes=2026-10`), então dá pra mandar o link de um fechamento específico.

Há dois jeitos de alimentar um mês. Os dois podem ser usados juntos.

### 1. Planilhas brutas de controle (recomendado para expedições)

Vocês lançam **uma linha por expedição** nas planilhas de controle do dia a
dia, e o app calcula tudo: custo total, embarques, equipamentos, custo médio,
tabela por projeto, divisão por transportadora, rotas dos dedicados, maior e
menor custo, variação vs mês anterior e o **Custo Consolidado**. Não precisa
mais montar a "Atualização_Gráficos_Fechamento" na mão.

**Onde o app procura as linhas:**
- Aba `Expedicoes` da planilha principal (opcional).
- Aba `SelfStorage` da planilha principal (opcional).
- Qualquer planilha/aba listada na aba **`Fontes`** da planilha principal. É
  assim que vocês conectam as planilhas de controle que já usam, sem copiar
  nada: cadastra uma vez e todo mês o app lê direto delas.

**Aba `Fontes`:**
| tipo | planilha | aba | modal | transportadora |
|---|---|---|---|---|
| expedicoes | https://docs.google.com/spreadsheets/d/XXXX/edit | Correios 2026 | correios | CORREIOS |
| expedicoes | XXXX | Controle Transportadoras | | |
| self storage | | Storage | | |

- `tipo`: `expedicoes` ou `self storage`.
- `planilha`: link ou ID da planilha de controle (em branco = a própria
  planilha principal). Ela também precisa estar como **"Qualquer pessoa com
  o link" → Leitor**.
- `aba`: nome exato da aba.
- `modal` (opcional): padrão da aba inteira quando a planilha não tem coluna
  de modal (ex.: uma planilha só de Correios). Valores: `correios`,
  `transportadoras`, `cia-aerea`, `courier`, `dedicados`.
- `transportadora` (opcional): padrão quando não há coluna de transportadora.

**Colunas reconhecidas nas planilhas brutas** (o nome não precisa ser
idêntico: maiúsculas, acentos e `R$` são ignorados, e o cabeçalho pode estar
abaixo de um título, até a linha 15):

| Informação | Nomes aceitos |
|---|---|
| Mês (obrigatório: mês **ou** data) | `MES`, `MÊS REFERÊNCIA`, `COMPETÊNCIA`, `FECHAMENTO` |
| Data | `DATA EXPEDIÇÃO`, `DATA DE ENVIO`, `DATA COLETA`, `DATA EMISSÃO`, `DATA` |
| Custo (obrigatório) | `VALOR FINAL`, `CUSTO TOTAL`, `CUSTO`, `VALOR FRETE`, `FRETE`, `VALOR CTE`, `VALOR TOTAL`, `VALOR` |
| Modal | `MODAL`, `MODALIDADE`, `TIPO DE FRETE` |
| Transportadora | `TRANSPORTADORA`, `PARCEIRO`, `FORNECEDOR`, `EMPRESA` |
| Projeto | `PROJETO`, `CLIENTE`, `CENTRO DE CUSTO` |
| Embarques | `EMBARQUES`, `Nº DE EMBARQUES`, `QTD EMBARQUES` |
| Equipamentos | `QTD EQUIPAMENTOS`, `EQUIPAMENTOS`, `QUANTIDADE`, `QTD` |
| Nota fiscal | `NF`, `NF / GRM`, `NOTA FISCAL`, `CTE` |
| Rota (dedicados) | `ROTA` |
| Status | `STATUS` (linhas com `CANCELADO` são ignoradas) |
| UF / Obs (self storage) | `UF`, `ESTADO` / `OBS`, `OBSERVAÇÃO`, `DESCRIÇÃO` |

Regras de cálculo:
- **Mês**: usa a coluna de mês; sem ela, o mês da data (`13/10/2026`,
  `2026-10-13`, `OUT.26`, `10/2026`).
- **Modal**: o texto da coluna `MODAL` é classificado (`Correios/Sedex/PAC`,
  `Rodoviário/Transportadora`, `Aéreo/GOL/LATAM`, `Courier/Loggi`,
  `Dedicado`). Sem coluna, vale o `modal` da aba `Fontes`.
- **Embarques**: soma da coluna de embarques; sem ela, cada **NF distinta**
  conta como um embarque (sem NF, cada linha conta como um).
- **Equipamentos**: soma da coluna; sem ela, 1 por linha.
- Linhas sem mês/data, sem custo ou sem modal identificável são ignoradas
  (aparece um aviso no console do navegador). Linhas `TOTAL` também.
- Quando um slide de expedição tem linhas brutas no mês, elas **substituem**
  o que estiver nas abas consolidadas (`KPIs`, `Projects`...) para aquele
  slide e mês. Comentários da aba `Commentary` com o mesmo mês têm prioridade
  sobre os comentários automáticos.
- **Custo Consolidado** soma só as modalidades com dados do mês. Se faltar
  alguma, o cabeçalho mostra "⚠ Sem dados de OUT.26: Courier".
- Mantenha em cada coluna um tipo só (só números na coluna de custo, só datas
  na de data). O Google Sheets descarta na exportação as células de tipo
  diferente da maioria da coluna.

### Entrada e Saída: colar o relatório do mês de uma vez

Entrada e Saída **não** é lançada linha a linha. Todo mês vocês colam o
relatório de notas fiscais inteiro (ex.: exportado do SAP), com as linhas de
item do jeito que vier, e o app consolida: nº de NFs (distintas),
equipamentos, valor e quantidade por cliente, separado em NF Entrada e NF
Saída.

**Onde colar:**
- Aba `NotasFiscais` da planilha principal, **ou**
- Uma aba por mês com o mês no nome (ex.: `NF OUT.26`, `NF 10-2026`),
  cadastrada na aba `Fontes` com `tipo` = `notas`. Assim cada colagem fica
  guardada e o histórico se mantém. Também dá pra cadastrar uma aba só de
  entradas e outra só de saídas.

Colunas extras da aba `Fontes` (opcionais, valem pra aba inteira):
| tipo | planilha | aba | lado | mes |
|---|---|---|---|---|
| notas | | NF OUT.26 | | |
| notas | | Saídas Outubro | saida | OUT.26 |

- `mes`: o mês do relatório, quando as linhas não têm data. Também vale para
  expedições e self storage. Sem ele, o app tenta ler o mês do nome da aba.
- `lado`: `entrada` ou `saida`, quando o relatório não tem coluna que diga.

**Colunas reconhecidas no relatório de notas:**
| Informação | Nomes aceitos |
|---|---|
| Nº da NF (obrigatório) | `NF`, `Nº NF`, `NOTA FISCAL`, `NÚMERO NF`, `NF-E`, `NÚMERO` |
| Entrada/Saída | `TIPO`, `OPERAÇÃO`, `MOVIMENTO`, `E/S` (valores `Entrada`/`Saída`/`E`/`S`); ou `CFOP` (1/2/3 = entrada, 5/6/7 = saída); ou o `lado` da aba `Fontes` |
| Cliente | `PROJETO`, `CLIENTE`, `PARCEIRO`, `NOME DO PN`, `RAZÃO SOCIAL`, `DESTINATÁRIO`, `EMITENTE`, `FORNECEDOR` |
| Quantidade | `QTD EQUIPAMENTOS`, `QUANTIDADE`, `QTDE`, `QTD` (sem ela, 1 por linha) |
| Valor do item | `VALOR TOTAL ITEM`, `VALOR ITEM`, `TOTAL DA LINHA` (somado linha a linha) |
| Valor da nota | `VALOR NF`, `VALOR NOTA`, `VALOR TOTAL NF`, `TOTAL DOCUMENTO`, `VALOR TOTAL`, `VALOR` (contado **uma vez por NF**, mesmo repetido em várias linhas) |
| Data / mês | `DATA EMISSÃO`, `DATA LANÇAMENTO`, `DATA DOCUMENTO`, `DATA`, `MES` |
| Status | `STATUS`, `SITUAÇÃO` (`CANCELADA` é ignorada) |

Se o mês tiver só um dos lados (ex.: só saídas), o outro aparece zerado e o
cabeçalho avisa "⚠ Sem dados de OUT.26: NF Entrada". O app não mistura com
dados de outro mês.

### 2. Abas consolidadas com a coluna `mes`

Todas as abas descritas abaixo (`Meta`, `KPIs`, `EstoqueGroups`, seguros
etc.) aceitam uma coluna extra **`mes`** (ex.: `OUT.26`). Para fechar um mês
novo, **acrescente** as linhas com o mês novo em vez de sobrescrever as
antigas. Assim o histórico fica guardado.

- Para cada slide, o app usa as linhas do mês selecionado. Se o slide não
  tiver linhas daquele mês, usa o **último mês anterior** disponível (útil
  para estoque e seguros, que mudam pouco) e mostra no cabeçalho
  "⚠ Slide com dados de SET.26".
- Linhas sem `mes` valem como o mês de `global.mesAbrev` (aba `Meta`), ou
  seja, uma planilha antiga sem coluna `mes` continua funcionando igual.
- O mês do subtítulo (`(OUT.26)`) e o mês/ano da capa são preenchidos
  automaticamente.

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
