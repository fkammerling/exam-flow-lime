import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { getCurrentUser, getExamAttempts, getExamsByCourseCode, Exam, ExamAttempt } from '@/utils/localStorage';
import { toast } from '@/components/ui/use-toast';
import { fetchMe } from '@/api';

const formSchema = z.object({
  courseCode: z.string().min(4, {
    message: 'Course code must be at least 4 characters.',
  }),
});

const StudentDashboard = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
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
      const studentAttempts = getExamAttempts().filter(attempt => attempt.studentId === user.id);
      setAttempts(studentAttempts);
      
      // Get all exams for the attempts
      const examIds = new Set(studentAttempts.map(attempt => attempt.examId));
      const allExams = getExamsByCourseCode(''); // Get all exams
      const filteredExams = allExams.filter(exam => examIds.has(exam.id));
      setExams(filteredExams);
    }
  }, [user?.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const foundExams = getExamsByCourseCode(values.courseCode);
    
    if (foundExams.length === 0) {
      toast({
        title: 'Course code not found',
        description: 'Please check the code and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Course found',
      description: `${foundExams.length} exam(s) found for course code ${values.courseCode}`,
    });
    
    // Add exams to the state that aren't already there
    const newExams = foundExams.filter(
      newExam => !exams.some(existingExam => existingExam.id === newExam.id)
    );
    
    if (newExams.length > 0) {
      setExams([...exams, ...newExams]);
    }
    
    form.reset();
  }

  const completedAttempts = attempts.filter(attempt => attempt.completed);
  const inProgressAttempts = attempts.filter(attempt => !attempt.completed);

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {user ? (
                <>
                  Welcome back, {user.name} <span className="ml-2 text-xs text-lime-700 bg-lime-50 rounded px-2 py-1">{user.program}</span>
                </>
              ) : (
                'Welcome!'
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a course code to find more
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inProgressAttempts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Exams you've started
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedAttempts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Exams you've finished
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Enter Course Code</CardTitle>
              <CardDescription>
                Access your assigned exams with a course code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700">
                    Find Exams
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Exams</CardTitle>
              <CardDescription>
                Exams available for you to take
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exams.length > 0 ? (
                <div className="space-y-4">
                  {exams.map((exam) => {
                    const examAttempt = attempts.find(a => a.examId === exam.id);
                    return (
                      <div key={exam.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Code: {exam.courseCode} • {exam.questions.length} questions • {exam.timeLimit} min
                          </p>
                        </div>
                        <Button 
                          variant={examAttempt?.completed ? "outline" : "default"}
                          asChild
                        >
                          <Link to={examAttempt ? `/student/attempts/${examAttempt.id}` : `/student/exams/${exam.id}`}>
                            {examAttempt
                              ? (examAttempt.completed ? "View Results" : "Continue")
                              : "Start Exam"}
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No exams available. Enter a course code to find exams.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
