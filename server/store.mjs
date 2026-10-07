// Base histórica das planilhas de fechamento: uma planilha por competência
// (mês, AAAA-MM). Subir de novo o mesmo mês substitui a versão atual, mas a
// anterior continua na tabela (ativa = false) — nada é apagado de verdade.

import fs from 'node:fs/promises';
import path from 'node:path';

export async function createStore(databaseUrl, dataDir) {
  return databaseUrl ? createPostgresStore(databaseUrl) : createFileStore(dataDir);
}

// "OUT.26" → "2026-10". O front já valida o formato MMM.AA antes de enviar.
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
export function competenciaFromLabel(monthLabel) {
  const m = /^([A-Z]{3})\.(\d{2})$/.exec(monthLabel || '');
  const idx = m ? MONTHS.indexOf(m[1]) : -1;
  return idx < 0 ? null : `20${m[2]}-${String(idx + 1).padStart(2, '0')}`;
}

async function createPostgresStore(databaseUrl) {
  const { default: pg } = await import('pg');
  // Rede interna do Railway (*.railway.internal) não usa SSL; URL pública com
  // ?sslmode=require (ou PGSSLMODE=require) liga o SSL.
  const wantsSsl = /sslmode=require/i.test(databaseUrl) || process.env.PGSSLMODE === 'require';
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: wantsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS planilhas (
      id           SERIAL PRIMARY KEY,
      competencia  TEXT        NOT NULL,
      file_name    TEXT        NOT NULL,
      month_label  TEXT        NOT NULL,
      data         BYTEA       NOT NULL,
      imported_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      ativa        BOOLEAN     NOT NULL DEFAULT true
    );
    CREATE INDEX IF NOT EXISTS planilhas_competencia_idx ON planilhas (competencia, ativa);
  `);

  const toDto = (row) => ({
    id: row.id,
    competencia: row.competencia,
    fileName: row.file_name,
    monthLabel: row.month_label,
    importedAt: row.imported_at.toISOString(),
  });

  return {
    kind: 'postgres',
    async listActive() {
      const { rows } = await pool.query(
        `SELECT id, competencia, file_name, month_label, imported_at FROM planilhas
          WHERE ativa ORDER BY competencia`
      );
      return rows.map(toDto);
    },
    async getFile(id) {
      const { rows } = await pool.query('SELECT data FROM planilhas WHERE id = $1', [id]);
      return rows[0]?.data ?? null;
    },
    async save({ competencia, fileName, monthLabel, data }) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Serializa uploads do mesmo mês, para nunca ficarem duas versões ativas.
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [competencia]);
        await client.query('UPDATE planilhas SET ativa = false WHERE ativa AND competencia = $1', [competencia]);
        const { rows } = await client.query(
          `INSERT INTO planilhas (competencia, file_name, month_label, data) VALUES ($1, $2, $3, $4)
           RETURNING id, competencia, file_name, month_label, imported_at`,
          [competencia, fileName, monthLabel, data]
        );
        await client.query('COMMIT');
        return toDto(rows[0]);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
    async remove(competencia) {
      await pool.query('UPDATE planilhas SET ativa = false WHERE ativa AND competencia = $1', [competencia]);
    },
    close: () => pool.end(),
  };
}

async function createFileStore(dataDir) {
  console.warn('[planilha] DATABASE_URL não definida — salvando em arquivos locais (só para desenvolvimento).');
  const indexFile = path.join(dataDir, 'planilhas.json');
  const fileFor = (id) => path.join(dataDir, `planilha-${id}.xlsx`);

  const readIndex = async () => {
    try {
      return JSON.parse(await fs.readFile(indexFile, 'utf8'));
    } catch {
      return [];
    }
  };
  const writeIndex = async (rows) => {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(indexFile, JSON.stringify(rows, null, 2));
  };
  const toDto = ({ ativa, ...row }) => row;

  return {
    kind: 'arquivo-local',
    async listActive() {
      return (await readIndex())
        .filter((r) => r.ativa)
        .sort((a, b) => (a.competencia < b.competencia ? -1 : 1))
        .map(toDto);
    },
    async getFile(id) {
      try {
        return await fs.readFile(fileFor(id));
      } catch {
        return null;
      }
    },
    async save({ competencia, fileName, monthLabel, data }) {
      const rows = await readIndex();
      const id = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(fileFor(id), data);
      rows.forEach((r) => {
        if (r.competencia === competencia) r.ativa = false;
      });
      const row = { id, competencia, fileName, monthLabel, importedAt: new Date().toISOString(), ativa: true };
      rows.push(row);
      await writeIndex(rows);
      return toDto(row);
    },
    async remove(competencia) {
      const rows = await readIndex();
      rows.forEach((r) => {
        if (r.competencia === competencia) r.ativa = false;
      });
      await writeIndex(rows);
    },
    close: async () => {},
  };
}
