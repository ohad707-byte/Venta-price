const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_PASSWORD environment variable is not set. Refusing to start with an insecure default.');
  process.exit(1);
}
const DATA_FILE = path.join(__dirname, 'data', 'products.json');
const FULL_DATA_FILE = path.join(__dirname, 'data', 'venta-data.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readProducts() {
  if (fs.existsSync(FULL_DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(FULL_DATA_FILE, 'utf8'));
    return Array.isArray(data.products) ? data.products : [];
  }
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function readFullData(){
  if (fs.existsSync(FULL_DATA_FILE)) return JSON.parse(fs.readFileSync(FULL_DATA_FILE, 'utf8'));
  return { products: readProducts(), settings: {}, catalogImages: {} };
}
function writeProducts(products) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
}
function writeFullData(data){
  fs.mkdirSync(path.dirname(FULL_DATA_FILE), { recursive: true });
  fs.writeFileSync(FULL_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  if(Array.isArray(data.products)) writeProducts(data.products);
}
function requireAdmin(req, res, next) {
  const pass = req.header('x-admin-password') || '';
  if (pass !== ADMIN_PASSWORD) return res.status(401).send('Unauthorized');
  next();
}

app.get('/api/data', (req, res) => res.json(readFullData()));
app.post('/api/data', requireAdmin, (req, res) => {
  const data = req.body || {};
  if (!Array.isArray(data.products)) return res.status(400).send('Expected products array');
  writeFullData({ products: data.products, settings: data.settings || {}, catalogImages: data.catalogImages || {}, savedAt: new Date().toISOString() });
  res.json({ ok: true, count: data.products.length, savedAt: new Date().toISOString() });
});
app.get('/api/products', (req, res) => res.json(readProducts()));
app.post('/api/products', requireAdmin, (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).send('Expected products array');
  writeProducts(req.body);
  res.json({ ok: true, count: req.body.length, savedAt: new Date().toISOString() });
});
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`VENTA server running on port ${PORT}`));
