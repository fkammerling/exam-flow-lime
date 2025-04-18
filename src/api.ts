// Centralized API helper for backend endpoints
export const API_BASE = 'http://localhost:3001/api';

export async function fetchExams() {
  const res = await fetch(`${API_BASE}/exams`);
  if (!res.ok) throw new Error('Failed to fetch exams');
  return res.json();
}

export async function createExam(exam: { name: string; date: string }) {
  const res = await fetch(`${API_BASE}/exams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exam),
  });
  if (!res.ok) throw new Error('Failed to create exam');
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json();
}

export async function registerUser(name: string, email: string, password: string, role: string, program?: string, subject?: string) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, program, subject }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
  return res.json();
}

export async function fetchMe() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token');
  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}
