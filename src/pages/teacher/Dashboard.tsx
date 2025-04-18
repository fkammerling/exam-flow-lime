import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { PlusCircle, BookOpen, Users, BarChart } from 'lucide-react';
import { getCurrentUser, getExams, getExamAttempts, Exam, ExamAttempt } from '@/utils/localStorage';
import { fetchMe } from '@/api';
import ReactDOM from 'react-dom';
import TeacherProfile from './Profile';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'exams', label: 'Old Exams' },
  { key: 'profile', label: 'My Profile' }
];

const TeacherDashboard = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    async function getUser() {
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        setUser(null);
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      const teacherExams = getExams().filter(exam => exam.createdBy === user.id);
      setExams(teacherExams);
      const examIds = teacherExams.map(exam => exam.id);
      const examAttempts = getExamAttempts().filter(attempt => 
        examIds.includes(attempt.examId)
      );
      setAttempts(examAttempts);
    }
  }, [user?.id]);

  const completedAttempts = attempts.filter(attempt => attempt.completed);
  const averageScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length
    : 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // redirect to landing page for teachers too
  };

  // Render dashboard tabs and logout button in a row, aligned right
  const tabs = (
    <div className="flex gap-2 items-center justify-end">
      {TABS.map(tab => (
        <Button
          key={tab.key}
          variant={activeTab === tab.key ? 'default' : 'outline'}
          className={activeTab === tab.key ? 'bg-lime-600 text-white' : ''}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </Button>
      ))}
      <Button className="ml-2 bg-lime-600 hover:bg-lime-700 text-white" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );

  // Hide tabs on login/register pages
  const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');

  React.useEffect(() => {
    const placeholder = document.getElementById('dashboard-tabs-placeholder');
    if (placeholder && !isAuthPage) {
      ReactDOM.render(tabs, placeholder);
      return () => { ReactDOM.unmountComponentAtNode(placeholder); };
    } else if (placeholder) {
      ReactDOM.unmountComponentAtNode(placeholder);
    }
    return undefined;
  }, [tabs, activeTab]);

  let mainContent = null;
  if (activeTab === 'dashboard') {
    mainContent = (
      <>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {exams.length === 1 ? 'Exam created' : 'Exams created'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Student Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{attempts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedAttempts.length} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {completedAttempts.length > 0 ? `${Math.round(averageScore)}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all exams
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exams</CardTitle>
              <CardDescription>
                Your most recently created exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length > 0 ? (
                <div className="space-y-4">
                  {exams.slice(0, 5).map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exam.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Code: {exam.courseCode} • {exam.questions.length} questions
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link to={`/teacher/exams/${exam.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No exams created yet
                </div>
              )}
              {exams.length > 0 && (
                <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/teacher/exams">View All Exams</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Student Activity</CardTitle>
              <CardDescription>
                Latest exam attempts by students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length > 0 ? (
                <div className="space-y-4">
                  {attempts
                    .sort((a, b) => b.startedAt - a.startedAt)
                    .slice(0, 5)
                    .map((attempt) => {
                      const exam = exams.find(e => e.id === attempt.examId);
                      return (
                        <div key={attempt.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{exam?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(attempt.startedAt).toLocaleDateString()} •
                              {attempt.completed 
                                ? ` Score: ${attempt.score}%` 
                                : ' In progress'}
                            </p>
                          </div>
                          {attempt.completed && (
                            <Button variant="outline" asChild>
                              <Link to={`/teacher/attempts/${attempt.id}`}>Results</Link>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No student attempts yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  } else if (activeTab === 'exams') {
    mainContent = (
      <>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Old Exams</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all exams you have created
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Exam List</CardTitle>
            <CardDescription>
              All your created exams
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exams.length > 0 ? (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {exam.courseCode} • {exam.questions.length} questions
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to={`/teacher/exams/${exam.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No exams created yet.
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  } else if (activeTab === 'profile') {
    mainContent = <TeacherProfile />; 
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Only show dashboard heading and welcome on Dashboard tab */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                {user ? (
                  <>
                    Welcome back, {user.name} <span className="ml-2 text-xs text-lime-700 bg-lime-50 rounded px-2 py-1">{user.subject}</span>
                  </>
                ) : (
                  'Welcome!'
                )}
              </p>
            </div>
          </div>
        )}
        {mainContent}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
