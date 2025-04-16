
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Edit } from 'lucide-react';
import { getExam, Question } from '@/utils/localStorage';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Radio } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PreviewExam = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ReturnType<typeof getExam>>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  useEffect(() => {
    if (!examId) {
      navigate('/teacher/exams');
      return;
    }

    const examData = getExam(examId);
    if (!examData) {
      toast({
        title: 'Exam not found',
        description: 'The exam you are trying to preview does not exist.',
        variant: 'destructive',
      });
      navigate('/teacher/exams');
      return;
    }

    setExam(examData);
  }, [examId, navigate]);

  if (!exam) {
    return (
      <Layout>
        <div className="container py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Loading Exam Preview...</h1>
        </div>
      </Layout>
    );
  }

  const currentQuestion: Question = exam.questions[currentQuestionIndex];

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderQuestionContent = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Radio disabled />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'true-false':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Radio disabled />
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                True
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Radio disabled />
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                False
              </label>
            </div>
          </div>
        );
      
      case 'short-answer':
        return (
          <Input 
            placeholder="Student will type their answer here" 
            disabled 
            className="mt-2"
          />
        );
      
      case 'long-answer':
        return (
          <Textarea 
            placeholder="Student will type their answer here" 
            disabled 
            className="mt-2" 
            rows={4}
          />
        );
      
      case 'fill-in-blank':
        return (
          <Input 
            placeholder="Student will fill in the blank here" 
            disabled 
            className="mt-2"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/teacher/exams')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Preview: {exam.title}</h1>
              <p className="text-muted-foreground mt-1">
                Course Code: {exam.courseCode} • {exam.questions.length} questions • {exam.timeLimit} min
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline" asChild>
              <Link to={`/teacher/exams/edit/${examId}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Exam
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-lg font-medium mb-2">{exam.description}</p>
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" /> 
              Time Limit: {exam.timeLimit} minutes
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-medium mb-4">Question Navigator</h2>
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      className={currentQuestionIndex === index ? "bg-lime-600 hover:bg-lime-700" : ""}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {exam.questions.length}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Points: {currentQuestion.points}
                  </span>
                </div>

                <h2 className="text-lg font-medium mb-4">{currentQuestion.text}</h2>

                {currentQuestion.image && (
                  <div className="mb-4">
                    <img 
                      src={currentQuestion.image} 
                      alt="Question" 
                      className="max-h-48 object-contain rounded"
                    />
                  </div>
                )}

                {renderQuestionContent(currentQuestion)}

                <Separator className="my-6" />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === exam.questions.length - 1}
                    className="bg-lime-600 hover:bg-lime-700"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PreviewExam;
