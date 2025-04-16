
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Teacher Routes
import TeacherLogin from "./pages/teacher/Login";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherExamsList from "./pages/teacher/ExamsList";
import CreateExam from "./pages/teacher/CreateExam";

// Student Routes
import StudentLogin from "./pages/student/Login";
import StudentDashboard from "./pages/student/Dashboard";
import TakeExam from "./pages/student/TakeExam";
import ExamResults from "./pages/student/ExamResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/exams" element={<TeacherExamsList />} />
          <Route path="/teacher/exams/create" element={<CreateExam />} />
          
          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/exams/:examId" element={<TakeExam />} />
          <Route path="/student/results/:attemptId" element={<ExamResults />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
