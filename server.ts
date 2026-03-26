import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AWS RDS PostgreSQL Pool
const pool = new Pool({
  host: process.env.AWS_DB_HOST,
  port: parseInt(process.env.AWS_DB_PORT || '5432'),
  user: process.env.AWS_DB_USER,
  password: process.env.AWS_DB_PASSWORD,
  database: process.env.AWS_DB_NAME,
  ssl: process.env.AWS_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Initialize database tables
async function initDb() {
  if (!process.env.AWS_DB_HOST) {
    console.warn('AWS_DB_HOST not set. Skipping database initialization.');
    return;
  }
  
  try {
    const client = await pool.connect();
    console.log('Connected to AWS RDS PostgreSQL');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS vat_returns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        status TEXT NOT NULL,
        period TEXT NOT NULL,
        vat_ref TEXT,
        period_from TEXT,
        period_to TEXT,
        total_sales NUMERIC,
        total_vat NUMERIC,
        total_expenses NUMERIC,
        total_recoverable_vat NUMERIC,
        net_vat NUMERIC,
        due_date TEXT,
        filed_at TEXT,
        form_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        tax_type TEXT NOT NULL,
        trn TEXT NOT NULL,
        status TEXT NOT NULL,
        effective_date TEXT,
        entity_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        status TEXT NOT NULL,
        due_date TEXT,
        paid_at TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS correspondence (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        from_name TEXT,
        date TEXT,
        type TEXT,
        status TEXT,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        vat_return_id TEXT,
        file_name TEXT NOT NULL,
        file_type TEXT,
        file_data TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS corporate_tax_returns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        accounting_period TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL,
        profit_before_tax NUMERIC,
        tax_adjustments NUMERIC,
        taxable_profit NUMERIC,
        tax_rate NUMERIC,
        tax_payable NUMERIC,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vat_refunds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        period TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        status TEXT NOT NULL,
        requested_at TEXT,
        processed_at TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    client.release();
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "EmaraTax API is running with AWS RDS" });
  });

  // AWS RDS API Routes
  app.get("/api/vat-returns", async (req, res) => {
    const { userId } = req.query;
    try {
      const result = userId 
        ? await pool.query('SELECT * FROM vat_returns WHERE user_id = $1 ORDER BY period DESC', [userId])
        : await pool.query('SELECT * FROM vat_returns ORDER BY period DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/vat-returns/:id", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM vat_returns WHERE id = $1', [req.params.id]);
      res.json(result.rows[0] || null);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/vat-returns", async (req, res) => {
    const data = req.body;
    try {
      if (data.id) {
        const { id, ...rest } = data;
        const keys = Object.keys(rest).map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
        const values = Object.values(rest);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        await pool.query(`UPDATE vat_returns SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`, [...values, id]);
        res.json({ id });
      } else {
        const keys = Object.keys(data).map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
        const values = Object.values(data);
        const columns = keys.join(', ');
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const result = await pool.query(`INSERT INTO vat_returns (${columns}) VALUES (${placeholders}) RETURNING id`, values);
        res.json({ id: result.rows[0].id });
      }
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.delete("/api/vat-returns/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM vat_returns WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Corporate Tax Routes
  app.get("/api/corporate-tax-returns", async (req, res) => {
    const { userId } = req.query;
    try {
      const result = userId 
        ? await pool.query('SELECT * FROM corporate_tax_returns WHERE user_id = $1 ORDER BY accounting_period DESC', [userId])
        : await pool.query('SELECT * FROM corporate_tax_returns ORDER BY accounting_period DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/corporate-tax-returns", async (req, res) => {
    const data = req.body;
    try {
      const keys = Object.keys(data).map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
      const values = Object.values(data);
      const columns = keys.join(', ');
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(`INSERT INTO corporate_tax_returns (${columns}) VALUES (${placeholders}) RETURNING id`, values);
      res.json({ id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.delete("/api/corporate-tax-returns/:id", async (req, res) => {
    try {
      await pool.query('DELETE FROM corporate_tax_returns WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // VAT Refund Routes
  app.get("/api/vat-refunds", async (req, res) => {
    const { userId } = req.query;
    try {
      const result = userId 
        ? await pool.query('SELECT * FROM vat_refunds WHERE user_id = $1 ORDER BY created_at DESC', [userId])
        : await pool.query('SELECT * FROM vat_refunds ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/vat-refunds", async (req, res) => {
    const data = req.body;
    try {
      const keys = Object.keys(data).map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
      const values = Object.values(data);
      const columns = keys.join(', ');
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(`INSERT INTO vat_refunds (${columns}) VALUES (${placeholders}) RETURNING id`, values);
      res.json({ id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Registrations
  app.get("/api/registrations", async (req, res) => {
    const { userId } = req.query;
    try {
      const result = userId 
        ? await pool.query('SELECT * FROM registrations WHERE user_id = $1', [userId])
        : await pool.query('SELECT * FROM registrations');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/payments", async (req, res) => {
    const { userId } = req.query;
    try {
      const result = userId 
        ? await pool.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY due_date DESC', [userId])
        : await pool.query('SELECT * FROM payments ORDER BY due_date DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/correspondence", async (req, res) => {
    const { userId } = req.query;
    try {
      const result = userId 
        ? await pool.query('SELECT * FROM correspondence WHERE user_id = $1 ORDER BY created_at DESC', [userId])
        : await pool.query('SELECT * FROM correspondence ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/documents", async (req, res) => {
    const { userId, vatReturnId } = req.query;
    try {
      let queryStr = 'SELECT * FROM documents';
      const params = [];
      if (userId) {
        queryStr += ' WHERE user_id = $1';
        params.push(userId);
      } else if (vatReturnId) {
        queryStr += ' WHERE vat_return_id = $1';
        params.push(vatReturnId);
      }
      queryStr += ' ORDER BY created_at DESC';
      const result = await pool.query(queryStr, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    const data = req.body;
    try {
      const keys = Object.keys(data).map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
      const values = Object.values(data);
      const columns = keys.join(', ');
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(`INSERT INTO documents (${columns}) VALUES (${placeholders}) RETURNING id`, values);
      res.json({ id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
      res.json(result.rows[0] || null);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
