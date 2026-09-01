import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  Brain,
  MessageSquare,
  History,
  FileText
} from 'lucide-react';

interface AuthLandingProps {
  onSignIn: () => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onSignIn,
  loading,
  error
}) => {
  const [authError, setAuthError] = useState<string | null>(error || null);

  const handleSignInClick = async () => {
    try {
      setAuthError(null);
      await onSignIn();
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-12 text-center">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Studio Cloud Run Edition • Gemini 3.6 Flash</span>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-100 sm:text-5xl lg:text-6xl">
            Reflect deeper. Think clearer.{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              In complete privacy.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-neutral-400 sm:text-lg">
            An authenticated, intelligent journal powered by Gemini. Capture raw reflections, 
            explore multi-turn insights, and securely store your personal interactions in user-isolated Cloud Firestore.
          </p>
        </div>

        {/* Auth Action Card */}
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-100">
                Sign in to your private journal
              </h2>
              <p className="text-xs text-neutral-400">
                Federated authentication via Google. No passwords stored.
              </p>
            </div>

            {authError && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-left text-xs text-red-300">
                <p className="font-semibold">Authentication Error</p>
                <p className="mt-0.5 text-red-400">{authError}</p>
              </div>
            )}

            {/* Google Sign-In CTA */}
            <button
              id="google-sign-in-btn"
              onClick={handleSignInClick}
              disabled={loading}
              className="group relative flex w-full items-center justify-center space-x-3 rounded-xl border border-neutral-700 bg-white px-5 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-200 hover:bg-neutral-100 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                  <span>Connecting to Firebase Auth...</span>
                </div>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="h-4 w-4 text-neutral-500 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Owner-isolated Firestore security rules active</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5 space-y-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">
              Multi-Turn Gemini Dialogue
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Converse with Gemini 3.6 Flash to unpack nuanced challenges, uncover blind spots, and brainstorm breakthroughs.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5 space-y-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">
              User-Isolated Firestore Storage
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every journal entry and reflection is strictly bounded to your user identity via authenticated subcollection security rules.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5 space-y-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">
              Resilient Fallback Ladder
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Backend architecture with multi-model fallback ladders guarantees uptime and reliable AI generation across all sessions.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
