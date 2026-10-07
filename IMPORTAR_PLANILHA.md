# Gerar a apresentação a partir da planilha de fechamento

Todo mês: abra a apresentação, clique em **Importar planilha** (botão verde no topo),
arraste a planilha `Atualização Gráficos Fechamento <Mês>.xlsx` e clique em
**Aplicar na apresentação**. Depois exporte normalmente (PPT / ZIP / PNG).

- A leitura da planilha roda no navegador. Ao aplicar, o .xlsx é salvo **no
  servidor (Postgres)** e passa a valer para **todo mundo** que abrir a
  apresentação, em qualquer navegador ou computador.
- O mês da apresentação vem do nome do arquivo (`... Out.26.xlsx` → `OUT.26`) e
  pode ser corrigido na própria janela antes de aplicar.
- O selo no topo mostra o arquivo em uso: verde = salvo no servidor, cinza =
  salvando, amarelo = não salvou (só você está vendo; passe o mouse para ver o
  motivo). **Restaurar** volta todo mundo para os dados originais do código.
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
| Faturas — CNPJ Principal | `Consolidado seguro` | Tabela `SEGURO / CUSTO`. `ESTORNO` (ou valor negativo) vira crédito |
| Descarte Sustentável | `SANLIEN` | Só **adiciona lotes novos**. Os lotes que já estão no slide não mudam |

**Ficam como estão (não estão na planilha):** Laboratório Técnico, Fatura do CNPJ
de Gerenciamento e os textos descritivos (descrições de seguros, textos das UFs
do Self Storage, comentários fixos).

## Banco de dados (Railway)

Cada importação vira uma linha na tabela `planilhas` (criada sozinha no primeiro
start). A ativa é a mais recente; **Restaurar** só desativa, nada é apagado, então
o histórico de todos os meses fica guardado.

Configuração no Railway:

1. No projeto, **+ New → Database → PostgreSQL**.
2. No serviço da apresentação, em **Variables**, crie
   `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (referência ao banco, usa a rede
   interna, sem SSL).
3. Opcional: `IMPORT_TOKEN = <uma senha>`. Com ela, importar e restaurar pedem a
   senha (lembrada no navegador depois da primeira vez). Sem ela, qualquer pessoa
   com o link pode trocar a planilha.
4. Faça o redeploy. Em `/api/health` deve aparecer `"storage":"postgres"`.

Sem `DATABASE_URL` o servidor salva em `data/planilha.json`: serve para rodar
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
  `GET/PUT/DELETE /api/planilha`. `server/store.mjs`: Postgres ou arquivo local.
- `src/data/workbook/storage.ts`: chamadas à API (e o pedido de senha).
- Para rodar local: `npm run dev:server` (API na porta 3000) e `npm run dev` em
  outro terminal (o Vite repassa `/api` para a 3000). Ou `npm run build && npm start`.

- `src/data/workbook/readXlsx.ts`: leitor de .xlsx (usa o JSZip, que já era
  dependência).
- `src/data/workbook/grid.ts`: funções para achar tabelas pelo texto do cabeçalho.
- `src/data/workbook/importWorkbook.ts`: um `importXxx` por slide, registrado em
  `IMPORTERS`. Para um slide novo (ex.: faturas de cartão de crédito), crie a
  função e adicione na lista.
- `src/components/ImportWorkbookModal.tsx`: a janela de importação.
