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
