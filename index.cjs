const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  'https://mnmadqwegllaihcznifw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubWFkcXdlZ2xsYWloY3puaWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDkyNTMsImV4cCI6MjA2MDM4NTI1M30.loO6g-NyqAnMNmX_1enQhcRLx8SWEgsgsfK6DL8_KjY'
);

// Sample endpoint: Get all exams
app.get('/api/exams', async (req, res) => {
  const { data, error } = await supabase.from('exams').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Sample endpoint: Create a new exam
app.post('/api/exams', async (req, res) => {
  const { name, date } = req.body;
  const { data, error } = await supabase.from('exams').insert([{ name, date }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password, role, program, subject } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Check if user exists
    const { data: existing, error: findErr } = await supabase.from('users').select('*').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    // Insert user
    const { data, error } = await supabase.from('users').insert([
      { name, email, password_hash, role, program: program || null, subject: subject || null }
    ]).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    // Create JWT for immediate login after registration
    const token = jwt.sign({ id: data.id, email: data.email, role: data.role }, 'examflow_secret', { expiresIn: '2h' });
    res.status(201).json({
      token,
      user: { id: data.id, name: data.name, email: data.email, role: data.role, program: data.program, subject: data.subject }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    // Create JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'examflow_secret', { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, program: user.program, subject: user.subject } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get current user from JWT
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const user = jwt.verify(token, 'examflow_secret');
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
