// Onde a planilha importada fica guardada. Cada importação vira uma linha nova
// (histórico completo); a ativa é a mais recente com ativa = true. "Restaurar"
// só desativa — nada é apagado.

import fs from 'node:fs/promises';
import path from 'node:path';

export async function createStore(databaseUrl, dataDir) {
  return databaseUrl ? createPostgresStore(databaseUrl) : createFileStore(dataDir);
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
      file_name    TEXT        NOT NULL,
      month_label  TEXT        NOT NULL,
      data         BYTEA       NOT NULL,
      imported_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      ativa        BOOLEAN     NOT NULL DEFAULT true
    );
    CREATE INDEX IF NOT EXISTS planilhas_ativa_idx ON planilhas (ativa, imported_at DESC);
  `);

  const toDto = (row) => ({
    fileName: row.file_name,
    monthLabel: row.month_label,
    importedAt: row.imported_at.toISOString(),
  });

  return {
    kind: 'postgres',
    async getActive() {
      const { rows } = await pool.query(
        `SELECT file_name, month_label, imported_at, data FROM planilhas
          WHERE ativa ORDER BY imported_at DESC, id DESC LIMIT 1`
      );
      return rows[0] ? { ...toDto(rows[0]), base64: rows[0].data.toString('base64') } : null;
    },
    async save({ fileName, monthLabel, data }) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('UPDATE planilhas SET ativa = false WHERE ativa');
        const { rows } = await client.query(
          `INSERT INTO planilhas (file_name, month_label, data) VALUES ($1, $2, $3)
           RETURNING file_name, month_label, imported_at`,
          [fileName, monthLabel, data]
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
    async clear() {
      await pool.query('UPDATE planilhas SET ativa = false WHERE ativa');
    },
    close: () => pool.end(),
  };
}

async function createFileStore(dataDir) {
  console.warn('[planilha] DATABASE_URL não definida — salvando em arquivo local (só para desenvolvimento).');
  const file = path.join(dataDir, 'planilha.json');

  return {
    kind: 'arquivo-local',
    async getActive() {
      try {
        return JSON.parse(await fs.readFile(file, 'utf8'));
      } catch {
        return null;
      }
    },
    async save({ fileName, monthLabel, data }) {
      const value = { fileName, monthLabel, importedAt: new Date().toISOString(), base64: data.toString('base64') };
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(file, JSON.stringify(value));
      const { base64, ...meta } = value;
      return meta;
    },
    async clear() {
      await fs.rm(file, { force: true });
    },
    close: async () => {},
  };
}
