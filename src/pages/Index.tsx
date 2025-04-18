import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { BookOpen, UserCog, Clock, BarChart2 } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-lime-600">Examily</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A modern platform for creating, taking, and analyzing exams with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
            <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCog className="h-8 w-8 text-lime-600" />
            </div>
            <h2 className="text-2xl">Teacher</h2>
            <p className="text-muted-foreground text-center">Create and manage exams</p>
            <p className="mb-6 text-muted-foreground">
              Create, edit, and analyze exams. View student performance and track progress.
            </p>
            <Button asChild className="w-full bg-lime-600 hover:bg-lime-700">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
            <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-lime-600" />
            </div>
            <h2 className="text-2xl">Student</h2>
            <p className="text-muted-foreground text-center">Take exams and view results</p>
            <p className="mb-6 text-muted-foreground">
              Access your assigned exams using course codes. Take exams and review your results.
            </p>
            <Button asChild className="w-full bg-lime-600 hover:bg-lime-700">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center mb-3">
                <BookOpen className="h-7 w-7 text-lime-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Multiple Question Types</h3>
              <p className="text-muted-foreground text-center">Create diverse exams with various question formats</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center mb-3">
                <Clock className="h-7 w-7 text-lime-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Timed Assessments</h3>
              <p className="text-muted-foreground text-center">Set time limits to simulate real exam conditions</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center mb-3">
                <BarChart2 className="h-7 w-7 text-lime-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
              <p className="text-muted-foreground text-center">Gain insights from detailed assessment reports</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center mb-3">
                <BookOpen className="h-7 w-7 text-lime-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Course Code System</h3>
              <p className="text-muted-foreground text-center">Easily distribute exams without complex permission systems</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center mb-3">
                <Clock className="h-7 w-7 text-lime-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Progress Saving</h3>
              <p className="text-muted-foreground text-center">Pick up where you left off with auto-save functionality</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-lime-50 flex items-center justify-center mb-3">
                <BarChart2 className="h-7 w-7 text-lime-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Responsive Design</h3>
              <p className="text-muted-foreground text-center">Take or create exams on any device, anywhere</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
