const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, init } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from repository root (dev convenience)
app.use(express.static(path.join(__dirname)));

// API endpoints using lowdb (JSON file)
app.post('/api/book', async (req, res) => {
  const payload = req.body || {};
  if (!payload.name || !payload.email || !payload.date) {
    return res.status(400).json({ success: false, error: 'name, email and date are required' });
  }
  try {
    await db.read();
    db.data = db.data || { bookings: [], contacts: [] };
    const record = { id: Date.now(), tour: payload.tour || '', name: payload.name, email: payload.email, date: payload.date, created: new Date().toISOString() };
    db.data.bookings.push(record);
    await db.write();
    res.json({ success: true, record });
  } catch (err) {
    console.error('db write error', err);
    res.status(500).json({ success: false, error: 'failed to persist booking' });
  }
});

app.post('/api/contact', async (req, res) => {
  const payload = req.body || {};
  if (!payload.name || !payload.email) {
    return res.status(400).json({ success: false, error: 'name and email are required' });
  }
  try {
    await db.read();
    db.data = db.data || { bookings: [], contacts: [] };
    const record = { id: Date.now(), name: payload.name, email: payload.email, message: payload.message || '', created: new Date().toISOString() };
    db.data.contacts.push(record);
    await db.write();
    res.json({ success: true, record });
  } catch (err) {
    console.error('db write error', err);
    res.status(500).json({ success: false, error: 'failed to persist contact message' });
  }
});

// Admin read endpoints (dev only)
// Optional admin token middleware: if ADMIN_TOKEN env var is set, require it via ?token= or x-admin-token header
function requireAdmin(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return next();
  const token = req.query.token || req.headers['x-admin-token'];
  if (token === adminToken) return next();
  return res.status(401).json({ success: false, error: 'admin token required' });
}

// Admin read endpoints (dev only)
app.get('/api/bookings', requireAdmin, async (req, res) => {
  try {
    await db.read();
    res.json({ success: true, bookings: (db.data && db.data.bookings) ? db.data.bookings.slice().reverse() : [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'failed to read bookings' });
  }
});

app.get('/api/contacts', requireAdmin, async (req, res) => {
  try {
    await db.read();
    res.json({ success: true, contacts: (db.data && db.data.contacts) ? db.data.contacts.slice().reverse() : [] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'failed to read contacts' });
  }
});

// Initialize DB and start server
(async () => {
  await init();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
})();
