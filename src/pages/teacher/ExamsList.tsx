
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Layout from '@/components/layout/Layout';
import { PlusCircle, Search, MoreVertical, Copy, Edit, Trash2, Eye } from 'lucide-react';
import { getCurrentUser, getExams, getExamAttemptsByExam, deleteExam, Exam } from '@/utils/localStorage';
import { toast } from '@/components/ui/use-toast';

const TeacherExamsList = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      const teacherExams = getExams().filter(exam => exam.createdBy === currentUser.id);
      setExams(teacherExams);
    }
  }, [currentUser?.id]);

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteExam = (examId: string) => {
    const examAttempts = getExamAttemptsByExam(examId);
    
    if (examAttempts.length > 0) {
      toast({
        title: 'Cannot delete exam',
        description: 'This exam has student attempts and cannot be deleted.',
        variant: 'destructive',
      });
      return;
    }
    
    deleteExam(examId);
    setExams(exams.filter(exam => exam.id !== examId));
    
    toast({
      title: 'Exam deleted',
      description: 'The exam has been successfully deleted.',
    });
  };

  const copyExamLink = (courseCode: string) => {
    navigator.clipboard.writeText(courseCode);
    toast({
      title: 'Course code copied',
      description: 'The course code has been copied to clipboard.',
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all your created exams
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0 bg-lime-600 hover:bg-lime-700">
            <Link to="/teacher/exams/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Exam
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exams</CardTitle>
            <CardDescription>
              You have created {exams.length} {exams.length === 1 ? 'exam' : 'exams'} so far.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search exams by title or course code..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredExams.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-1 md:grid-cols-5 py-3 px-4 font-medium">
                  <div className="md:col-span-2">Title</div>
                  <div className="hidden md:block">Course Code</div>
                  <div className="hidden md:block">Questions</div>
                  <div className="hidden md:block">Time Limit</div>
                </div>
                {filteredExams.map((exam) => {
                  const examAttempts = getExamAttemptsByExam(exam.id);
                  return (
                    <div
                      key={exam.id}
                      className="grid grid-cols-1 md:grid-cols-5 items-center py-3 px-4 border-t"
                    >
                      <div className="md:col-span-2 font-medium">{exam.title}</div>
                      <div className="hidden md:flex items-center gap-2">
                        {exam.courseCode}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyExamLink(exam.courseCode)}
                          className="h-7 w-7"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="hidden md:block">{exam.questions.length}</div>
                      <div className="hidden md:block">{exam.timeLimit} min</div>
                      <div className="flex md:justify-end items-center gap-2 mt-2 md:mt-0">
                        <Button variant="outline" asChild>
                          <Link to={`/teacher/exams/preview/${exam.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyExamLink(exam.courseCode)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/teacher/exams/edit/${exam.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Exam
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteExam(exam.id)}
                              disabled={examAttempts.length > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Exam
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No exams found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try a different search term or clear your search"
                    : "Create your first exam to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherExamsList;
