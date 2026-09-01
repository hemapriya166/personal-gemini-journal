import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Send, 
  ArrowLeft, 
  User, 
  Bot, 
  Copy, 
  Check, 
  Clock, 
  Tag, 
  Compass, 
  FileText, 
  Lightbulb, 
  HelpCircle,
  Database,
  Share2
} from 'lucide-react';
import { JournalEntry, ChatMessage } from '../types';

interface ChatThreadProps {
  entry: JournalEntry;
  onBack: () => void;
  onSendMessage: (text: string) => Promise<void>;
  isReplying: boolean;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  entry,
  onBack,
  onSendMessage,
  isReplying
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entry.messages, isReplying]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isReplying) return;
    const textToSend = inputText.trim();
    setInputText('');
    await onSendMessage(textToSend);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'summarize': return <FileText className="h-3.5 w-3.5 text-emerald-400" />;
      case 'brainstorm': return <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />;
      case 'socratic': return <HelpCircle className="h-3.5 w-3.5 text-blue-400" />;
      default: return <Compass className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            id="back-to-editor-btn"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-800/60 text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
            title="Return to Journal Editor"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="font-serif text-base font-bold text-neutral-100 sm:text-lg">
              {entry.title || 'Untitled Reflection'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-neutral-400">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-neutral-500" />
                <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1 rounded bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300">
                {getModeIcon(entry.mode)}
                <span className="capitalize">{entry.mode}</span>
              </span>
              {entry.mood && (
                <span className="rounded bg-neutral-800/60 px-2 py-0.5 text-[11px] text-neutral-400">
                  Mood: {entry.mood}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <Database className="h-3 w-3" />
            <span>Firestore Synced</span>
          </span>
        </div>
      </div>

      {/* Primary Journal Content Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <User className="h-4 w-4" />
            <span>Original Journal Reflection</span>
          </div>
          <button
            onClick={() => handleCopy(entry.content, 'original')}
            className="flex items-center space-x-1 rounded-md px-2 py-1 text-[11px] text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          >
            {copiedId === 'original' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedId === 'original' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200 font-sans">
          {entry.content}
        </div>

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-neutral-800/60">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-neutral-800 bg-neutral-950/60 px-2 py-0.5 text-[11px] text-neutral-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Summary Highlight Banner if available */}
      {entry.aiSummary && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
          <p className="font-semibold text-amber-300 flex items-center space-x-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Executive Synthesis</span>
          </p>
          <p className="text-neutral-300 italic">"{entry.aiSummary}"</p>
        </div>
      )}

      {/* Conversation Thread Messages */}
      <div className="space-y-4">
        {entry.messages && entry.messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-lg ${
                msg.role === 'user'
                  ? 'border border-neutral-700 bg-neutral-800/90 text-neutral-100'
                  : 'border border-amber-500/20 bg-neutral-900/90 text-neutral-200'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/60 text-xs">
                <div className="flex items-center space-x-2">
                  {msg.role === 'user' ? (
                    <>
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="font-semibold text-neutral-300">You</span>
                    </>
                  ) : (
                    <>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                        <Sparkles className="h-3 w-3" />
                      </div>
                      <span className="font-semibold text-amber-300">Gemini Assistant</span>
                      {msg.modelUsed && (
                        <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400">
                          {msg.modelUsed}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-neutral-500">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  <button
                    onClick={() => handleCopy(msg.content, msg.id || String(index))}
                    className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                    title="Copy message"
                  >
                    {copiedId === (msg.id || String(index)) ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="prose prose-invert prose-sm max-w-none text-neutral-200 leading-relaxed font-sans">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-base font-bold text-amber-200 mt-2 mb-1" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-sm font-bold text-amber-200 mt-2 mb-1" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xs font-bold text-amber-300 mt-1.5 mb-0.5" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-1.5 text-neutral-300" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 my-1.5 text-neutral-300" {...props} />,
                    li: ({node, ...props}) => <li className="text-neutral-300" {...props} />,
                    p: ({node, ...props}) => <p className="my-1 text-neutral-200" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-amber-200" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-2 border-amber-500/40 pl-3 italic text-neutral-400 my-2" {...props} />
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Replying indicator */}
        {isReplying && (
          <div className="flex items-center space-x-3 rounded-xl border border-amber-500/20 bg-neutral-900/80 p-4">
            <div className="flex h-5 w-5 animate-spin items-center justify-center rounded-full border-2 border-amber-400 border-t-transparent" />
            <span className="text-xs text-amber-300 font-medium animate-pulse">
              Gemini is formulating a response...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up input form */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-4 z-20 rounded-2xl border border-neutral-800 bg-neutral-900/95 p-3 shadow-2xl backdrop-blur-lg"
      >
        <div className="flex items-center space-x-2">
          <input
            id="chat-followup-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isReplying}
            placeholder="Ask a follow-up question, delve deeper, or clarify a thought..."
            className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            id="chat-followup-submit"
            disabled={!inputText.trim() || isReplying}
            className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 text-xs font-bold text-neutral-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

    </div>
  );
};
