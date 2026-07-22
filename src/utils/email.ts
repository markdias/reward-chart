import { getSupabaseClient } from './supabase';

export interface SendEmailOptions {
  to: string;
  name?: string;
  subject?: string;
  html?: string;
}

/**
 * Sends a welcome email to a newly registered user using the send-email Edge Function via Resend.
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'welcome',
          to: email,
          name: name || 'Parent',
        },
      });

      if (error) {
        console.warn('Welcome email Edge Function invoke notice:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    return { success: false, error: 'Supabase client is not configured' };
  } catch (err: any) {
    console.warn('Exception sending welcome email:', err);
    return { success: false, error: err?.message || 'Failed to send welcome email' };
  }
}

/**
 * Initiates a password reset flow using Supabase Auth.
 * Supabase Auth routes the reset email through Resend SMTP.
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured' };
    }

    const redirectUrl = `${window.location.origin}/?mode=reset_password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to request password reset' };
  }
}
