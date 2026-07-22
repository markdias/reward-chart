import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase';

export interface FeatureFlags {
  google_login: boolean;
  apple_login: boolean;
  beta_opt_in: boolean;
  insights_tab: boolean;
  [key: string]: boolean;
}

const defaultFlags: FeatureFlags = {
  google_login: false,
  apple_login: false,
  beta_opt_in: true,
  insights_tab: false,
};

export function useFeatureFlags(isBetaTester: boolean = false) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('*');

        if (error) throw error;
        
        if (data) {
          const newFlags = { ...defaultFlags };
          data.forEach(flag => {
            // A feature is enabled if it's enabled for all, 
            // OR if it's enabled for beta and the current user is a beta tester.
            // NOTE: Before login, parentProfile is null, so isBetaTester is false.
            newFlags[flag.feature_key] = flag.is_enabled_for_all || (flag.is_enabled_for_beta && isBetaTester);
          });
          setFlags(newFlags);
        }
      } catch (err) {
        console.error('Failed to load feature flags:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlags();
  }, [isBetaTester]);

  return { flags, loading };
}
