
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getCurrentUser, getExamAttemptsByStudent, getExams, getExam, ExamAttempt, Exam } from '@/utils/localStorage';
import { toast } from '@/components/ui/use-toast';

interface ExamWithAttempt {
  exam: Exam;
  attempt?: ExamAttempt;
}

const StudentExams = () => {
  const [examList, setExamList] = useState<ExamWithAttempt[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      // Get all available exams based on the student's attempts
      const attempts = getExamAttemptsByStudent(currentUser.id);
      
      // Create a map of exam IDs to avoid duplicates
      const examMap = new Map<string, ExamWithAttempt>();
      
      // Process attempts first
      attempts.forEach(attempt => {
        const exam = getExam(attempt.examId);
        if (exam) {
          examMap.set(exam.id, { exam, attempt });
        }
      });
      
      // Convert the map to an array for rendering
      setExamList(Array.from(examMap.values()));
    }
  }, [currentUser?.id]);

  return (
    <Layout>
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
    </Layout>
  );
};

export default StudentExams;
