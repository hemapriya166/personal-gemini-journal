import React from 'react';
import { Shield, X, Lock, Database, Cpu, FileCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-2xl text-neutral-100 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-100">
                Agentic Threat Model & Security Specification
              </h3>
              <p className="text-xs text-neutral-400">
                Architecture review mapping the 5 Threat Zones & OWASP Top 10 for LLM Applications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6 text-xs leading-relaxed">
          
          {/* Executive Table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800 bg-neutral-900/80 text-neutral-400 font-semibold">
                <tr>
                  <th className="p-3">Threat Zone</th>
                  <th className="p-3">Identified Vulnerability / Risk</th>
                  <th className="p-3">Implemented Countermeasure</th>
                  <th className="p-3">Standard Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                <tr>
                  <td className="p-3 font-semibold text-amber-300">1. Input Surfaces</td>
                  <td className="p-3">Oversized payloads, script injection, malformed request bodies</td>
                  <td className="p-3">Defensive payload ingestion, null-safe destructuring, top-level body decoding limits</td>
                  <td className="p-3 text-neutral-400">OWASP A03 / LLM02</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-300">2. Planning & Reasoning</td>
                  <td className="p-3">Indirect prompt injection, instruction hijack via user journal inputs</td>
                  <td className="p-3">Separated system instructions, strict contextual framing, plain-data reflection treatment</td>
                  <td className="p-3 text-neutral-400">OWASP LLM01</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-300">3. Tool Execution</td>
                  <td className="p-3">Client-side API key leakage, unauthorized AI proxy abuse</td>
                  <td className="p-3">Strict server-side proxying (`/api/reflect`, `/api/chat`), zero browser exposure of `GEMINI_API_KEY`</td>
                  <td className="p-3 text-neutral-400">OWASP A01 / LLM05</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-300">4. Memory & State</td>
                  <td className="p-3">Cross-user journal leaks, unauthorized reads/writes, undefined serialization crashes</td>
                  <td className="p-3">Owner-isolated subcollection rules (`request.auth.uid == userId`), deep undefined-sanitization filter</td>
                  <td className="p-3 text-neutral-400">OWASP A01 / Top 10</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-300">5. Inter-System Comm.</td>
                  <td className="p-3">Outage during peak traffic, 503/429 throttling, credential hardcoding</td>
                  <td className="p-3">Resilient 4-step Fallback Ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`), Secret Manager integration</td>
                  <td className="p-3 text-neutral-400">OWASP A05 / LLM04</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detailed Security Rules */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-neutral-200 flex items-center space-x-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Deployed Firestore Security Rules (Owner-Bound Isolation)</span>
            </h4>
            <pre className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
            </pre>
          </div>

          {/* Model Resilience Ladder */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-neutral-200 flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>Resilient Gemini Fallback Ladder</span>
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-amber-400">1. Primary</span>
                <p className="font-mono text-xs text-neutral-200">gemini-3.6-flash</p>
                <p className="text-[10px] text-neutral-500">Low latency & high efficiency</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-blue-400">2. HA Fallback</span>
                <p className="font-mono text-xs text-neutral-200">gemini-3.1-flash-lite</p>
                <p className="text-[10px] text-neutral-500">Lightweight high availability</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-purple-400">3. Dynamic Alias</span>
                <p className="font-mono text-xs text-neutral-200">gemini-flash-latest</p>
                <p className="text-[10px] text-neutral-500">Platform automatic router</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-2.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400">4. Deep Reasoning</span>
                <p className="font-mono text-xs text-neutral-200">gemini-3.7-flash</p>
                <p className="text-[10px] text-neutral-500">Deep thought synthesis</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            Close Specification
          </button>
        </div>

      </div>
    </div>
  );
};
