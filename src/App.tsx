import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from './pages/auth/Auth';

// Teacher Routes
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherExamsList from "./pages/teacher/ExamsList";
import TeacherProfile from "./pages/teacher/Profile";
import CreateExam from "./pages/teacher/CreateExam";
import EditExam from "./pages/teacher/EditExam";
import PreviewExam from "./pages/teacher/PreviewExam";

// Student Routes
import StudentDashboard from "./pages/student/Dashboard";
import Exams from "./pages/student/Exams";
import TakeExam from "./pages/student/TakeExam";
import ExamResults from "./pages/student/ExamResults";
import StudentProfile from "./pages/student/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute role="teacher" redirectTo="/login">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams" element={
            <ProtectedRoute role="teacher" redirectTo="/login">
              <TeacherExamsList />
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams/create" element={
            <ProtectedRoute role="teacher" redirectTo="/login">
              <CreateExam />
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams/edit/:examId" element={
            <ProtectedRoute role="teacher" redirectTo="/login">
              <EditExam />
            </ProtectedRoute>
          } />
          <Route path="/teacher/exams/preview/:examId" element={
            <ProtectedRoute role="teacher" redirectTo="/login">
              <PreviewExam />
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute role="teacher" redirectTo="/login">
              <TeacherProfile />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student" redirectTo="/login">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/exams" element={
            <ProtectedRoute role="student" redirectTo="/login">
              <Exams />
            </ProtectedRoute>
          } />
          <Route path="/student/exams/:examId" element={
            <ProtectedRoute role="student" redirectTo="/login">
              <TakeExam />
            </ProtectedRoute>
          } />
          <Route path="/student/results/:attemptId" element={
            <ProtectedRoute role="student" redirectTo="/login">
              <ExamResults />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute role="student" redirectTo="/login">
              <StudentProfile />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
