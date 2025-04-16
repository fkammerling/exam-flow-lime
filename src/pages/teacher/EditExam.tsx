
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { getCurrentUser, generateId, saveExam, getExam, Question } from '@/utils/localStorage';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, ImageIcon, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Title must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  courseCode: z.string().min(4, {
    message: 'Course code must be at least 4 characters.',
  }),
  timeLimit: z.coerce.number().min(5, {
    message: 'Time limit must be at least 5 minutes.',
  }).max(180, {
    message: 'Time limit must be at most 180 minutes.',
  }),
});

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple-choice', 'short-answer', 'long-answer', 'true-false', 'fill-in-blank']),
  text: z.string().min(1, { message: "Question text is required" }),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  points: z.number().min(1, { message: "Points must be at least 1" }),
  image: z.string().optional(),
});

type QuestionType = z.infer<typeof questionSchema>;

const EditExam = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const currentUser = getCurrentUser();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType>({
    id: generateId(),
    type: 'multiple-choice',
    text: '',
    options: ['', ''],
    correctAnswer: '',
    points: 1,
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      courseCode: '',
      timeLimit: 30,
    },
  });

  useEffect(() => {
    if (!examId) {
      navigate('/teacher/exams');
      return;
    }

    const exam = getExam(examId);
    if (!exam) {
      toast({
        title: 'Exam not found',
        description: 'The exam you are trying to edit does not exist.',
        variant: 'destructive',
      });
      navigate('/teacher/exams');
      return;
    }

    // Check if the current user is the creator of the exam
    if (currentUser?.id !== exam.createdBy) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to edit this exam.',
        variant: 'destructive',
      });
      navigate('/teacher/exams');
      return;
    }

    // Set form values
    form.reset({
      title: exam.title,
      description: exam.description,
      courseCode: exam.courseCode,
      timeLimit: exam.timeLimit,
    });

    // Set questions
    setQuestions(exam.questions);
    setLoading(false);
  }, [examId, currentUser, navigate, form]);

  const handleAddQuestion = () => {
    // Validate current question
    try {
      const validatedQuestion = questionSchema.parse(currentQuestion);
      
      // For multiple choice, ensure an option is selected
      if (validatedQuestion.type === 'multiple-choice' && !validatedQuestion.correctAnswer) {
        toast({
          title: 'Missing correct answer',
          description: 'Please select a correct answer for the multiple choice question.',
          variant: 'destructive',
        });
        return;
      }
      
      // For multiple choice, ensure all options have content
      if (validatedQuestion.type === 'multiple-choice' && 
          validatedQuestion.options?.some(option => option.trim() === '')) {
        toast({
          title: 'Empty options',
          description: 'Please fill all option fields or remove empty ones.',
          variant: 'destructive',
        });
        return;
      }
      
      // Add the question
      setQuestions([...questions, validatedQuestion]);
      
      // Reset current question
      setCurrentQuestion({
        id: generateId(),
        type: 'multiple-choice',
        text: '',
        options: ['', ''],
        correctAnswer: '',
        points: 1,
      });
      
      setIsAddingQuestion(false);
      
      toast({
        title: 'Question added',
        description: 'The question has been added to the exam.',
      });
    } catch (error) {
      console.error('Question validation error:', error);
      toast({
        title: 'Invalid question',
        description: 'Please fill all required fields correctly.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    toast({
      description: 'Question removed',
    });
  };

  const handleAddOption = () => {
    if (currentQuestion.options && currentQuestion.options.length < 5) {
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, ''],
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions.splice(index, 1);
      
      // Update correct answer if necessary
      let newCorrectAnswer = currentQuestion.correctAnswer;
      if (typeof newCorrectAnswer === 'string' && parseInt(newCorrectAnswer) === index) {
        newCorrectAnswer = '';
      }
      
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      });
    }
  };

  const handleOptionTextChange = (index: number, value: string) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion({
        ...currentQuestion,
        options: newOptions,
      });
    }
  };

  const handleCorrectAnswerChange = (value: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswer: value,
    });
  };

  const handleQuestionTypeChange = (type: string) => {
    let newQuestion: QuestionType = {
      ...currentQuestion,
      type: type as QuestionType['type'],
    };

    // Reset options and correct answer based on type
    switch (type) {
      case 'multiple-choice':
        newQuestion.options = ['', ''];
        newQuestion.correctAnswer = '';
        break;
      case 'true-false':
        newQuestion.options = ['True', 'False'];
        newQuestion.correctAnswer = '';
        break;
      case 'short-answer':
      case 'long-answer':
      case 'fill-in-blank':
        newQuestion.options = undefined;
        newQuestion.correctAnswer = '';
        break;
    }

    setCurrentQuestion(newQuestion);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCurrentQuestion({
        ...currentQuestion,
        image: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCurrentQuestion({
      ...currentQuestion,
      image: undefined,
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!examId) {
      toast({
        title: 'Exam ID missing',
        description: 'Unable to update the exam without an ID.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!currentUser?.id) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to update an exam.',
        variant: 'destructive',
      });
      navigate('/teacher/login');
      return;
    }
    
    if (questions.length === 0) {
      toast({
        title: 'No questions added',
        description: 'Please add at least one question to your exam.',
        variant: 'destructive',
      });
      return;
    }
    
    const existingExam = getExam(examId);
    if (!existingExam) {
      toast({
        title: 'Exam not found',
        description: 'The exam you are trying to update does not exist.',
        variant: 'destructive',
      });
      return;
    }
    
    const updatedExam = {
      ...existingExam,
      title: values.title,
      description: values.description,
      courseCode: values.courseCode,
      timeLimit: values.timeLimit,
      questions: questions as Question[],
      updatedAt: Date.now(),
    };
    
    saveExam(updatedExam);
    
    toast({
      title: 'Exam updated successfully',
      description: 'Your exam has been updated and is available for students.',
    });
    
    navigate('/teacher/exams');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Loading Exam...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Edit Exam</h1>
          <Button variant="outline" asChild>
            <Link to={`/teacher/exams/preview/${examId}`}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>
                Update the basic information for your exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter exam title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter a description for your exam" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide instructions or additional information for students
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="courseCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter course code" {...field} />
                          </FormControl>
                          <FormDescription>
                            Students will use this code to access the exam
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter time limit in minutes" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The amount of time students have to complete the exam
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Add or edit questions in your exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">
                            Question {index + 1} • {question.points} {question.points === 1 ? 'point' : 'points'} • {question.type.replace('-', ' ')}
                          </span>
                          <h3 className="font-medium mt-1">{question.text}</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {question.image && (
                        <div className="mt-2 mb-3">
                          <img 
                            src={question.image} 
                            alt="Question" 
                            className="max-h-32 object-contain rounded"
                          />
                        </div>
                      )}
                      
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs ${question.correctAnswer === optIndex.toString() ? 'bg-lime-500 text-white' : 'border border-gray-300'}`}>
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No questions added yet. Click the button below to add your first question.
                </div>
              )}
              
              {!isAddingQuestion ? (
                <Button
                  onClick={() => setIsAddingQuestion(true)}
                  className="w-full bg-lime-600 hover:bg-lime-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              ) : (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">New Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Question Type
                      </label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={handleQuestionTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="short-answer">Short Answer</SelectItem>
                          <SelectItem value="long-answer">Long Answer</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Question Text
                      </label>
                      <Textarea
                        value={currentQuestion.text}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                        placeholder="Enter your question here"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Points
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Question Image (optional)
                      </label>
                      {!currentQuestion.image ? (
                        <div className="border-2 border-dashed rounded-md p-4 text-center">
                          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Upload an image to include with your question
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={handleImageUpload}
                          />
                          <label htmlFor="image-upload">
                            <Button type="button" variant="outline" className="cursor-pointer">
                              Upload Image
                            </Button>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <img 
                            src={currentQuestion.image} 
                            alt="Question" 
                            className="max-h-40 object-contain rounded mb-2"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Multiple Choice Options */}
                    {currentQuestion.type === 'multiple-choice' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Options
                        </label>
                        <div className="space-y-2">
                          {currentQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${currentQuestion.correctAnswer === index.toString() ? 'bg-lime-500 text-white' : 'border border-gray-300'}`}
                                onClick={() => handleCorrectAnswerChange(index.toString())}
                              >
                                {String.fromCharCode(65 + index)}
                              </div>
                              <Input
                                value={option}
                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                className="flex-1"
                              />
                              {index > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveOption(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          {currentQuestion.options && currentQuestion.options.length < 5 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddOption}
                              className="w-full mt-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* True/False Options */}
                    {currentQuestion.type === 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Correct Answer
                        </label>
                        <div className="flex gap-4">
                          <div 
                            className={`flex-1 border rounded-md p-3 text-center cursor-pointer ${currentQuestion.correctAnswer === '0' ? 'bg-lime-500 text-white' : 'hover:bg-muted'}`}
                            onClick={() => handleCorrectAnswerChange('0')}
                          >
                            True
                          </div>
                          <div 
                            className={`flex-1 border rounded-md p-3 text-center cursor-pointer ${currentQuestion.correctAnswer === '1' ? 'bg-lime-500 text-white' : 'hover:bg-muted'}`}
                            onClick={() => handleCorrectAnswerChange('1')}
                          >
                            False
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Short/Long Answer Correct Answer */}
                    {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'fill-in-blank') && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Correct Answer
                        </label>
                        <Input
                          value={currentQuestion.correctAnswer as string || ''}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                          placeholder="Enter the correct answer"
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddQuestion} className="bg-lime-600 hover:bg-lime-700">
                      Add Question
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Update Exam</CardTitle>
              <CardDescription>
                Review changes and update your exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Exam Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    {form.getValues('title') || '[No title]'} • {questions.length} {questions.length === 1 ? 'question' : 'questions'} • {form.getValues('timeLimit') || 0} minutes
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Total Points</h3>
                  <p className="text-sm text-muted-foreground">
                    {questions.reduce((sum, q) => sum + q.points, 0)} points
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Question Types</h3>
                  <div className="text-sm text-muted-foreground">
                    {['multiple-choice', 'short-answer', 'long-answer', 'true-false', 'fill-in-blank'].map(type => {
                      const count = questions.filter(q => q.type === type).length;
                      return count > 0 && (
                        <span key={type} className="mr-3">
                          {type.replace('-', ' ')}: {count}
                        </span>
                      );
                    })}
                    {questions.length === 0 && '[No questions]'}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                className="w-full bg-lime-600 hover:bg-lime-700"
                disabled={questions.length === 0}
              >
                Update Exam
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EditExam;
