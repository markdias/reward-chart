// supabase/functions/scan-chart/index.ts
// Supabase Edge Function — AI Chart Scanner
//
// Called from the parent app with:
//   { imageBase64: string, childId: string, weekStartDate: string (YYYY-MM-DD) }
//
// Set the Gemini API key as a Supabase secret (get key from https://aistudio.google.com/apikey):
//   supabase secrets set GEMINI_API_KEY=AIza...
// Then deploy:
//   supabase functions deploy scan-chart

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  imageBase64: string;
  imageMimeType?: string;
  childId: string;
  weekStartDate: string;
  chartId?: string;
}

interface TaskDetection {
  taskId: string;
  taskTitle: string;
  dayIndex: number;
  detected: boolean;
  confidence: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ScanRequest = await req.json();
    const { imageBase64, imageMimeType = 'image/jpeg', childId, weekStartDate, chartId } = body;

    if (!imageBase64 || !childId || !weekStartDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check Pro status
    const { data: profile } = await supabase
      .from('parent_profiles')
      .select('is_pro')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_pro) {
      return new Response(JSON.stringify({ error: 'This feature requires a Pro subscription.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check 1 scan/week limit (non-fatal if chart_scans table doesn't exist yet)
    try {
      const { data: existingScans } = await supabase
        .from('chart_scans')
        .select('id')
        .eq('child_id', childId)
        .eq('week_start_date', weekStartDate)
        .eq('parent_id', user.id);

      if (existingScans && existingScans.length > 0) {
        return new Response(JSON.stringify({
          error: 'weekly_limit_reached',
          message: 'You have already scanned a chart for this child this week.',
        }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (limitCheckErr) {
      // Table may not exist yet — allow the scan to proceed
      console.warn('chart_scans limit check skipped:', String(limitCheckErr));
    }

    // Fetch child's active tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, category, points')
      .eq('child_id', childId)
      .eq('is_active', true)
      .neq('is_template', true);

    if (tasksError || !tasks) {
      return new Response(JSON.stringify({ error: 'Failed to fetch tasks for child' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (tasks.length === 0) {
      return new Response(JSON.stringify({ detections: [] }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build Gemini Vision prompt
    const taskListText = tasks
      .map((t, idx) => `Row ${idx + 1} (taskId="${t.id}"): "${t.title}"`)
      .join('\n');

    const prompt = `You are analysing a photograph of a printed children's chore chart.

The chart has these task rows in order from top to bottom:
${taskListText}

The chart has 7 columns for days of the week: Mon=dayIndex 0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6.

Each cell has a hollow star outline. When the child completed that chore on that day, they COLOURED IN the star with a pen or crayon (the star appears filled/coloured).

For EVERY combination of task row x day column (${tasks.length} tasks x 7 days = ${tasks.length * 7} total entries), determine:
- detected: true if the star appears coloured/filled, false if it is still hollow/empty
- confidence: 0.0 to 1.0 (how sure you are)

Reply ONLY with a JSON object. No markdown, no explanation, no code fences. Example format:
{"detections":[{"taskId":"abc","taskTitle":"Make bed","dayIndex":0,"detected":true,"confidence":0.95},{"taskId":"abc","taskTitle":"Make bed","dayIndex":1,"detected":false,"confidence":0.9}]}`;

    // Check for API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({
        error: 'GEMINI_API_KEY secret is not configured on the server. Please contact support.',
      }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Gemini Vision API (gemini-1.5-flash — widely available, excellent vision)
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: imageMimeType, data: imageBase64 } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    };

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error status:', geminiResponse.status, 'body:', errText);
      return new Response(JSON.stringify({
        error: `AI service error (${geminiResponse.status}). Please try again.`,
        detail: errText.substring(0, 300),
      }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      console.error('Gemini returned empty text. Full response:', JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: 'AI returned no results. Try a clearer photo.' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    let parsedResult: { detections: TaskDetection[] };
    try {
      parsedResult = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response:', cleaned.substring(0, 500));
      return new Response(JSON.stringify({ error: 'AI returned an unexpected format. Try again.' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const detections: TaskDetection[] = (parsedResult?.detections ?? []).filter(
      (d): d is TaskDetection =>
        typeof d.taskId === 'string' &&
        typeof d.dayIndex === 'number' &&
        typeof d.detected === 'boolean'
    );

    // Log scan to chart_scans table (best-effort — non-fatal)
    const detectedCount = detections.filter(d => d.detected).length;
    try {
      await supabase.from('chart_scans').insert({
        parent_id: user.id,
        child_id: childId,
        week_start_date: weekStartDate,
        tasks_detected: detectedCount,
        tasks_confirmed: 0,
        chart_id: chartId ?? null,
      });
    } catch (insertErr) {
      console.warn('chart_scans insert skipped (table may not exist yet):', String(insertErr));
    }

    return new Response(JSON.stringify({ detections }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('scan-chart function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
