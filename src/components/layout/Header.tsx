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
  const isTeacherDash = location.pathname.startsWith('/teacher/dashboard');
  const isStudentDash = location.pathname.startsWith('/student/dashboard');
  const isLogin = location.pathname.includes('/login');
  const isRegister = location.pathname.includes('/register');
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');

  useEffect(() => {
    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    setUser(getCurrentUser()); // update on route change
    return () => window.removeEventListener('storage', handleStorage);
  }, [location]);

  // On logout, navigate to root
  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goBack = () => {
    navigate(-1);
  };

  // If on login or register path, show ONLY the logo (no tabs, no nav, nothing else)
  if (location.pathname.includes('/login') || location.pathname.includes('/register')) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <span
              className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-lime-700 cursor-pointer"
              onClick={() => {
                if (currentUser && (location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student'))) {
                  if (currentUser.role === 'teacher') {
                    navigate('/teacher/dashboard');
                  } else if (currentUser.role === 'student') {
                    navigate('/student/dashboard');
                  }
                } else {
                  navigate('/');
                }
              }}
            >
              Examily
            </span>
          </div>
        </div>
      </header>
    );
  }

  if ((isTeacherDash || isStudentDash) && !isAuthPage) {
    // Render Examily logo left, dashboard tabs right
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-lime-700 cursor-pointer"
                onClick={() => {
                  if (currentUser && (location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student'))) {
                    if (currentUser.role === 'teacher') {
                      navigate('/teacher/dashboard');
                    } else if (currentUser.role === 'student') {
                      navigate('/student/dashboard');
                    }
                  } else {
                    navigate('/');
                  }
                }}
              >
                Examily
              </span>
            </div>
          </div>
          <div id="dashboard-tabs-placeholder" className="flex items-center justify-end flex-1"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            {/* Remove back arrow on dashboard */}
            {(!isLanding && currentUser && !(location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student'))) && (
              <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span
                className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-lime-700 cursor-pointer"
                onClick={() => {
                  if (currentUser && currentUser.role === 'teacher') {
                    navigate('/teacher/dashboard');
                  } else if (currentUser && currentUser.role === 'student') {
                    navigate('/student/dashboard');
                  } else {
                    navigate('/');
                  }
                }}
              >
                Examily
              </span>
            </div>
          </div>
          {isLanding && (
            <Button
              className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-md text-sm font-semibold"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          )}
          {/* Hamburger menu only on teacher/student pages */}
          {currentUser && (location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student')) && (
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Hamburger menu content for teacher/student pages */}
        {currentUser && (location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student')) && isMenuOpen && (
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
              {currentUser ? (
                <Button variant="ghost" onClick={handleLogout} className="justify-start p-0">
                  Logout
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="justify-start p-0">
                  Log In
                </Button>
              )}
            </nav>
          </div>
        )}

        {/* Desktop navigation on teacher/student pages: Dashboard, Old Exams, My Profile, Log Out */}
        {currentUser && (location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student')) && !isAuthPage && (
          <div className="hidden md:flex items-center gap-4">
            <Button
              className={`px-6 py-2 rounded-md text-sm font-semibold ${location.pathname === (currentUser.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') ? 'bg-lime-600 hover:bg-lime-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
              onClick={() => {
                if (currentUser.role === 'teacher') {
                  navigate('/teacher/dashboard');
                } else {
                  navigate('/student/dashboard');
                }
              }}
            >
              Dashboard
            </Button>
            <Button
              className={`px-6 py-2 rounded-md text-sm font-semibold ${location.pathname === (currentUser.role === 'teacher' ? '/teacher/exams' : '/student/exams') ? 'bg-lime-600 hover:bg-lime-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
              onClick={() => {
                if (currentUser.role === 'teacher') {
                  navigate('/teacher/exams');
                } else {
                  navigate('/student/exams');
                }
              }}
            >
              Old Exams
            </Button>
            <Button
              className={`px-6 py-2 rounded-md text-sm font-semibold ${location.pathname === (currentUser.role === 'teacher' ? '/teacher/profile' : '/student/profile') ? 'bg-lime-600 hover:bg-lime-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
              onClick={() => {
                if (currentUser.role === 'teacher') {
                  navigate('/teacher/profile');
                } else {
                  navigate('/student/profile');
                }
              }}
            >
              My Profile
            </Button>
            {currentUser ? (
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md text-sm font-semibold"
                onClick={handleLogout}
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
            )}
          </div>
        )}

        {!isLanding && !(location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student')) && (
          <div className="flex items-center gap-4">
            {currentUser && currentUser.role === 'teacher' && (
              <Button
                className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-md text-sm font-semibold"
                onClick={() => navigate('/teacher/exams/create')}
              >
                Create New Exam
              </Button>
            )}
            {currentUser ? (
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-md text-sm font-semibold"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button
                className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-md text-sm font-semibold"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
            )}
          </div>
        )}

        {!isLanding && !(location.pathname.startsWith('/teacher') || location.pathname.startsWith('/student')) && (
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
                  ) : (
                    <Button variant="ghost" onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="justify-start p-0">
                      Log In
                    </Button>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
