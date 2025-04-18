import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '@/utils/localStorage';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    setUser(getCurrentUser()); // update on route change
    return () => window.removeEventListener('storage', handleStorage);
  }, [location]);

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
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            {/* Remove back arrow on dashboard */}
            {(!isLanding && currentUser && !location.pathname.includes('/dashboard')) && (
              <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-lime-700">
                Examily
              </span>
            </Link>
          </div>
          {isLanding && (
            currentUser ? (
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md text-sm font-semibold"
                onClick={() => {
                  setCurrentUser(null);
                  setUser(null);
                  navigate('/');
                }}
              >
                Log Out
              </Button>
            ) : (
              <Button
                className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-md text-sm font-semibold"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
            )
          )}
          {/* Hamburger menu only on dashboard */}
          {currentUser && location.pathname.includes('/dashboard') && (
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Hamburger menu content for dashboard */}
        {currentUser && location.pathname.includes('/dashboard') && isMenuOpen && (
          <div className="fixed inset-0 top-16 z-50 bg-background flex flex-col items-end md:hidden">
            <nav className="w-48 bg-white border shadow-lg rounded-l-lg mt-2 mr-2 p-4 flex flex-col gap-4">
              {currentUser.role === 'teacher' ? (
                <>
                  <Link to="/teacher/exams" onClick={() => setIsMenuOpen(false)} className="text-base font-medium hover:text-lime-700 transition-colors">Old Exams</Link>
                  <Link to="/teacher/profile" onClick={() => setIsMenuOpen(false)} className="text-base font-medium hover:text-lime-700 transition-colors">Profile</Link>
                </>
              ) : (
                <>
                  <Link to="/student/exams" onClick={() => setIsMenuOpen(false)} className="text-base font-medium hover:text-lime-700 transition-colors">Old Exams</Link>
                  <Link to="/student/profile" onClick={() => setIsMenuOpen(false)} className="text-base font-medium hover:text-lime-700 transition-colors">Profile</Link>
                </>
              )}
            </nav>
          </div>
        )}

        {!isLanding && !location.pathname.includes('/dashboard') && (
          <div className="flex items-center gap-4">
            {currentUser && currentUser.role === 'teacher' && (
              <Button
                className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-md text-sm font-semibold"
                onClick={() => navigate('/teacher/exams/create')}
              >
                Create New Exam
              </Button>
            )}
            {currentUser && (
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md text-sm font-semibold"
                onClick={() => {
                  setCurrentUser(null);
                  setUser(null);
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            )}
          </div>
        )}

        {!isLanding && !location.pathname.includes('/dashboard') && (
          <>
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
          </>
        )}
      </div>
    </header>
  );
}
