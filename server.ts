import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    displayName TEXT,
    role TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS vat_returns (
    id TEXT PRIMARY KEY,
    userId TEXT,
    status TEXT,
    period TEXT,
    vatRef TEXT,
    periodFrom TEXT,
    periodTo TEXT,
    taxYearEnd TEXT,
    totalSales REAL,
    totalVAT REAL,
    totalExpenses REAL,
    totalRecoverableVAT REAL,
    netVAT REAL,
    dueDate TEXT,
    filedAt TEXT,
    updatedAt TEXT,
    createdAt TEXT,
    formData TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT,
    type TEXT,
    amount REAL,
    status TEXT,
    dueDate TEXT,
    paidAt TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS corporate_tax_returns (
    id TEXT PRIMARY KEY,
    userId TEXT,
    status TEXT,
    period TEXT,
    netTax REAL,
    dueDate TEXT,
    filedAt TEXT,
    updatedAt TEXT,
    createdAt TEXT,
    formData TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS correspondence (
    id TEXT PRIMARY KEY,
    userId TEXT,
    subject TEXT,
    fromName TEXT,
    date TEXT,
    status TEXT,
    content TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    userId TEXT,
    taxType TEXT,
    trn TEXT,
    status TEXT,
    effectiveDate TEXT,
    entityName TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    userId TEXT,
    vatReturnId TEXT,
    fileName TEXT,
    fileType TEXT,
    fileData TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(vatReturnId) REFERENCES vat_returns(id)
  );
`);

// Seed Database
async function seedDatabase() {
  console.log('Clearing and seeding database with mock data...');
  
  // Clear existing data
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM registrations').run();
  db.prepare('DELETE FROM vat_returns').run();
  db.prepare('DELETE FROM corporate_tax_returns').run();
  db.prepare('DELETE FROM payments').run();
  db.prepare('DELETE FROM correspondence').run();

  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin', 10);
  const now = new Date().toISOString();

  // Create Users
  const users = [
    { id: 'admin-id', username: 'admin', email: 'jinzstallionz@gmail.com', password: adminPassword, displayName: 'MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C', role: 'admin' },
    { id: 'user-1', username: 'corporate_user', email: 'corporate@example.com', password: hashedPassword, displayName: 'Global Trading LLC', role: 'corporate' },
    { id: 'user-2', username: 'person_user', email: 'person@example.com', password: hashedPassword, displayName: 'John Doe', role: 'person' },
    { id: 'user-3', username: 'company1', email: 'company1@example.com', password: hashedPassword, displayName: 'Al-Futtaim Group LLC', role: 'corporate' },
    { id: 'user-4', username: 'company2', email: 'company2@example.com', password: hashedPassword, displayName: 'Emirates Logistics Solutions', role: 'corporate' },
    { id: 'user-5', username: 'company3', email: 'company3@example.com', password: hashedPassword, displayName: 'Dubai Tech Innovations', role: 'corporate' }
  ];

  const insertUser = db.prepare('INSERT INTO users (id, username, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  // Helper to seed data for a user
  const seedUserData = (userId: string, entityName: string, index: number) => {
    const trnVat = `10023456789${index}003`;
    const trnCt = `20098765432${index}001`;
    
    // Create Registrations
    const registrations = [
      { id: `reg-vat-${userId}`, userId, taxType: 'VAT', trn: trnVat, status: 'Active', effectiveDate: '2024-01-01', entityName },
      { id: `reg-ct-${userId}`, userId, taxType: 'Corporate Tax', trn: trnCt, status: 'Active', effectiveDate: '2024-06-01', entityName }
    ];
    const insertReg = db.prepare('INSERT INTO registrations (id, userId, taxType, trn, status, effectiveDate, entityName, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of registrations) {
      insertReg.run(r.id, r.userId, r.taxType, r.trn, r.status, r.effectiveDate, r.entityName, now);
    }

    // Create VAT Returns
    const createVatFormData = (period: string, periodFrom: string, periodTo: string, taxYearEnd: string, totalSales: number, totalVAT: number, totalExpenses: number, totalRecoverableVAT: number, dueDate: string, vatRef: string, goodsImportedAmount: number = 0, goodsImportedVat: number = 0, dubaiSalesAmount: number = 0, dubaiSalesVat: number = 0, stdExpensesAmount: number = 0, stdExpensesVat: number = 0) => ({
      vatRef,
      period,
      periodFrom,
      periodTo,
      taxYearEnd,
      dueDate,
      status: 'Submitted',
      stagger: 'Stagger 2 - Quarterly (Mar to Feb)',
      sales: {
        standardRated: {
          abuDhabi: { amount: 0, vat: 0, adjustment: 0 },
          dubai: { amount: dubaiSalesAmount, vat: dubaiSalesVat, adjustment: 0 },
          sharjah: { amount: 0, vat: 0, adjustment: 0 },
          ajman: { amount: 0, vat: 0, adjustment: 0 },
          ummAlQuwain: { amount: 0, vat: 0, adjustment: 0 },
          rasAlKhaimah: { amount: 0, vat: 0, adjustment: 0 },
          fujairah: { amount: 0, vat: 0, adjustment: 0 },
        },
        touristRefunds: { amount: 0, vat: 0, adjustment: 0 },
        reverseCharge: { amount: 0, vat: 0 },
        zeroRated: { amount: 0 },
        exempt: { amount: 0 },
        goodsImported: { amount: goodsImportedAmount, vat: goodsImportedVat },
        adjustmentsImports: { amount: 0, vat: 0 },
      },
      expenses: {
        standardRated: { amount: stdExpensesAmount, vat: stdExpensesVat, adjustment: 0 },
        reverseCharge: { amount: goodsImportedAmount, vat: goodsImportedVat, adjustment: 0 },
      },
      refundRequest: 'Yes',
      profitMarginScheme: 'No'
    });

    const vatReturns = [
      { 
        id: `vat-img-1-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/12/2025 - 28/02/2026', 
        vatRef: `23001016596${index}`,
        periodFrom: '01/12/2025',
        periodTo: '28/02/2026',
        taxYearEnd: '28/02/2026',
        totalSales: 3121416.78 + (index * 10000), 
        totalVAT: (3121416.78 + (index * 10000)) * 0.05, 
        totalExpenses: 2558941.13 + (index * 5000), 
        totalRecoverableVAT: (2558941.13 + (index * 5000)) * 0.05, 
        netVAT: (3121416.78 + (index * 10000)) * 0.05 - (2558941.13 + (index * 5000)) * 0.05, 
        dueDate: '30/03/2026', 
        filedAt: '2026-03-23T19:40:03Z', 
        formData: createVatFormData(
          '01/12/2025 - 28/02/2026', 
          '01/12/2025', 
          '28/02/2026', 
          '28/02/2026', 
          3121416.78 + (index * 10000), 
          (3121416.78 + (index * 10000)) * 0.05, 
          2558941.13 + (index * 5000), 
          (2558941.13 + (index * 5000)) * 0.05, 
          '30/03/2026', 
          `23001016596${index}`, 
          519580.13, 
          25979.01,
          2601836.65,
          130091.83,
          2039361.00,
          101968.05
        )
      },
      { 
        id: `vat-img-2-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/09/2025 - 30/11/2025', 
        vatRef: `23000965020${index}`,
        periodFrom: '01/09/2025',
        periodTo: '30/11/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 0, 
        totalVAT: 0, 
        totalExpenses: 445976.20, 
        totalRecoverableVAT: 22298.81, 
        netVAT: 22298.81, 
        dueDate: '29/12/2025', 
        filedAt: '2025-12-25T10:00:00Z', 
        formData: createVatFormData('01/09/2025 - 30/11/2025', '01/09/2025', '30/11/2025', '28/02/2026', 0, 0, 445976.20, 22298.81, '29/12/2025', `23000965020${index}`)
      },
      { 
        id: `vat-img-3-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/06/2025 - 31/08/2025', 
        vatRef: `23000900787${index}`,
        periodFrom: '01/06/2025',
        periodTo: '31/08/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 0, 
        totalVAT: 0, 
        totalExpenses: 123245.60, 
        totalRecoverableVAT: 6162.28, 
        netVAT: 6162.28, 
        dueDate: '29/09/2025', 
        filedAt: '2025-09-26T10:00:00Z', 
        formData: createVatFormData('01/06/2025 - 31/08/2025', '01/06/2025', '31/08/2025', '28/02/2026', 0, 0, 123245.60, 6162.28, '29/09/2025', `23000900787${index}`)
      },
      { 
        id: `vat-img-4-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/03/2025 - 31/05/2025', 
        vatRef: `23000834946${index}`,
        periodFrom: '01/03/2025',
        periodTo: '31/05/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 132939.60, 
        totalVAT: 6646.98, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 6646.98, 
        dueDate: '30/06/2025', 
        filedAt: '2025-06-24T10:00:00Z', 
        formData: createVatFormData('01/03/2025 - 31/05/2025', '01/03/2025', '31/05/2025', '28/02/2026', 132939.60, 6646.98, 0, 0, '30/06/2025', `23000834946${index}`)
      },
      { 
        id: `vat-img-5-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/12/2024 - 28/02/2025', 
        vatRef: `23000792304${index}`,
        periodFrom: '01/12/2024',
        periodTo: '28/02/2025',
        taxYearEnd: '28/02/2025',
        totalSales: 499780.20, 
        totalVAT: 24989.01, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 24989.01, 
        dueDate: '28/03/2025', 
        filedAt: '2025-03-25T10:00:00Z', 
        formData: createVatFormData('01/12/2024 - 28/02/2025', '01/12/2024', '28/02/2025', '28/02/2025', 499780.20, 24989.01, 0, 0, '28/03/2025', `23000792304${index}`)
      },
      { 
        id: `vat-img-6-${userId}`, 
        userId, 
        status: 'Overdue', 
        period: '01/09/2024 - 30/11/2024', 
        vatRef: `23000712345${index}`,
        periodFrom: '01/09/2024',
        periodTo: '30/11/2024',
        taxYearEnd: '28/02/2025',
        totalSales: 250000.00, 
        totalVAT: 12500.00, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 12500.00, 
        dueDate: '29/12/2024', 
        filedAt: null, 
        formData: createVatFormData('01/09/2024 - 30/11/2024', '01/09/2024', '30/11/2024', '28/02/2025', 250000.00, 12500.00, 0, 0, '29/12/2024', `23000712345${index}`)
      }
    ];
    const insertVAT = db.prepare(`
      INSERT INTO vat_returns (id, userId, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of vatReturns) {
      insertVAT.run(v.id, v.userId, v.status, v.period, v.vatRef, v.periodFrom, v.periodTo, v.taxYearEnd, v.totalSales, v.totalVAT, v.totalExpenses, v.totalRecoverableVAT, v.netVAT, v.dueDate, v.filedAt, now, now, JSON.stringify(v.formData));
    }

    // Create Corporate Tax Returns
    const ctReturns = [
      { id: `ct-1-${userId}`, userId, status: 'Submitted', period: '2023', netTax: 45000 + (index * 1000), dueDate: '2024-09-30', filedAt: '2024-08-15', formData: { taxableIncome: 500000 + (index * 10000) } },
      { id: `ct-2-${userId}`, userId, status: 'Draft', period: '2024', netTax: 0, dueDate: '2025-09-30', filedAt: null, formData: { taxableIncome: 0 } }
    ];
    const insertCT = db.prepare(`
      INSERT INTO corporate_tax_returns (id, userId, status, period, netTax, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of ctReturns) {
      insertCT.run(c.id, c.userId, c.status, c.period, c.netTax, c.dueDate, c.filedAt, now, now, JSON.stringify(c.formData));
    }

    // Create Payments
    const payments = [
      { id: `pay-1-${userId}`, userId, type: 'VAT Payment', amount: 28123.78 + (index * 100), status: 'Outstanding', dueDate: '30/03/2026', paidAt: null },
      { id: `pay-2-${userId}`, userId, type: 'VAT Payment', amount: 22298.81, status: 'Paid', dueDate: '29/12/2025', paidAt: '2025-12-27' },
      { id: `pay-3-${userId}`, userId, type: 'VAT Payment', amount: 6162.28, status: 'Paid', dueDate: '29/09/2025', paidAt: '2025-09-25' },
      { id: `pay-4-${userId}`, userId, type: 'VAT Payment', amount: 6646.98, status: 'Paid', dueDate: '30/06/2025', paidAt: '2025-06-28' },
      { id: `pay-5-${userId}`, userId, type: 'VAT Payment', amount: 24989.01, status: 'Paid', dueDate: '28/03/2025', paidAt: '2025-03-26' },
      { id: `pay-6-${userId}`, userId, type: 'VAT Payment', amount: 12500.00, status: 'Outstanding', dueDate: '29/12/2024', paidAt: null },
      { id: `pay-ct-1-${userId}`, userId, type: 'Corporate Tax', amount: 45000 + (index * 1000), status: 'Outstanding', dueDate: '30/09/2024', paidAt: null }
    ];
    const insertPayment = db.prepare(`
      INSERT INTO payments (id, userId, type, amount, status, dueDate, paidAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of payments) {
      insertPayment.run(p.id, p.userId, p.type, p.amount, p.status, p.dueDate, p.paidAt, now);
    }

    // Create Correspondence
    const correspondence = [
      { id: `msg-1-${userId}`, userId, subject: 'VAT Registration Approved', fromName: 'FTA Admin', date: '2024-01-12', status: 'Read', content: `Your VAT registration for ${entityName} has been approved. Your TRN is ${trnVat}.` },
      { id: `msg-2-${userId}`, userId, subject: 'Corporate Tax Deadline Reminder', fromName: 'Tax System', date: '2024-08-01', status: 'Unread', content: 'This is a reminder that your Corporate Tax return for 2023 is due by 30 Sep 2024.' },
      { id: `msg-3-${userId}`, userId, subject: 'Tax Certificate Issued', fromName: 'FTA Admin', date: '2024-05-15', status: 'Read', content: 'Your Tax Residency Certificate has been issued and is available for download.' }
    ];
    const insertMsg = db.prepare(`
      INSERT INTO correspondence (id, userId, subject, fromName, date, status, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of correspondence) {
      insertMsg.run(m.id, m.userId, m.subject, m.fromName, m.date, m.status, m.content, now);
    }
  };

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    insertUser.run(u.id, u.username, u.email, u.password, u.displayName, u.role, now);
    seedUserData(u.id, u.displayName, i);
  }

  console.log('Database seeded successfully.');
}

