const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
