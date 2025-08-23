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

    const { sessionId, topic, learningObjectives, difficultyLevel, contentType } = await req.json();

    console.log('Content Generator Agent activated for user:', user.id);
    console.log('Request parameters:', { sessionId, topic, learningObjectives, difficultyLevel, contentType });

    // Communicate with Question Setter Agent about upcoming content
    await supabase.from('agent_communications').insert({
      session_id: sessionId,
      from_agent: 'content_generator',
      to_agent: 'question_setter',
      message_type: 'content_preview',
      payload: { topic, learningObjectives, difficultyLevel },
      status: 'sent'
    });

    // Create learning content with Gemini AI
    const prompt = `As an expert educational content creator, generate personalized learning material for the following:

Topic: ${topic}
Learning Objectives: ${learningObjectives?.join(', ') || 'General understanding'}
Difficulty Level: ${difficultyLevel}/5
Content Type: ${contentType}

Please create comprehensive, engaging content that:
1. Clearly explains the core concepts
2. Uses real-world examples and analogies
3. Is appropriate for difficulty level ${difficultyLevel}
4. Includes interactive elements or thought-provoking questions
5. Follows best educational practices

Format the response as structured educational content with clear sections.`;

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
          temperature: 0.7,
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

    const generatedContent = geminiData.candidates[0].content.parts[0].text;
    const estimatedReadTime = Math.ceil(generatedContent.length / 200); // ~200 chars per minute

    // Store generated content in database
    const { data: contentData, error: contentError } = await supabase
      .from('generated_content')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        agent_type: 'content_generator',
        content_type: contentType || 'explanation',
        title: `${topic} - ${contentType || 'Explanation'}`,
        content: generatedContent,
        difficulty_level: difficultyLevel,
        estimated_read_time: estimatedReadTime,
        metadata: {
          learning_objectives: learningObjectives,
          generated_at: new Date().toISOString(),
          model: 'gemini-1.5-flash-latest'
        }
      })
      .select()
      .single();

    if (contentError) {
      throw contentError;
    }

    // Notify other agents about content generation
    await Promise.all([
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'content_generator',
        to_agent: 'question_setter',
        message_type: 'content_ready',
        payload: { 
          contentId: contentData.id,
          topic,
          difficultyLevel,
          contentLength: generatedContent.length
        },
        status: 'sent'
      }),
      supabase.from('agent_communications').insert({
        session_id: sessionId,
        from_agent: 'content_generator',
        to_agent: 'feedback_evaluator',
        message_type: 'learning_context',
        payload: {
          contentId: contentData.id,
          topic,
          learningObjectives,
          difficultyLevel
        },
        status: 'sent'
      })
    ]);

    console.log('Content generated successfully:', contentData.id);

    return new Response(JSON.stringify({
      success: true,
      content: contentData,
      message: 'Educational content generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-generator-agent:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});