import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { fetchExams } from '@/api';
import { toast } from '@/components/ui/use-toast';

interface ExamWithAttempt {
  exam: any;
  attempt?: any;
}

const StudentExams = () => {
  const [examList, setExamList] = useState<ExamWithAttempt[]>([]);

  useEffect(() => {
    // Fetch exams from backend
    fetchExams()
      .then(data => {
        // Adapt as needed: here we assume backend returns array of exams
        setExamList(data.map((exam: any) => ({ exam })));
      })
      .catch(() => {
        setExamList([]);
        toast({ title: 'Error', description: 'Failed to load exams', variant: 'destructive' });
      });
  }, []);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
          <p className="text-muted-foreground mt-1">
            View your exam history and continue unfinished exams
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam History</CardTitle>
          <CardDescription>
            All your exams, both completed and in progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {examList.length > 0 ? (
            <div className="space-y-4">
              {examList.map(({ exam, attempt }) => (
                <div key={exam.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {exam.courseCode} • {exam.questions.length} questions • {exam.timeLimit} min
                    </p>
                  </div>
                  <Button 
                    variant={attempt?.completed ? "outline" : "default"}
                    asChild
                  >
                    <Link to={attempt?.completed ? `/student/results/${attempt.id}` : `/student/exams/${exam.id}`}>
                      {attempt?.completed ? "View Results" : "Start"}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No exams found. Enter a course code in your dashboard to find exams.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentExams;
