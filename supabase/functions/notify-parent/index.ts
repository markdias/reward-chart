import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    console.log('Webhook payload:', payload)

    const record = payload.record
    const table = payload.table

    if (!record || !record.child_id) {
      return new Response('Invalid payload', { status: 400 })
    }

    // Initialize Supabase Client to fetch data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the child details and their family
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('name, family_id')
      .eq('id', record.child_id)
      .single()

    if (childError || !child) {
      throw new Error(`Failed to fetch child: ${childError?.message}`)
    }

    // Fetch the parents of this family to get their IDs
    const { data: parents, error: parentError } = await supabase
      .from('parent_profiles')
      .select('id')
      .eq('family_id', child.family_id)

    if (parentError || !parents || parents.length === 0) {
      throw new Error(`Failed to fetch parents: ${parentError?.message}`)
    }

    // Prepare notification details
    let title = 'Reward Chart'
    let body = ''

    if (table === 'task_completions') {
      // Fetch the task name
      const { data: task } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', record.task_id)
        .single()
        
      body = `${child.name} has completed a task: ${task?.title || 'Unknown Task'}`
    } else if (table === 'redemptions') {
      // Fetch the reward name
      const { data: reward } = await supabase
        .from('rewards')
        .select('title')
        .eq('id', record.reward_id)
        .single()

      body = `${child.name} has claimed a reward: ${reward?.title || 'Unknown Reward'}`
    } else {
       return new Response('Unhandled table type', { status: 200 })
    }

    // Send OneSignal Notification
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID')
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY')

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.error('OneSignal keys missing - skipping notification')
      return new Response('Notification skipped due to missing API keys', { status: 200 })
    }

    const parentIds = parents.map(p => p.id)

    const notificationPayload = {
      app_id: oneSignalAppId,
      include_aliases: { external_id: parentIds },
      target_channel: "push",
      headings: { en: title },
      contents: { en: body },
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalApiKey}`
      },
      body: JSON.stringify(notificationPayload)
    })

    const result = await response.json()
    console.log('OneSignal Response:', result)

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
