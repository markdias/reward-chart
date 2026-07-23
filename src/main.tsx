import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import '@google/model-viewer';
import posthog from 'posthog-js';

try {
  if (import.meta.env.VITE_POSTHOG_PROJECT_TOKEN) {
    posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      opt_out_capturing_by_default: true,
    });
  }
} catch (e) {
  console.warn('PostHog initialization skipped or failed:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary name="RootApp">
      <ThemeProvider>
        <App />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);

