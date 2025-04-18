import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { PlusCircle, BookOpen, Users, BarChart } from 'lucide-react';
import { getCurrentUser, getExams, getExamAttempts, Exam, ExamAttempt } from '@/utils/localStorage';
import { fetchMe } from '@/api';

const TeacherDashboard = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [user, setUser] = useState<any>(null);

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

  return (
    <Layout>
      <div className="container py-8">
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
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
