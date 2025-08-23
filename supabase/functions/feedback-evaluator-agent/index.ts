import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { responseId, sessionId } = await req.json();

    console.log('Feedback Evaluator Agent activated for user:', user.id);
    console.log('Evaluating response:', responseId);

    // Get the user response and related question
    const { data: response } = await supabase
      .from('user_responses')
      .select(`
        *,
        questions (
          question_text,
          question_type,
          correct_answer,
          explanation,
          difficulty_level,
          points,
          options
        )
      `)
      .eq('id', responseId)
      .single();

    if (!response) {
      throw new Error('Response not found');
    }

    const question = response.questions;

    // Get session context and learning objectives
    const { data: session } = await supabase
      .from('learning_sessions')
      .select('title, objectives')
      .eq('id', sessionId)
      .single();

    // Get user's learning history for personalized feedback
    const { data: userHistory } = await supabase
      .from('user_responses')
      .select('is_correct, time_spent')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .neq('id', responseId);

    // Communicate with other agents about evaluation process
    await Promise.all([
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'feedback_evaluator',
        to_agent: 'content_generator',
        message_type: 'evaluation_started',
        payload: { 
          responseId,
          questionType: question.question_type,
          isCorrect: response.is_correct
        },
        status: 'sent'
      }),
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'feedback_evaluator',
        to_agent: 'question_setter',
        message_type: 'response_analyzed',
        payload: { 
          responseId,
          difficultyLevel: question.difficulty_level,
          performanceIndicator: response.is_correct ? 'correct' : 'incorrect'
        },
        status: 'sent'
      })
    ]);

    // Calculate performance metrics
    const correctAnswers = userHistory?.filter(h => h.is_correct).length || 0;
    const totalAnswers = (userHistory?.length || 0) + 1;
    const averageTime = userHistory?.length 
      ? (userHistory.reduce((sum, h) => sum + (h.time_spent || 0), 0) + response.time_spent) / (userHistory.length + 1)
      : response.time_spent;

    const prompt = `As an expert educational feedback specialist, provide comprehensive, personalized feedback for the following student response:

QUESTION: ${question.question_text}
QUESTION TYPE: ${question.question_type}
CORRECT ANSWER: ${question.correct_answer}
STUDENT ANSWER: ${response.answer}
IS CORRECT: ${response.is_correct ? 'Yes' : 'No'}
TIME SPENT: ${response.time_spent} seconds
DIFFICULTY LEVEL: ${question.difficulty_level}/5

LEARNING CONTEXT:
- Session: ${session?.title || 'Learning Session'}
- Objectives: ${session?.objectives?.join(', ') || 'General learning'}
- Student Performance: ${correctAnswers}/${totalAnswers} correct answers
- Average Response Time: ${Math.round(averageTime || 0)} seconds

${question.options ? `ANSWER OPTIONS: ${JSON.stringify(question.options)}` : ''}

Please provide detailed feedback that includes:

1. IMMEDIATE FEEDBACK: Whether the answer is correct/incorrect with brief explanation
2. DETAILED ANALYSIS: Why the answer is right/wrong, addressing misconceptions
3. STRENGTHS: What the student did well (even if incorrect)
4. AREAS FOR IMPROVEMENT: Specific areas to focus on
5. NEXT STEPS: Concrete actions for improvement
6. LEARNING PATH RECOMMENDATIONS: Suggested topics/resources for further study

FORMAT: Return a JSON object with these exact fields:
{
  "feedback_text": "Main feedback paragraph",
  "score": number (0-100),
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "next_steps": ["step1", "step2"],
  "learning_path_recommendations": {
    "immediate": ["topic1", "topic2"],
    "future": ["advanced_topic1", "advanced_topic2"],
    "resources": ["resource1", "resource2"]
  }
}

Make feedback constructive, encouraging, and actionable. Adapt tone to student's performance level.`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1536,
        }
      })
    });

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;
    
    // Clean and parse JSON response
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let feedbackData;
    
    try {
      feedbackData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse feedback JSON:', cleanJson);
      // Fallback to basic feedback
      feedbackData = {
        feedback_text: responseText,
        score: response.is_correct ? 100 : 0,
        strengths: response.is_correct ? ["Correct answer"] : ["Attempted the question"],
        improvements: response.is_correct ? [] : ["Review the correct answer and explanation"],
        next_steps: ["Continue practicing similar questions"],
        learning_path_recommendations: {
          immediate: ["Review explanation"],
          future: ["Practice more questions"],
          resources: ["Study materials"]
        }
      };
    }

    // Store feedback in database
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        response_id: responseId,
        user_id: user.id,
        agent_type: 'feedback_evaluator',
        feedback_text: feedbackData.feedback_text,
        score: feedbackData.score,
        strengths: feedbackData.strengths,
        improvements: feedbackData.improvements,
        next_steps: feedbackData.next_steps,
        learning_path_recommendations: feedbackData.learning_path_recommendations
      })
      .select()
      .single();

    if (feedbackError) {
      throw feedbackError;
    }

    // Notify other agents about feedback completion
    await Promise.all([
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'feedback_evaluator',
        to_agent: 'content_generator',
        message_type: 'feedback_complete',
        payload: {
          feedbackId: feedback.id,
          score: feedback.score,
          needsRemediation: feedback.score < 70,
          learningGaps: feedback.improvements
        },
        status: 'sent'
      }),
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'feedback_evaluator',
        to_agent: 'question_setter',
        message_type: 'performance_update',
        payload: {
          studentPerformance: {
            currentScore: feedback.score,
            overallAccuracy: correctAnswers / totalAnswers,
            averageResponseTime: averageTime
          },
          adaptationNeeded: feedback.score < 70 ? 'easier' : feedback.score > 90 ? 'harder' : 'maintain'
        },
        status: 'sent'
      })
    ]);

    console.log('Feedback generated successfully for response:', responseId);

    return new Response(JSON.stringify({
      success: true,
      feedback: feedback,
      performance: {
        score: feedback.score,
        accuracy: correctAnswers / totalAnswers,
        averageTime: Math.round(averageTime || 0)
      },
      message: 'Feedback generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in feedback-evaluator-agent:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});