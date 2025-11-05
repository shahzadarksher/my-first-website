const path = require('path');
const fs = require('fs');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbFile = path.join(dataDir, 'db.json');
const adapter = new JSONFile(dbFile);
// Provide default data shape to satisfy lowdb requirements
const db = new Low(adapter, { bookings: [], contacts: [] });

async function init() {
  await db.read();
  db.data = db.data || { bookings: [], contacts: [] };
  await db.write();
}

module.exports = { db, init, dbFile };
