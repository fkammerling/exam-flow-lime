import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '@/api';
import { setCurrentUser } from '@/utils/localStorage';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['student', 'teacher'], { required_error: 'Role is required' }),
  program: z.string().min(2, { message: 'Study program must be at least 2 characters.' }).optional(),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }).optional(),
});

const Auth = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'student', program: '', subject: '' },
  });

  async function handleLogin(values: any) {
    setIsLoading(true);
    try {
      const res = await loginUser(values.email, values.password);
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user); 
      toast({ title: 'Login successful', description: `Welcome, ${res.user.name}!` });
      if (res.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (e: any) {
      toast({ title: 'Login failed', description: e.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(values: any) {
    setIsLoading(true);
    try {
      // Send role-specific fields
      const res = await registerUser(
        values.name,
        values.email,
        values.password,
        values.role,
        values.role === 'student' ? values.program : undefined,
        values.role === 'teacher' ? values.subject : undefined
      );
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user); 
      toast({ title: 'Registration successful', description: `Welcome, ${values.name}!` });
      if (values.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (e: any) {
      toast({ title: 'Registration failed', description: e.message || 'Could not register', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Portal Login</CardTitle>
            <CardDescription className="text-center">
              {tab === 'login' ? 'Login to your account' : 'Register a new account'}
            </CardDescription>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant={tab === 'login' ? 'default' : 'outline'} onClick={() => setTab('login')}>Login</Button>
              <Button variant={tab === 'register' ? 'default' : 'outline'} onClick={() => setTab('register')}>Register</Button>
            </div>
          </CardHeader>
          <CardContent>
            {tab === 'login' ? (
              <Form {...loginForm} key="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6" key="login-form">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} autoComplete="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} autoComplete="current-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm} key="register">
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6" key="register-form">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} autoComplete="name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} autoComplete="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Choose a password" {...field} autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={field.value === 'student' ? 'default' : 'outline'}
                                onClick={() => field.onChange('student')}
                              >
                                Student
                              </Button>
                              <Button
                                type="button"
                                variant={field.value === 'teacher' ? 'default' : 'outline'}
                                onClick={() => field.onChange('teacher')}
                              >
                                Teacher
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {registerForm.watch('role') === 'student' && (
                    <FormField
                      control={registerForm.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Study Program</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your study program" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {registerForm.watch('role') === 'teacher' && (
                    <FormField
                      control={registerForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your teaching subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
