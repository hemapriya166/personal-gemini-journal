import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  FileText, 
  HelpCircle, 
  Compass, 
  Smile, 
  RotateCcw,
  Tag,
  PenTool
} from 'lucide-react';
import { ReflectionMode, JournalEntry } from '../types';

interface JournalEditorProps {
  onSubmit: (data: {
    title: string;
    content: string;
    mode: ReflectionMode;
    mood?: JournalEntry['mood'];
    tags: string[];
  }) => Promise<void>;
  isLoading: boolean;
}

const PROMPT_STARTERS = [
  "A complex decision I'm trying to navigate right now...",
  "What went unexpectedly well today and why...",
  "An obstacle where I feel stuck or uncertain...",
  "A belief I have held that might need revisiting..."
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  onSubmit,
  isLoading
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<ReflectionMode>('reflect');
  const [mood, setMood] = useState<JournalEntry['mood']>('reflective');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Reflection']);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleApplyStarter = (starter: string) => {
    if (!content) {
      setContent(starter + '\n\n');
    } else {
      setContent(prev => prev + '\n\n' + starter + '\n\n');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    await onSubmit({
      title: title.trim() || (content.slice(0, 45).replace(/\n/g, ' ') + (content.length > 45 ? '...' : '')),
      content: content.trim(),
      mode,
      mood,
      tags
    });

    // Reset inputs after successful submission
    setTitle('');
    setContent('');
    setTags(['Reflection']);
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Top bar: Mode Switcher */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Select Reflection Mode
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            
            <button
              type="button"
              id="mode-reflect-btn"
              onClick={() => setMode('reflect')}
              className={`flex items-center space-x-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                mode === 'reflect'
                  ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                  : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <Compass className="h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="font-semibold">Reflect & Grow</p>
                <p className="text-[10px] text-neutral-500 hidden sm:block">Empathetic analysis & reframing</p>
              </div>
            </button>

            <button
              type="button"
              id="mode-summarize-btn"
              onClick={() => setMode('summarize')}
              className={`flex items-center space-x-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                mode === 'summarize'
                  ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                  : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <FileText className="h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold">Summarize & Action</p>
                <p className="text-[10px] text-neutral-500 hidden sm:block">Key points & action steps</p>
              </div>
            </button>

            <button
              type="button"
              id="mode-brainstorm-btn"
              onClick={() => setMode('brainstorm')}
              className={`flex items-center space-x-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                mode === 'brainstorm'
                  ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                  : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <Lightbulb className="h-4 w-4 shrink-0 text-yellow-400" />
              <div>
                <p className="font-semibold">Brainstorm Ideas</p>
                <p className="text-[10px] text-neutral-500 hidden sm:block">Creative perspectives</p>
              </div>
            </button>

            <button
              type="button"
              id="mode-socratic-btn"
              onClick={() => setMode('socratic')}
              className={`flex items-center space-x-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                mode === 'socratic'
                  ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                  : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="font-semibold">Socratic Inquiry</p>
                <p className="text-[10px] text-neutral-500 hidden sm:block">Deep clarifying questions</p>
              </div>
            </button>

          </div>
        </div>

        {/* Title & Mood */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <input
              id="journal-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry Title (optional, e.g. 'Navigating a new project direction')"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <select
              id="journal-mood-select"
              value={mood}
              onChange={(e) => setMood(e.target.value as JournalEntry['mood'])}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2.5 text-sm text-neutral-200 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="reflective">🌿 Reflective</option>
              <option value="grateful">✨ Grateful</option>
              <option value="challenged">⛰️ Challenged</option>
              <option value="optimistic">☀️ Optimistic</option>
              <option value="curious">🔍 Curious</option>
              <option value="neutral">⚖️ Neutral</option>
            </select>
          </div>
        </div>

        {/* Prompt Inspiration Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-neutral-400">Prompt Inspiration:</span>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_STARTERS.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyStarter(starter)}
                className="rounded-full border border-neutral-800 bg-neutral-950/40 px-2.5 py-1 text-[11px] text-neutral-400 hover:border-amber-500/40 hover:bg-neutral-800 hover:text-amber-200 transition-colors"
              >
                + {starter.slice(0, 32)}...
              </button>
            ))}
          </div>
        </div>

        {/* Content Textarea */}
        <div className="relative">
          <textarea
            id="journal-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            placeholder="Write your journal entry, stream of consciousness, or dilemma here. Gemini will analyze, synthesize, and converse with you..."
            className="w-full resize-y rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm leading-relaxed text-neutral-100 placeholder-neutral-500 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-sans"
            required
          />
          
          {/* Counters */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-3 rounded-md bg-neutral-900/80 px-2 py-0.5 text-[10px] text-neutral-500 backdrop-blur-sm">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Tags input */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
            <Tag className="h-3.5 w-3.5 text-neutral-500" />
            <span>Tags:</span>
          </div>
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 rounded-md border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 text-xs text-neutral-300"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-neutral-500 hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
          {tags.length < 5 && (
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag + Enter"
              className="rounded-md border border-neutral-800 bg-neutral-950/50 px-2 py-0.5 text-xs text-neutral-300 placeholder-neutral-600 focus:border-amber-500/60 focus:outline-none"
            />
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setContent('');
              setTags(['Reflection']);
            }}
            className="flex items-center space-x-1.5 rounded-lg border border-neutral-800 px-3 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="submit"
            id="reflect-submit-btn"
            disabled={!content.trim() || isLoading}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                <span>Reflecting with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 stroke-[2.5]" />
                <span>Reflect with Gemini</span>
                <Send className="h-3.5 w-3.5 ml-1" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
