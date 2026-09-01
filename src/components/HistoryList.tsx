import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  Tag, 
  ArrowRight,
  Filter,
  Compass,
  FileText,
  Lightbulb,
  HelpCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { JournalEntry, ReflectionMode } from '../types';

interface HistoryListProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onNewEntryClick: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  entries,
  onSelectEntry,
  onDeleteEntry,
  onNewEntryClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.content && entry.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.aiSummary && entry.aiSummary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesMode = selectedMode === 'all' || entry.mode === selectedMode;

    return matchesSearch && matchesMode;
  });

  const handleDelete = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await onDeleteEntry(entryId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getModeBadge = (mode: ReflectionMode) => {
    switch (mode) {
      case 'summarize':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <FileText className="h-3 w-3" />
            <span>Summary</span>
          </span>
        );
      case 'brainstorm':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400 border border-yellow-500/20">
            <Lightbulb className="h-3 w-3" />
            <span>Brainstorm</span>
          </span>
        );
      case 'socratic':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
            <HelpCircle className="h-3 w-3" />
            <span>Socratic</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
            <Compass className="h-3 w-3" />
            <span>Reflect</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur-md">
        
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            id="history-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past reflections, topics, or insights..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/70 py-2 pl-9 pr-4 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500/70 focus:outline-none"
          />
        </div>

        {/* Mode filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-neutral-500 mr-1" />
          {['all', 'reflect', 'summarize', 'brainstorm', 'socratic'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                selectedMode === mode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

      </div>

      {/* Entry Cards List */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
          <h3 className="text-sm font-semibold text-neutral-300">
            {entries.length === 0 ? 'No journal entries yet' : 'No reflections match your search'}
          </h3>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            {entries.length === 0 
              ? 'Start your first mindful reflection with Gemini to explore insights and track your thoughts over time.'
              : 'Try clearing your search query or switching your reflection mode filter.'}
          </p>
          {entries.length === 0 && (
            <button
              onClick={onNewEntryClick}
              className="mt-4 inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Write First Reflection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="group relative flex flex-col justify-between rounded-2xl border border-neutral-800/90 bg-neutral-900/70 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-neutral-900/95 hover:shadow-lg cursor-pointer"
            >
              <div>
                {/* Header tags & delete */}
                <div className="flex items-center justify-between gap-2 pb-3">
                  <div className="flex items-center space-x-1.5">
                    {getModeBadge(entry.mode)}
                    {entry.mood && (
                      <span className="rounded bg-neutral-800/60 px-1.5 py-0.5 text-[10px] text-neutral-400 capitalize">
                        {entry.mood}
                      </span>
                    )}
                  </div>

                  {/* Delete button */}
                  {deleteConfirmId === entry.id ? (
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(e, entry.id)}
                        disabled={isDeleting}
                        className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-500"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400 hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(entry.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-opacity"
                      title="Delete reflection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-serif text-sm font-bold text-neutral-100 line-clamp-1 group-hover:text-amber-200 transition-colors">
                  {entry.title || 'Untitled Reflection'}
                </h4>

                {/* AI Summary or snippet */}
                {entry.aiSummary ? (
                  <p className="mt-2 text-xs italic text-amber-300/80 line-clamp-2 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                    "{entry.aiSummary}"
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-neutral-400 line-clamp-2">
                    {entry.content}
                  </p>
                )}
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-neutral-400">
                    <MessageSquare className="h-3 w-3 text-neutral-500" />
                    <span>{entry.messages ? entry.messages.length : 0} turns</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
