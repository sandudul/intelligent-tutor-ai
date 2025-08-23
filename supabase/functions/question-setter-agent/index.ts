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

    const { sessionId, contentId, questionType, numberOfQuestions, difficultyLevel } = await req.json();

    console.log('Question Setter Agent activated for user:', user.id);
    console.log('Request parameters:', { sessionId, contentId, questionType, numberOfQuestions, difficultyLevel });

    // Get the content to base questions on
    let contentText = '';
    if (contentId) {
      const { data: content } = await supabase
        .from('generated_content')
        .select('content, title, metadata')
        .eq('id', contentId)
        .single();
      
      if (content) {
        contentText = content.content;
      }
    }

    // Get session information for context
    const { data: session } = await supabase
      .from('learning_sessions')
      .select('title, objectives, subject_id')
      .eq('id', sessionId)
      .single();

    // Communicate with Feedback Evaluator about upcoming questions
    await supabase.from('agent_communications').insert({
      session_id: sessionId,
      from_agent: 'question_setter',
      to_agent: 'feedback_evaluator',
      message_type: 'questions_preview',
      payload: { 
        questionType, 
        numberOfQuestions, 
        difficultyLevel,
        contentId 
      },
      status: 'sent'
    });

    const prompt = `As an expert educational assessment creator, generate ${numberOfQuestions || 3} high-quality ${questionType || 'multiple choice'} questions based on the following learning content:

${contentText ? `CONTENT TO ASSESS:\n${contentText}\n\n` : ''}

SESSION CONTEXT:
- Title: ${session?.title || 'Learning Session'}
- Objectives: ${session?.objectives?.join(', ') || 'General learning'}
- Difficulty Level: ${difficultyLevel}/5
- Question Type: ${questionType || 'mcq'}

REQUIREMENTS:
1. Create questions that test understanding, not just memorization
2. Ensure questions are appropriate for difficulty level ${difficultyLevel}
3. Include clear, unambiguous correct answers
4. For MCQ: Provide 4 options with plausible distractors
5. For essay questions: Provide clear evaluation criteria
6. Include explanations for correct answers

Format each question as a JSON object with these fields:
- question_text: The question
- question_type: "${questionType || 'mcq'}"
- options: Array of answer choices (for MCQ) or null
- correct_answer: The correct answer
- explanation: Why this is correct
- difficulty_level: ${difficultyLevel}
- points: Suggested point value

Return ONLY a JSON array of question objects, no additional text.`;

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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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
    let questions;
    
    try {
      questions = JSON.parse(cleanJson);
      if (!Array.isArray(questions)) {
        questions = [questions];
      }
    } catch (parseError) {
      console.error('Failed to parse questions JSON:', cleanJson);
      throw new Error('Failed to parse generated questions');
    }

    // Store questions in database
    const questionInserts = questions.map(q => ({
      session_id: sessionId,
      user_id: user.id,
      agent_type: 'question_setter',
      question_type: q.question_type || questionType || 'mcq',
      question_text: q.question_text,
      options: q.options || null,
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      difficulty_level: q.difficulty_level || difficultyLevel,
      points: q.points || 1,
      metadata: {
        content_id: contentId,
        generated_at: new Date().toISOString(),
        model: 'gemini-1.5-flash-latest'
      }
    }));

    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert(questionInserts)
      .select();

    if (questionError) {
      throw questionError;
    }

    // Notify other agents about questions ready
    await Promise.all([
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'question_setter',
        to_agent: 'content_generator',
        message_type: 'assessment_ready',
        payload: { 
          questionCount: questionData.length,
          questionTypes: [...new Set(questionData.map(q => q.question_type))],
          totalPoints: questionData.reduce((sum, q) => sum + q.points, 0)
        },
        status: 'sent'
      }),
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'question_setter',
        to_agent: 'feedback_evaluator',
        message_type: 'questions_ready',
        payload: {
          questionIds: questionData.map(q => q.id),
          difficultyLevel,
          assessmentType: questionType
        },
        status: 'sent'
      })
    ]);

    console.log('Questions generated successfully:', questionData.length, 'questions');

    return new Response(JSON.stringify({
      success: true,
      questions: questionData,
      message: `${questionData.length} questions generated successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in question-setter-agent:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});