async function startServer() {
  await seedDatabase();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { username, password, displayName, role } = req.body;
    console.log(`Registration attempt for: ${username}`);
    const id = Math.random().toString(36).substr(2, 9);
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = `${username.toLowerCase()}@emara.tax`;
    const createdAt = new Date().toISOString();

    try {
      const stmt = db.prepare('INSERT INTO users (id, username, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, username, email, hashedPassword, displayName, role || 'corporate', createdAt);
      console.log(`User created: ${username}`);
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      console.error(`Registration failed for ${username}:`, err);
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);
    // Try to find user by username or email
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;

    if (!user) {
      console.log(`User not found: ${username}`);
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`User found: ${user.username}, Password match: ${passwordMatch}`);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Auto-create admin if not exists and trying to login with admin/admin
      if (username === 'admin' && password === 'admin') {
        console.log('Auto-creating admin user...');
        const id = 'admin-id';
        const hashedPassword = await bcrypt.hash('admin', 10);
        const email = 'admin@emara.tax';
        const createdAt = new Date().toISOString();
        db.prepare('INSERT OR IGNORE INTO users (id, username, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          id, 'admin', email, hashedPassword, 'MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C', 'admin', createdAt
        );
        const newUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;
        const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        console.log('Admin auto-created and logged in.');
        return res.json({ user: { id: newUser.id, username: newUser.username, displayName: newUser.displayName, role: newUser.role } });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, username, email, displayName, role, createdAt FROM users WHERE id = ?').get(req.user.id) as any;
    res.json(user);
  });

  // VAT Return Routes
  app.get('/api/vat_returns', authenticateToken, (req: any, res) => {
    try {
      const returns = db.prepare('SELECT * FROM vat_returns WHERE userId = ? ORDER BY updatedAt DESC').all(req.user.id);
      res.json(returns.map((r: any) => ({ 
        ...r, 
        formData: r.formData ? JSON.parse(r.formData) : null 
      })));
    } catch (error) {
      console.error('Error in GET /api/vat_returns:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const r = db.prepare('SELECT * FROM vat_returns WHERE id = ? AND userId = ?').get(req.params.id, req.user.id) as any;
    if (!r) return res.sendStatus(404);
    res.json({ 
      ...r, 
      formData: r.formData ? JSON.parse(r.formData) : null 
    });
  });

  app.post('/api/vat_returns', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO vat_returns (id, userId, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, req.user.id, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, 
      status === 'Submitted' ? now : null, now, now, JSON.stringify(formData)
    );
    
    res.status(201).json({ id });
  });

  app.put('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const { status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE vat_returns 
      SET status = ?, period = ?, vatRef = ?, periodFrom = ?, periodTo = ?, taxYearEnd = ?, totalSales = ?, totalVAT = ?, totalExpenses = ?, totalRecoverableVAT = ?, netVAT = ?, dueDate = ?, filedAt = ?, updatedAt = ?, formData = ?
      WHERE id = ? AND userId = ?
    `);
    
    const result = stmt.run(
      status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate,
      status === 'Submitted' ? now : null, now, JSON.stringify(formData),
      req.params.id, req.user.id
    );
    
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Updated' });
  });

  app.delete('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const result = db.prepare('DELETE FROM vat_returns WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Deleted' });
  });

  // Payment Routes
  app.get('/api/payments', authenticateToken, (req: any, res) => {
    const payments = db.prepare('SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
    res.json(payments);
  });

  app.post('/api/payments', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { type, amount, status, dueDate } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO payments (id, userId, type, amount, status, dueDate, paidAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, type, amount, status, dueDate, status === 'Paid' ? now : null, now);
    res.status(201).json({ id });
  });

  app.put('/api/payments/:id', authenticateToken, (req: any, res) => {
    const { status } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE payments 
      SET status = ?, paidAt = ?
      WHERE id = ? AND userId = ?
    `);
    
    const result = stmt.run(status, status === 'Paid' ? now : null, req.params.id, req.user.id);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Payment updated' });
  });

  // Corporate Tax Routes
  app.get('/api/corporate_tax_returns', authenticateToken, (req: any, res) => {
    try {
      const returns = db.prepare('SELECT * FROM corporate_tax_returns WHERE userId = ? ORDER BY updatedAt DESC').all(req.user.id);
      res.json(returns.map((r: any) => ({ 
        ...r, 
        formData: r.formData ? JSON.parse(r.formData) : null 
      })));
    } catch (error) {
      console.error('Error in GET /api/corporate_tax_returns:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/corporate_tax_returns', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { status, period, netTax, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO corporate_tax_returns (id, userId, status, period, netTax, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, status, period, netTax, dueDate, status === 'Submitted' ? now : null, now, now, JSON.stringify(formData));
    res.status(201).json({ id });
  });

  app.delete('/api/corporate_tax_returns/:id', authenticateToken, (req: any, res) => {
    const result = db.prepare('DELETE FROM corporate_tax_returns WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Deleted' });
  });

  // Correspondence Routes
  app.get('/api/correspondence', authenticateToken, (req: any, res) => {
    const correspondence = db.prepare('SELECT * FROM correspondence WHERE userId = ? ORDER BY date DESC').all(req.user.id);
    res.json(correspondence);
  });

  app.get('/api/registrations', authenticateToken, (req: any, res) => {
    const registrations = db.prepare('SELECT * FROM registrations WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
    res.json(registrations);
  });

  // Document Routes
  app.get('/api/documents', authenticateToken, (req: any, res) => {
    const docs = db.prepare(`
      SELECT d.id, d.userId, d.vatReturnId, d.fileName, d.fileType, d.createdAt, v.vatRef 
      FROM documents d
      JOIN vat_returns v ON d.vatReturnId = v.id
      WHERE d.userId = ? 
      ORDER BY d.createdAt DESC
    `).all(req.user.id);
    res.json(docs);
  });

  app.get('/api/documents/:vatReturnId', authenticateToken, (req: any, res) => {
    const docs = db.prepare('SELECT id, userId, vatReturnId, fileName, fileType, createdAt FROM documents WHERE userId = ? AND vatReturnId = ?').all(req.user.id, req.params.vatReturnId);
    res.json(docs);
  });

  app.get('/api/documents/download/:id', authenticateToken, (req: any, res) => {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND userId = ?').get(req.params.id, req.user.id) as any;
    if (!doc) return res.sendStatus(404);
    res.json(doc);
  });

  app.post('/api/documents/upload', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { vatReturnId, fileName, fileType, fileData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO documents (id, userId, vatReturnId, fileName, fileType, fileData, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, vatReturnId, fileName, fileType, fileData, now);
    res.status(201).json({ id });
  });

  app.post('/api/send-receipt', authenticateToken, (req: any, res) => {
    const { amount, reference, email } = req.body;
    const fromEmail = 'fta@payaetax.online';
    const toEmail = email || 'fta@payaetax.online';
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    // 1. Log the "email" sending
    console.log(`[EMAIL SIMULATION] Sending receipt from ${fromEmail} to ${toEmail}`);
    console.log(`[EMAIL SIMULATION] Subject: Payment Receipt - ${reference}`);
    console.log(`[EMAIL SIMULATION] Body: Thank you for your payment of AED ${amount.toLocaleString()}. Reference: ${reference}`);

    // 2. Insert into correspondence (Customer Portal Inbox)
    const content = `
      Dear Taxpayer,
      
      This is an official receipt for your VAT payment.
      
      Payment Reference: ${reference}
      Amount Paid: AED ${amount.toLocaleString()}
      Date: ${new Date().toLocaleString()}
      
      Thank you for your compliance.
      
      Federal Tax Authority
    `;
    
    const stmt = db.prepare(`
      INSERT INTO correspondence (id, userId, subject, fromName, date, status, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, `Payment Receipt - ${reference}`, 'Federal Tax Authority', now, 'Unread', content, now);
    
    res.status(200).json({ success: true, id });
  });

  // API 404 Handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Global API Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.path.startsWith('/api/')) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
