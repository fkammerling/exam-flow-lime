
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { getCurrentUser, getExamAttempt, getExam, ExamAttempt, Exam, Question } from '@/utils/localStorage';

const ExamResults = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  
  useEffect(() => {
    if (attemptId) {
      const attemptData = getExamAttempt(attemptId);
      if (attemptData) {
        setAttempt(attemptData);
        
        const examData = getExam(attemptData.examId);
        if (examData) {
          setExam(examData);
        }
      }
    }
  }, [attemptId]);
  
  if (!attempt || !exam) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Results not found</h1>
          <p className="mb-6">Unable to find the exam results you're looking for.</p>
          <Button asChild>
            <Link to="/student/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const formattedDate = new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString();
  const duration = attempt.submittedAt 
    ? Math.round((attempt.submittedAt - attempt.startedAt) / 60000) 
    : 'In progress';
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{exam.title} - Results</h1>
          <p className="text-muted-foreground mt-1">
            Completed on {formattedDate} • Duration: {typeof duration === 'number' ? `${duration} minutes` : duration}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Final Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{attempt.score !== undefined ? `${attempt.score}%` : 'N/A'}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{exam.questions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Time Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{exam.timeLimit} min</div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exam.questions.map((question: Question, index: number) => {
                const userAnswer = attempt.answers[question.id];
                let isCorrect = false;
                
                if (question.type === 'multiple-choice' || question.type === 'true-false') {
                  isCorrect = userAnswer === question.correctAnswer;
                } else if (question.type === 'fill-in-blank' && userAnswer && question.correctAnswer) {
                  isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
                }
                
                // Short answer and long answer can't be auto-graded
                const canAutoGrade = question.type !== 'short-answer' && question.type !== 'long-answer';
                
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {canAutoGrade ? (
                            isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )
                          ) : (
                            <HelpCircle className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            Question {index + 1} ({question.points} pts)
                          </div>
                          <p className="mt-1">{question.text}</p>
                          
                          {question.image && (
                            <div className="mt-2 mb-3">
                              <img 
                                src={question.image} 
                                alt="Question" 
                                className="max-h-32 object-contain rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pl-8">
                      <div className="mb-2">
                        <div className="text-sm font-medium text-muted-foreground">Your Answer:</div>
                        <div className="mt-1">
                          {question.type === 'multiple-choice' && (
                            <div>
                              {question.options && userAnswer !== undefined
                                ? question.options[parseInt(userAnswer as string)] || 'Not answered'
                                : 'Not answered'}
                            </div>
                          )}
                          
                          {question.type === 'true-false' && (
                            <div>
                              {userAnswer !== undefined
                                ? userAnswer === '0' ? 'True' : 'False'
                                : 'Not answered'}
                            </div>
                          )}
                          
                          {(question.type === 'short-answer' || 
                            question.type === 'long-answer' || 
                            question.type === 'fill-in-blank') && (
                            <div>
                              {userAnswer ? String(userAnswer) : 'Not answered'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {canAutoGrade && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Correct Answer:</div>
                          <div className="mt-1">
                            {question.type === 'multiple-choice' && (
                              <div>
                                {question.options && question.correctAnswer !== undefined
                                  ? question.options[parseInt(question.correctAnswer as string)]
                                  : 'N/A'}
                              </div>
                            )}
                            
                            {question.type === 'true-false' && (
                              <div>
                                {question.correctAnswer === '0' ? 'True' : 'False'}
                              </div>
                            )}
                            
                            {question.type === 'fill-in-blank' && (
                              <div>{question.correctAnswer}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-center">
              <Button asChild className="bg-lime-600 hover:bg-lime-700">
                <Link to="/student/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ExamResults;
