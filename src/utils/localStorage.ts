
// Type definitions for our data models
export interface User {
  id: string;
  name: string;
  role: 'teacher' | 'student';
  subject?: string; // For teachers
  program?: string; // For students
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'long-answer' | 'true-false' | 'fill-in-blank';
  text: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  image?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  createdBy: string; // Teacher ID
  timeLimit: number; // In minutes
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, string | string[]>;
  startedAt: number;
  submittedAt?: number;
  score?: number;
  completed: boolean;
}

// LocalStorage Keys
const USERS_KEY = 'exam-flow-users';
const EXAMS_KEY = 'exam-flow-exams';
const ATTEMPTS_KEY = 'exam-flow-attempts';
const CURRENT_USER_KEY = 'exam-flow-current-user';

// Helper functions for working with localStorage
const getItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// API for Users
export const getUsers = (): User[] => {
  return getItem<User[]>(USERS_KEY, []);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  setItem(USERS_KEY, users);
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(user => user.id !== userId);
  setItem(USERS_KEY, users);
};

export const getCurrentUser = (): User | null => {
  return getItem<User | null>(CURRENT_USER_KEY, null);
};

export const setCurrentUser = (user: User | null): void => {
  setItem(CURRENT_USER_KEY, user);
};

// API for Exams
export const getExams = (): Exam[] => {
  return getItem<Exam[]>(EXAMS_KEY, []);
};

export const getExamsByCourseCode = (courseCode: string): Exam[] => {
  return getExams().filter(exam => exam.courseCode === courseCode);
};

export const getExamsByTeacher = (teacherId: string): Exam[] => {
  return getExams().filter(exam => exam.createdBy === teacherId);
};

export const getExam = (examId: string): Exam | undefined => {
  return getExams().find(exam => exam.id === examId);
};

export const saveExam = (exam: Exam): void => {
  const exams = getExams();
  const existingIndex = exams.findIndex(e => e.id === exam.id);
  
  if (existingIndex >= 0) {
    exams[existingIndex] = exam;
  } else {
    exams.push(exam);
  }
  
  setItem(EXAMS_KEY, exams);
};

export const deleteExam = (examId: string): void => {
  const exams = getExams().filter(exam => exam.id !== examId);
  setItem(EXAMS_KEY, exams);
};

// API for Exam Attempts
export const getExamAttempts = (): ExamAttempt[] => {
  return getItem<ExamAttempt[]>(ATTEMPTS_KEY, []);
};

export const getExamAttemptsByStudent = (studentId: string): ExamAttempt[] => {
  return getExamAttempts().filter(attempt => attempt.studentId === studentId);
};

export const getExamAttemptsByExam = (examId: string): ExamAttempt[] => {
  return getExamAttempts().filter(attempt => attempt.examId === examId);
};

export const getExamAttempt = (attemptId: string): ExamAttempt | undefined => {
  return getExamAttempts().find(attempt => attempt.id === attemptId);
};

export const saveExamAttempt = (attempt: ExamAttempt): void => {
  const attempts = getExamAttempts();
  const existingIndex = attempts.findIndex(a => a.id === attempt.id);
  
  if (existingIndex >= 0) {
    attempts[existingIndex] = attempt;
  } else {
    attempts.push(attempt);
  }
  
  setItem(ATTEMPTS_KEY, attempts);
};

export const deleteExamAttempt = (attemptId: string): void => {
  const attempts = getExamAttempts().filter(attempt => attempt.id !== attemptId);
  setItem(ATTEMPTS_KEY, attempts);
};

// Generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
