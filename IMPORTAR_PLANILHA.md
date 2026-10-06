# Gerar a apresentação a partir da planilha de fechamento

Todo mês: abra a apresentação, clique em **Importar planilha** (botão verde no topo),
arraste a planilha `Atualização Gráficos Fechamento <Mês>.xlsx` e clique em
**Aplicar na apresentação**. Depois exporte normalmente (PPT / ZIP / PNG).

- Tudo roda no navegador. A planilha não é enviada para nenhum servidor.
- O mês da apresentação vem do nome do arquivo (`... Out.26.xlsx` → `OUT.26`) e
  pode ser corrigido na própria janela antes de aplicar.
- A planilha fica salva **neste navegador**. Ao recarregar a página, os dados
  importados continuam lá. O selo verde no topo mostra o arquivo em uso, e
  **Restaurar** volta aos dados originais do código.
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

## Cuidados no Excel

- Mantenha os cabeçalhos com os mesmos nomes. Maiúsculas e acentos não importam.
- Cada tabela termina numa linha `TOTAL` ou numa linha em branco.
- Atualize as tabelas dinâmicas (**Dados → Atualizar Tudo**) e salve antes de
  importar. O app lê o último valor calculado que o Excel salvou.
- Na aba `Consolidado seguro`, o importador avisa quando a coluna `FATURA` aponta
  para um mês muito anterior ao da apresentação. É sinal de que a aba não foi
  atualizada.

## Para quem for mexer no código

- `src/data/workbook/readXlsx.ts`: leitor de .xlsx (usa o JSZip, que já era
  dependência).
- `src/data/workbook/grid.ts`: funções para achar tabelas pelo texto do cabeçalho.
- `src/data/workbook/importWorkbook.ts`: um `importXxx` por slide, registrado em
  `IMPORTERS`. Para um slide novo (ex.: faturas de cartão de crédito), crie a
  função e adicione na lista.
- `src/components/ImportWorkbookModal.tsx`: a janela de importação.
