import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface TutoringSessionProps {
  sessionId: string;
}

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  content_type: string;
  estimated_read_time: number;
  difficulty_level: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string;
  points: number;
  difficulty_level: number;
}

interface Feedback {
  id: string;
  feedback_text: string;
  score: number;
  strengths: string[];
  improvements: string[];
  next_steps: string[];
  learning_path_recommendations: any;
}

export const TutoringSession = ({ sessionId }: TutoringSessionProps) => {
  const [currentStep, setCurrentStep] = useState<'content' | 'questions' | 'feedback'>('content');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .select(`
          *,
          subjects (
            name,
            category,
            difficulty_level
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSessionData(data);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error Loading Session",
        description: "Failed to load learning session data.",
        variant: "destructive",
      });
    }
  };

  const generateContent = async () => {
    if (!sessionData) return;
    
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('content-generator-agent', {
        body: {
          sessionId: sessionData.id,
          topic: sessionData.subjects.name,
          learningObjectives: sessionData.objectives,
          difficultyLevel: sessionData.subjects.difficulty_level,
          contentType: 'explanation'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      setContent(response.data.content);
      toast({
        title: "Content Generated!",
        description: "Your personalized learning content is ready.",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Content Generation Failed",
        description: "Failed to generate learning content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!content) return;
    
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('question-setter-agent', {
        body: {
          sessionId: sessionData.id,
          contentId: content.id,
          questionType: 'mcq',
          numberOfQuestions: 3,
          difficultyLevel: content.difficulty_level
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) throw response.error;

      setQuestions(response.data.questions);
      setCurrentStep('questions');
      toast({
        title: "Questions Ready!",
        description: `${response.data.questions.length} questions generated for assessment.`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Question Generation Failed",
        description: "Failed to generate assessment questions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const answer = currentQuestion.question_type === 'mcq' ? selectedOption : userAnswer;
    if (!answer) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Submit user response
      const { data: responseData, error: responseError } = await supabase
        .from('user_responses')
        .insert({
          question_id: currentQuestion.id,
          user_id: user?.id,
          session_id: sessionData.id,
          answer,
          is_correct: answer === currentQuestion.correct_answer,
          time_spent: Math.floor(Math.random() * 60) + 30 // Mock time spent
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Generate feedback
      const feedbackResponse = await supabase.functions.invoke('feedback-evaluator-agent', {
        body: {
          responseId: responseData.id,
          sessionId: sessionData.id
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (feedbackResponse.error) throw feedbackResponse.error;

      setFeedback(feedbackResponse.data.feedback);
      setCurrentStep('feedback');
      
      toast({
        title: "Answer Submitted!",
        description: "AI feedback is being generated for your response.",
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your answer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setSelectedOption('');
      setFeedback(null);
      setCurrentStep('questions');
    } else {
      // Session complete
      toast({
        title: "Session Complete!",
        description: "You've completed all questions in this learning session.",
      });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (currentStep === 'feedback' ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Session Header */}
      {sessionData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <span>{sessionData.title}</span>
                </CardTitle>
                <CardDescription>
                  {sessionData.subjects.name} • Level {sessionData.subjects.difficulty_level}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>Content Generator</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <HelpCircle className="h-3 w-3" />
                  <span>Question Setter</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>Feedback Evaluator</span>
                </Badge>
              </div>
            </div>
            {questions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Content Generation Step */}
      {currentStep === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Content Generator Agent</span>
            </CardTitle>
            <CardDescription>
              AI-powered content generation tailored to your learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!content ? (
              <div className="text-center space-y-4">
                <Sparkles className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate Learning Content</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI will create personalized educational content based on your session objectives
                  </p>
                  <Button 
                    variant="hero" 
                    onClick={generateContent}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Learning Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{content.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{content.estimated_read_time} min read</span>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap">{content.content}</div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="hero" 
                    onClick={generateQuestions}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        Continue to Assessment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions Step */}
      {currentStep === 'questions' && currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-secondary" />
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              <Badge variant="outline">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-lg font-medium">
                {currentQuestion.question_text}
              </div>
              
              {currentQuestion.question_type === 'mcq' && currentQuestion.options ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option: string, index: number) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedOption === option}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="text-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <Textarea
                  placeholder="Type your answer here..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={4}
                />
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="hero"
                  onClick={submitAnswer}
                  disabled={loading || (!userAnswer && !selectedOption)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Answer...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Step */}
      {currentStep === 'feedback' && feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              <span>AI Feedback & Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-primary">{feedback.score}%</div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className={`h-5 w-5 ${feedback.score >= 70 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-medium">
                      {feedback.score >= 70 ? 'Well Done!' : 'Keep Learning!'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>{feedback.feedback_text}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {feedback.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {feedback.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {feedback.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <ArrowRight className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {feedback.next_steps.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Next Steps</h4>
                  <ul className="space-y-2">
                    {feedback.next_steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-end">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button variant="hero" onClick={nextQuestion}>
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button variant="hero" onClick={() => window.history.back()}>
                    Complete Session
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};