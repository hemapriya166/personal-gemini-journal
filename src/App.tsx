import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Sparkles, 
  BookOpen, 
  PlusCircle, 
  History, 
  Layers, 
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { auth, signInWithGoogle, logoutUser } from './lib/firebase';
import { 
  saveJournalEntry, 
  subscribeToUserJournalEntries, 
  deleteJournalEntry, 
  appendMessageToEntry,
  syncUserProfile 
} from './services/firestoreService';
import { requestReflection, requestChatReply } from './services/geminiService';
import { JournalEntry, ChatMessage, UserProfile, ReflectionMode } from './types';
import { Header } from './components/Header';
import { AuthLanding } from './components/AuthLanding';
import { JournalEditor } from './components/JournalEditor';
import { ChatThread } from './components/ChatThread';
import { HistoryList } from './components/HistoryList';
import { ThreatModelModal } from './components/ThreatModelModal';
import { ErrorBanner } from './components/ErrorBanner';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | undefined>(undefined);
  const [isThreatModalOpen, setIsThreatModalOpen] = useState<boolean>(false);

  // 1. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        setCurrentUser(profile);
        try {
          await syncUserProfile(profile);
        } catch (e) {
          console.warn('Profile sync warning:', e);
        }
      } else {
        setCurrentUser(null);
        setEntries([]);
        setSelectedEntry(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time subscription to user-isolated Firestore entries
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserJournalEntries(
      currentUser.uid,
      (updatedEntries) => {
        setEntries(updatedEntries);
        // Keep selected entry updated if viewing thread
        if (selectedEntry) {
          const fresh = updatedEntries.find(e => e.id === selectedEntry.id);
          if (fresh) setSelectedEntry(fresh);
        }
      },
      (error) => {
        console.error('Firestore sync error:', error);
        setErrorMessage('Failed to synchronize with Cloud Firestore: ' + error.message);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, selectedEntry?.id]);

  // Auth Handlers
  const handleSignIn = async () => {
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Google Sign-In failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setSelectedEntry(null);
      setActiveTab('editor');
    } catch (error: any) {
      setErrorMessage('Failed to sign out: ' + error?.message);
    }
  };

  // Submit new journal reflection
  const handleCreateReflection = async (data: {
    title: string;
    content: string;
    mode: ReflectionMode;
    mood?: JournalEntry['mood'];
    tags: string[];
  }) => {
    if (!currentUser) return;
    setIsReflecting(true);
    setErrorMessage(null);

    const entryId = 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const nowIso = new Date().toISOString();

    const executeReflection = async () => {
      try {
        // 1. Request Gemini API Reflection with backend fallback ladder
        const geminiRes = await requestReflection({
          prompt: data.content,
          title: data.title,
          mode: data.mode
        });

        // 2. Formulate initial conversation messages
        const initialMessages: ChatMessage[] = [
          {
            id: 'msg_user_' + Date.now(),
            role: 'user',
            content: data.content,
            timestamp: nowIso
          },
          {
            id: 'msg_model_' + Date.now(),
            role: 'model',
            content: geminiRes.reply,
            timestamp: new Date().toISOString(),
            modelUsed: geminiRes.modelUsed
          }
        ];

        // 3. Construct JournalEntry object
        const newEntry: JournalEntry = {
          id: entryId,
          userId: currentUser.uid,
          title: data.title,
          content: data.content,
          mode: data.mode,
          messages: initialMessages,
          aiSummary: geminiRes.summary,
          insights: geminiRes.insights,
          tags: data.tags,
          mood: data.mood,
          createdAt: nowIso,
          updatedAt: new Date().toISOString()
        };

        // 4. Guaranteed Transaction Verification: Save to user-isolated Firestore
        await saveJournalEntry(currentUser.uid, newEntry);

        // 5. Open newly created conversation thread immediately
        setSelectedEntry(newEntry);
      } catch (error: any) {
        console.error('Reflection submission failed:', error);
        setErrorMessage(error?.message || 'Failed to process and save reflection.');
        setRetryAction(() => () => handleCreateReflection(data));
      } finally {
        setIsReflecting(false);
      }
    };

    await executeReflection();
  };

  // Send follow-up multi-turn message in an open thread
  const handleSendFollowUp = async (text: string) => {
    if (!currentUser || !selectedEntry) return;
    setIsReplying(true);
    setErrorMessage(null);

    const userMsgId = 'msg_user_' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    try {
      // Optimistically append user message to local state
      const updatedMessages = [...(selectedEntry.messages || []), userMsg];
      setSelectedEntry({ ...selectedEntry, messages: updatedMessages });
      await appendMessageToEntry(currentUser.uid, selectedEntry.id, userMsg);

      // Call Gemini API chat endpoint with history
      const response = await requestChatReply({
        prompt: text,
        history: updatedMessages,
        mode: selectedEntry.mode
      });

      const modelMsg: ChatMessage = {
        id: 'msg_model_' + Date.now(),
        role: 'model',
        content: response.reply,
        timestamp: new Date().toISOString(),
        modelUsed: response.modelUsed
      };

      // Append model response to Firestore
      await appendMessageToEntry(currentUser.uid, selectedEntry.id, modelMsg);
    } catch (error: any) {
      console.error('Chat reply failed:', error);
      setErrorMessage('Failed to send reply to Gemini: ' + error?.message);
    } finally {
      setIsReplying(false);
    }
  };

  // Delete reflection entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    try {
      await deleteJournalEntry(currentUser.uid, entryId);
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
        setActiveTab('history');
      }
    } catch (error: any) {
      setErrorMessage('Failed to delete entry: ' + error?.message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-neutral-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent shadow-lg shadow-amber-500/20" />
          <p className="text-sm font-medium text-neutral-400 animate-pulse">
            Initializing secure Firebase authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Navigation Header */}
      <Header
        user={currentUser}
        onSignOut={handleSignOut}
        onOpenThreatModel={() => setIsThreatModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6">
            <ErrorBanner
              message={errorMessage}
              onRetry={retryAction}
              onDismiss={() => {
                setErrorMessage(null);
                setRetryAction(undefined);
              }}
            />
          </div>
        )}

        {/* If user is not authenticated: Show Landing */}
        {!currentUser ? (
          <AuthLanding
            onSignIn={handleSignIn}
            loading={authLoading}
            error={errorMessage}
          />
        ) : (
          <div className="space-y-6">
            
            {/* If an individual conversation thread is selected: Show ChatThread */}
            {selectedEntry ? (
              <ChatThread
                entry={selectedEntry}
                onBack={() => setSelectedEntry(null)}
                onSendMessage={handleSendFollowUp}
                isReplying={isReplying}
              />
            ) : (
              <>
                {/* Navigation View Switcher (New Entry vs History) */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <button
                      id="tab-new-reflection-btn"
                      onClick={() => setActiveTab('editor')}
                      className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                        activeTab === 'editor'
                          ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>New Reflection</span>
                    </button>

                    <button
                      id="tab-history-btn"
                      onClick={() => setActiveTab('history')}
                      className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                        activeTab === 'history'
                          ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      <History className="h-4 w-4" />
                      <span>History & Reflections</span>
                      <span className="ml-1 rounded-full bg-neutral-800/80 px-1.5 py-0.2 text-[10px] text-neutral-300">
                        {entries.length}
                      </span>
                    </button>
                  </div>

                  <div className="text-xs text-neutral-500 flex items-center space-x-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Database ID: <span className="font-mono text-neutral-400">ai-studio-87b3714d...</span></span>
                  </div>
                </div>

                {/* Tab Views */}
                {activeTab === 'editor' ? (
                  <div className="space-y-8">
                    <JournalEditor
                      onSubmit={handleCreateReflection}
                      isLoading={isReflecting}
                    />

                    {/* Quick Recents Section below editor */}
                    {entries.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-neutral-900">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif text-sm font-bold text-neutral-300">
                            Recent Reflections
                          </h3>
                          <button
                            onClick={() => setActiveTab('history')}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-medium"
                          >
                            <span>View all ({entries.length})</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {entries.slice(0, 3).map((entry) => (
                            <div
                              key={entry.id}
                              onClick={() => setSelectedEntry(entry)}
                              className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all hover:border-amber-500/40 hover:bg-neutral-900 cursor-pointer"
                            >
                              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5">
                                <span className="capitalize font-semibold text-amber-300">{entry.mode}</span>
                                <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-serif text-xs font-bold text-neutral-100 line-clamp-1">
                                {entry.title}
                              </h4>
                              <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2">
                                {entry.aiSummary || entry.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <HistoryList
                    entries={entries}
                    onSelectEntry={(entry) => setSelectedEntry(entry)}
                    onDeleteEntry={handleDeleteEntry}
                    onNewEntryClick={() => setActiveTab('editor')}
                  />
                )}
              </>
            )}

          </div>
        )}

      </main>

      {/* Threat Model Modal */}
      <ThreatModelModal
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
      />

    </div>
  );
}
