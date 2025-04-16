
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Layout from '@/components/layout/Layout';
import { 
  getCurrentUser, 
  getExam, 
  generateId, 
  saveExamAttempt, 
  getExamAttempt,
  Question,
  ExamAttempt
} from '@/utils/localStorage';
import { toast } from '@/components/ui/use-toast';

const TakeExam = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const [exam, setExam] = useState<any>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isTimeUpDialogOpen, setIsTimeUpDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId || !currentUser?.id) {
      navigate('/student/dashboard');
      return;
    }

    const examData = getExam(examId);
    
    if (!examData) {
      toast({
        title: 'Exam not found',
        description: 'The exam you are trying to access does not exist.',
        variant: 'destructive',
      });
      navigate('/student/dashboard');
      return;
    }
    
    setExam(examData);
    
    // Check for existing attempt
    const existingAttempts = getExamAttempt(examId);
    if (existingAttempts) {
      setAttempt(existingAttempts);
      setAnswers(existingAttempts.answers);
      
      // Calculate remaining time
      if (!existingAttempts.completed) {
        const elapsed = Math.floor((Date.now() - existingAttempts.startedAt) / 1000);
        const remaining = Math.max(0, examData.timeLimit * 60 - elapsed);
        setTimeRemaining(remaining);
      }
    } else {
      // Create new attempt
      const newAttempt = {
        id: generateId(),
        examId: examId,
        studentId: currentUser.id,
        answers: {},
        startedAt: Date.now(),
        completed: false,
      };
      saveExamAttempt(newAttempt);
      setAttempt(newAttempt);
      setTimeRemaining(examData.timeLimit * 60);
    }
    
    setLoading(false);
  }, [examId, currentUser, navigate]);

  useEffect(() => {
    if (timeRemaining <= 0 && attempt && !attempt.completed) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attempt]);

  useEffect(() => {
    // Save progress every 30 seconds
    const saveInterval = setInterval(() => {
      if (attempt && !attempt.completed) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [answers, attempt]);

  const saveProgress = () => {
    if (!attempt) return;
    
    const updatedAttempt = {
      ...attempt,
      answers,
    };
    
    saveExamAttempt(updatedAttempt);
    setAttempt(updatedAttempt);
  };

  const handleNextQuestion = () => {
    saveProgress();
    setCurrentQuestionIndex(prev => Math.min(prev + 1, exam.questions.length - 1));
  };

  const handlePrevQuestion = () => {
    saveProgress();
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  const handleAnswerChange = (value: string | string[]) => {
    if (!exam?.questions[currentQuestionIndex]) return;
    
    const questionId = exam.questions[currentQuestionIndex].id;
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = () => {
    if (!attempt || !exam) return;
    
    saveProgress();
    
    // Calculate score for auto-graded questions
    let totalPoints = 0;
    let earnedPoints = 0;
    
    exam.questions.forEach((question: Question) => {
      totalPoints += question.points;
      
      if (question.type === 'multiple-choice' || question.type === 'true-false' || 
          question.type === 'fill-in-blank') {
        const studentAnswer = answers[question.id];
        
        if (studentAnswer !== undefined) {
          if (Array.isArray(studentAnswer) && Array.isArray(question.correctAnswer)) {
            // For multiple select questions (not implemented in this version)
            const correct = question.correctAnswer.length === studentAnswer.length && 
                            question.correctAnswer.every(a => studentAnswer.includes(a));
            if (correct) earnedPoints += question.points;
          } else if (!Array.isArray(studentAnswer) && !Array.isArray(question.correctAnswer)) {
            // For single answer questions
            if (question.type === 'fill-in-blank') {
              // Case-insensitive comparison for fill-in-blank
              if (studentAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
                earnedPoints += question.points;
              }
            } else if (studentAnswer === question.correctAnswer) {
              earnedPoints += question.points;
            }
          }
        }
      }
    });
    
    // Score as percentage for objective questions
    const calculatedScore = Math.round((earnedPoints / totalPoints) * 100);
    
    const finalAttempt = {
      ...attempt,
      answers,
      submittedAt: Date.now(),
      score: calculatedScore,
      completed: true,
    };
    
    saveExamAttempt(finalAttempt);
    
    toast({
      title: 'Exam submitted',
      description: 'Your exam has been successfully submitted.',
    });
    
    navigate(`/student/results/${attempt.id}`);
  };

  const handleTimeUp = () => {
    if (!attempt || !exam || attempt.completed) return;
    
    setIsTimeUpDialogOpen(true);
    
    // Auto-submit after a brief delay if user doesn't interact
    setTimeout(() => {
      if (!attempt.completed) {
        handleSubmit();
      }
    }, 5000);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <Layout hideFooter>
        <div className="container py-16 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Exam...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  if (!exam) return null;

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / exam.questions.length) * 100);
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

  return (
    <Layout hideFooter>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </p>
          </div>
          <div className="flex items-center">
            <div className={`rounded-full px-4 py-1 text-sm font-medium ${timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-lime-100 text-lime-800'}`}>
              Time Remaining: {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-lime-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <span className="flex-1">
                {currentQuestion.text}
              </span>
              <span className="text-sm font-normal text-muted-foreground whitespace-nowrap ml-4">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.image && (
              <div className="mb-4">
                <img 
                  src={currentQuestion.image} 
                  alt="Question" 
                  className="max-w-full max-h-72 object-contain rounded" 
                />
              </div>
            )}

            {currentQuestion.type === 'multiple-choice' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={value => handleAnswerChange(value)}
              >
                <div className="space-y-4">
                  {currentQuestion.options?.map((option: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === 'short-answer' && (
              <Input
                value={answers[currentQuestion.id] as string || ''}
                onChange={e => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here"
              />
            )}

            {currentQuestion.type === 'long-answer' && (
              <Textarea
                value={answers[currentQuestion.id] as string || ''}
                onChange={e => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here"
                rows={6}
              />
            )}

            {currentQuestion.type === 'true-false' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={value => handleAnswerChange(value)}
              >
                <div className="space-y-4">
                  {['True', 'False'].map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === 'fill-in-blank' && (
              <Input
                value={answers[currentQuestion.id] as string || ''}
                onChange={e => handleAnswerChange(e.target.value)}
                placeholder="Type the missing word or phrase"
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {isLastQuestion ? (
                <Button 
                  onClick={() => setIsSubmitDialogOpen(true)}
                  className="bg-lime-600 hover:bg-lime-700"
                >
                  Submit Exam
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="bg-lime-600 hover:bg-lime-700"
                >
                  Next Question
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {exam.questions.map((_: any, index: number) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                className={
                  index === currentQuestionIndex 
                    ? "bg-lime-600 hover:bg-lime-700 h-8 w-8 p-0" 
                    : answers[exam.questions[index].id] 
                      ? "bg-lime-100 text-lime-700 border-lime-300 hover:bg-lime-200 h-8 w-8 p-0" 
                      : "h-8 w-8 p-0"
                }
                onClick={() => {
                  saveProgress();
                  setCurrentQuestionIndex(index);
                }}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsSubmitDialogOpen(true)}
          >
            Finish & Submit
          </Button>
        </div>
      </div>
      
      {/* Submit Confirmation Dialog */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your exam? Once submitted, you won't be able to change your answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-lime-600 hover:bg-lime-700">
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Time's Up Dialog */}
      <AlertDialog open={isTimeUpDialogOpen} onOpenChange={setIsTimeUpDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your time has expired. Your exam will be automatically submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSubmit} className="bg-lime-600 hover:bg-lime-700">
              Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TakeExam;
