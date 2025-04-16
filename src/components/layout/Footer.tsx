
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Link to="/" className="font-semibold">
            ExamFlow
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ExamFlow. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
