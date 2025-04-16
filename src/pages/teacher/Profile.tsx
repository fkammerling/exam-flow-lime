
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, saveUser, User } from '@/utils/localStorage';
import { toast } from '@/components/ui/use-toast';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'teacher') {
      navigate('/teacher/login');
      return;
    }
    setProfile(user);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      saveUser(profile);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }
  };

  if (!profile) return null;

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Profile Settings</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={profile.subject || ''}
                    onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
                  />
                </div>
                <Button type="submit" className="bg-lime-600 hover:bg-lime-700">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherProfile;
