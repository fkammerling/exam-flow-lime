
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '@/utils/localStorage';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {currentUser && (
            <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-lime-700">
              ExamFlow
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {currentUser ? (
            <>
              {currentUser.role === 'teacher' ? (
                <>
                  <Link to="/teacher/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                    Dashboard
                  </Link>
                  <Link to="/teacher/exams" className="text-sm font-medium transition-colors hover:text-primary">
                    My Exams
                  </Link>
                  <Link to="/teacher/profile" className="text-sm font-medium transition-colors hover:text-primary">
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/student/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                    Dashboard
                  </Link>
                  <Link to="/student/exams" className="text-sm font-medium transition-colors hover:text-primary">
                    My Exams
                  </Link>
                  <Link to="/student/profile" className="text-sm font-medium transition-colors hover:text-primary">
                    Profile
                  </Link>
                </>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : null}
        </nav>

        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
            <nav className="container grid gap-6 p-6">
              {currentUser ? (
                <>
                  {currentUser.role === 'teacher' ? (
                    <>
                      <Link 
                        to="/teacher/dashboard" 
                        className="text-lg font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/teacher/exams" 
                        className="text-lg font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Exams
                      </Link>
                      <Link 
                        to="/teacher/profile" 
                        className="text-lg font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/student/dashboard" 
                        className="text-lg font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/student/exams" 
                        className="text-lg font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Exams
                      </Link>
                      <Link 
                        to="/student/profile" 
                        className="text-lg font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </>
                  )}
                  <Button variant="ghost" onClick={handleLogout} className="justify-start p-0">
                    Logout
                  </Button>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
