# Gerar a apresentação a partir da planilha de fechamento

Todo mês: abra a apresentação, clique em **Importar planilha** (botão verde no topo),
arraste a planilha `Atualização Gráficos Fechamento <Mês>.xlsx` e clique em
**Salvar mês na base**. Depois exporte normalmente (PPT / ZIP / PNG).

- **Cada planilha vira um mês na base de dados** (Postgres). Os meses vão se
  acumulando e ficam disponíveis para todo mundo, em qualquer navegador.
- O mês vem do nome do arquivo (`... Out.26.xlsx` → `OUT.26`) e pode ser
  corrigido na janela antes de salvar. Ele define a capa, o cabeçalho e os
  subtítulos.
- Depois de salvar, a apresentação abre direto no mês importado. O **seletor de
  mês** no topo troca entre todos os meses da base (os vindos de planilha
  aparecem com a marca "· planilha"), e o link fica com `?mes=AAAA-MM` para
  compartilhar o mês exato.
- Com **2 meses ou mais**, entram os slides **Evolução Mensal do Custo
  Logístico** e **Comparativo Consolidado**, logo depois do Custo Consolidado.
  Só entram na comparação os slides que a planilha daquele mês realmente
  preencheu.
- **Comparar só alguns meses**: com 3 meses ou mais na base, a parte da direita
  do botão **Comparativos** (ao lado do seletor de mês) abre a escolha. Marque os meses que devem entrar nos
  slides comparativos (o mês aberto sempre entra) ou use um atalho: **Todos**,
  **Últimos 3 meses**, **Nº trimestre** do mês aberto e **Mesmo mês do ano
  anterior**. A variação passa a ser contra o mês escolhido (ex.: "Variação vs.
  OUT.25"), e os subtítulos avisam que é um recorte. A escolha fica no link
  (`?comparar=2025-10,2026-10`) e vale também para o PPT/ZIP/PNG exportado.
- **Comparativos ligados/desligados**: o botão **Comparativos** no topo tem uma
  chave. Desligada, os dois slides comparativos saem da apresentação (e do
  PPT/ZIP/PNG). O link guarda a escolha (`?comparativos=0`).
- O **Comparativo Consolidado** é visual: colunas empilhadas com o custo por
  modalidade em cada mês (passe o mouse para ver o valor de cada modalidade) e
  um card por indicador com mini gráfico dos meses — o mês aberto em azul.
  A variação fica verde quando é boa notícia (custo caindo, receita subindo) e
  neutra quando não é nem boa nem ruim (estoque, notas). O botão **Tabela**
  mostra os números lado a lado.
- Subir de novo um mês que já existe **substitui** aquele mês (a janela avisa).
  A versão anterior continua guardada no banco.
- **Base de meses** (botão no topo) lista todos os meses: dá para abrir
  qualquer um ou **apagar** da base. Apagar remove a planilha daquele mês de
  vez (todas as versões) e não dá para desfazer. Meses que vêm do Google
  Sheets só saem editando a planilha online.
- O ícone 📊 no topo indica que o mês aberto veio de planilha: verde = salva,
  cinza = salvando, amarelo = não salvou (só você está vendo; passe o mouse para
  ver o motivo).
- Antes de aplicar, a janela mostra um relatório por slide:
  - ✅ **Atualizado**: veio da planilha.
  - ⚠️ **Conferir**: veio da planilha, mas algum total não bateu ou falta algo.
  - ➖ **Mantido**: a planilha não tem esse dado; o slide continua como estava.

## De onde sai cada slide

As tabelas são localizadas pelo **texto dos cabeçalhos**, não pela posição das
células. Mover uma tabela de lugar não quebra nada. O que quebra é renomear o
cabeçalho (ex.: trocar `PROJETO` por `CLIENTE`).

| Slide | Aba | O que é lido |
|---|---|---|
| Expedições Correios | `CORREIOS` | Tabela `PROJETO / Custo / Embarques / Equipamentos` |
| Expedições Transportadoras | `TRANSPORTADORAS` | Um bloco por transportadora. O nome vem do título `NOME - MÊS` acima da tabela, e blocos com custo zero são ignorados. A soma é conferida com a aba `RESUMO` |
| Expedições Cia Aérea | `GOL` (+ `LATAM`/`AZUL` se estiverem visíveis) | Tabela `PROJETO / Custo / Equipamentos` |
| Expedições Courier | `LOGGI` | Tabela `PROJETO / Custo / Embarques / Equipamentos` |
| Expedições Dedicados | `Consolidado Dedicados` | Matriz `PROJETO / <motoristas> / Qtd. Equipamentos / Custo Total` |
| Self Storage | `SELF STORAGE` | Tabela `UF / PROJETO / Custo Total`, conferida com o último mês da coluna `CUSTO` |
| Custo Consolidado | calculado | Soma das 6 modalidades acima, conferida com o `Total Geral` da aba `Base Consolidado` |
| Entrada e Saída | `Notas Saída` | Primeiro bloco `NF / ENTRADA / SAÍDA` (o mais alto da aba) e tabela `CLIENTE / QUANTIDADE` |
| Estoque Atual | `Seguro` | Linha `ESTOQUE C/ NF / SEM NF / GUARDA / ATIVOS / Total Geral`, tabelas `Cliente sem NF`, `PROJETO / ITEM / VALOR GUARDA`, `ATIVOS` / `OUTROS` e a tabela dinâmica `Soma de Valor` |
| Garantia Patrimonial | calculado | Estoque total − Guarda de Técnico (a guarda é coberta pelo Seguro Extra) |
| Seguro Extra | `Seguro` | Bloco `EXTRA` |
| TRAGs e Arcos Dourados | `Seguro` | Blocos `TRAG` e `ARCOS DOURADOS` |
| Starlink & Medição | `Seguro` | Blocos `CONECT` (apólices Starlink) e `FLUKE` |
| Divisor de Seguros | calculado | Soma dos valores segurados e custos mensais dos slides de seguro |
| Faturas — CNPJ Principal | `FATURA` (planilhas antigas: `Consolidado seguro`) | Tabela `SEGURO / CUSTO` abaixo do título `CUSTO FATURA CNPJ PRINCIPAL`. `ESTORNO` (ou valor negativo) vira crédito. A soma é conferida com a linha `TOTAL` |
| Faturas — CNPJ Gerenciamento | `FATURA` | Tabela `SEGURO / CUSTO` abaixo do título `CUSTO FATURA CNPJ GERENCIAMENTO`, conferida com a linha `TOTAL` |
| Laboratório Técnico | `Laboratorio Técnico` | Uma linha por chamado: `Chamado` (cliente), `Modelo`, `SITUAÇÃO 2` (o que foi feito), `DATA` (`OK`/`BAD` + data) e `PEÇAS PARA REPOSIÇÃO E OBSERVAÇÕES`. `OK` = reparado; `BAD` ou em branco = sem reparo/pendente. Os cards são agrupados por cliente e o mês do subtítulo vem das datas da coluna `DATA` |
| Descarte Sustentável | `SANLIEN` | Só **adiciona lotes novos**. Os lotes que já estão no slide não mudam |

**Ficam como estão (não estão na planilha):** os textos descritivos (descrições
de seguros, textos das UFs do Self Storage, comentários fixos).

## Banco de dados (Railway)

Tabela `planilhas` (criada sozinha no primeiro start): uma linha por upload, com
a competência (`AAAA-MM`), o nome do arquivo e o .xlsx original. Para cada mês,
vale a linha mais recente com `ativa = true`. Substituir um mês só desativa a
versão antiga; **apagar** o mês remove todas as linhas dele.

O banco guarda o .xlsx, não os slides prontos: cada mês é recalculado com o
código atual, então correções no importador valem também para os meses antigos.
O navegador baixa cada arquivo uma vez só e depois usa o cache.

Configuração no Railway:

1. No projeto, **+ New → Database → PostgreSQL**.
2. No serviço da apresentação, em **Variables**, crie
   `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (referência ao banco, usa a rede
   interna, sem SSL).
3. Opcional: `IMPORT_TOKEN = <uma senha>`. Com ela, importar e restaurar pedem a
   senha (lembrada no navegador depois da primeira vez). Sem ela, qualquer pessoa
   com o link pode trocar a planilha.
4. Faça o redeploy. Em `/api/health` deve aparecer `"storage":"postgres"`.

Sem `DATABASE_URL` o servidor salva em `data/`: serve para rodar
local, mas no Railway esse arquivo some a cada deploy.

## Cuidados no Excel

- Mantenha os cabeçalhos com os mesmos nomes. Maiúsculas e acentos não importam.
- Cada tabela termina numa linha `TOTAL` ou numa linha em branco.
- Atualize as tabelas dinâmicas (**Dados → Atualizar Tudo**) e salve antes de
  importar. O app lê o último valor calculado que o Excel salvou.
- Na aba `Consolidado seguro`, o importador avisa quando a coluna `FATURA` aponta
  para um mês muito anterior ao da apresentação. É sinal de que a aba não foi
  atualizada.

## Para quem for mexer no código

- `server/index.mjs`: servidor Node (sem framework) que entrega o `dist/` e a API
  (`GET /api/planilhas`, `GET /api/planilhas/arquivo/:id`,
  `PUT|DELETE /api/planilhas/:AAAA-MM`). `server/store.mjs`: Postgres ou arquivos locais.
- `src/data/workbook/storage.ts`: chamadas à API (e o pedido de senha).
- `src/data/hub.ts`: junta os meses do Google Sheets com os meses importados num
  histórico só e gera os slides comparativos.
- `src/data/recorte.ts` + `src/components/CompareMonthsPicker.tsx`: o botão
  **Comparativos** (liga/desliga, recorte de meses, atalhos, `?comparar=` e
  `?comparativos=0` na URL).
- `src/components/ComparativeCharts.tsx`: colunas empilhadas por modalidade e
  cards de indicador do Comparativo Consolidado.
- `src/components/MonthsBaseModal.tsx`: a janela **Base de meses**.
- Para rodar local: `npm run dev:server` (API na porta 3000) e `npm run dev` em
  outro terminal (o Vite repassa `/api` para a 3000). Ou `npm run build && npm start`.

- `src/data/workbook/readXlsx.ts`: leitor de .xlsx (usa o JSZip, que já era
  dependência).
- `src/data/workbook/grid.ts`: funções para achar tabelas pelo texto do cabeçalho.
- `src/data/workbook/importWorkbook.ts`: um `importXxx` por slide, registrado em
  `IMPORTERS`. Para um slide novo (ex.: faturas de cartão de crédito), crie a
  função e adicione na lista.
- `src/components/ImportWorkbookModal.tsx`: a janela de importação.
