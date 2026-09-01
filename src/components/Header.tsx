import React from 'react';
import { Sparkles, Shield, LogOut, User as UserIcon, Database, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onSignOut: () => void;
  onOpenThreatModel: () => void;
  syncStatus?: 'synced' | 'saving' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignOut,
  onOpenThreatModel,
  syncStatus = 'synced'
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 shadow-md shadow-amber-500/20">
            <Sparkles className="h-5 w-5 text-neutral-950 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-lg font-bold tracking-tight text-neutral-100">
                Reflect<span className="text-amber-400">AI</span>
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Authenticated Journal & Reflection Assistant
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Security & Threat Model Trigger */}
          <button
            id="threat-model-btn"
            onClick={onOpenThreatModel}
            className="flex items-center space-x-1.5 rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-amber-500/40 hover:bg-neutral-800 hover:text-amber-300"
            title="View Agentic Threat Model & OWASP Security Specs"
          >
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Security Architecture</span>
          </button>

          {user && (
            <>
              {/* Firestore Status Indicator */}
              <div className="hidden lg:flex items-center space-x-1.5 rounded-full border border-neutral-800 bg-neutral-950/60 px-2.5 py-1 text-xs text-neutral-400">
                <Database className="h-3 w-3 text-emerald-400" />
                <span className="text-[11px]">Firestore Isolated</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              </div>

              {/* User Profile info */}
              <div className="flex items-center space-x-3 border-l border-neutral-800 pl-3 sm:pl-4">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full border border-neutral-700 object-cover ring-1 ring-amber-500/30"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-300">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="hidden text-left sm:block">
                    <p className="text-xs font-medium text-neutral-200 leading-tight">
                      {user.displayName || 'Authenticated User'}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                      {user.email || 'user@firestore.secure'}
                    </p>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  id="sign-out-btn"
                  onClick={onSignOut}
                  className="flex items-center space-x-1 rounded-md border border-neutral-700/80 bg-neutral-800/60 px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-300"
                  title="Sign out of Firebase"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
