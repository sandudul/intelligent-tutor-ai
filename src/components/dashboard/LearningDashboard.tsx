import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Target, 
  TrendingUp, 
  Brain,
  Plus,
  ChevronRight
} from 'lucide-react';

interface LearningSession {
  id: string;
  title: string;
  objectives: string[];
  status: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  subjects: {
    name: string;
    category: string;
    difficulty_level: number;
  };
}

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: number;
}

export const LearningDashboard = () => {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSession, setShowNewSession] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load learning sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select(`
          *,
          subjects (
            name,
            category,
            difficulty_level
          )
        `)
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Load available subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (subjectsError) throw subjectsError;

      setSessions(sessionsData || []);
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load your learning dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async (subjectId: string, title: string, objectives: string[]) => {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user?.id,
          subject_id: subjectId,
          title,
          objectives,
          status: 'active',
          progress: 0
        })
        .select(`
          *,
          subjects (
            name,
            category,
            difficulty_level
          )
        `)
        .single();

      if (error) throw error;

      setSessions([data, ...sessions]);
      setShowNewSession(false);
      
      toast({
        title: "Learning Session Created",
        description: `Started new session: ${title}`,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error Creating Session",
        description: "Failed to create new learning session.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalProgress = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + s.progress, 0) / sessions.length 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Learning sessions finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{Math.round(totalProgress)}%</div>
            <Progress value={totalProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Learning Sessions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>Your Learning Sessions</span>
          </h2>
          <Button 
            variant="hero" 
            size="sm"
            onClick={() => setShowNewSession(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Learning Sessions Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first learning session to experience our AI-powered tutoring system
              </p>
              <Button variant="hero" onClick={() => setShowNewSession(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-card transition-smooth">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{session.title}</span>
                        <Badge variant="secondary" className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {session.subjects.name} • {session.subjects.category} • Level {session.subjects.difficulty_level}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.objectives.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Learning Objectives:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {session.objectives.map((objective, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <Target className="h-3 w-3" />
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Started {new Date(session.started_at).toLocaleDateString()}</span>
                        </span>
                        {session.completed_at && (
                          <span className="flex items-center space-x-1 text-green-600">
                            <Target className="h-4 w-4" />
                            <span>Completed {new Date(session.completed_at).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{session.progress}%</span>
                      </div>
                      <Progress value={session.progress} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Start with Subjects */}
      {showNewSession && (
        <Card>
          <CardHeader>
            <CardTitle>Start New Learning Session</CardTitle>
            <CardDescription>
              Choose a subject to begin learning with our AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id} 
                  className="cursor-pointer hover:shadow-card transition-smooth border-2 hover:border-primary/30"
                  onClick={() => {
                    const title = `${subject.name} Learning Session`;
                    const objectives = [`Master ${subject.name} concepts`, 'Apply knowledge through practice'];
                    createNewSession(subject.id, title, objectives);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">{subject.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{subject.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Level {subject.difficulty_level}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowNewSession(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};