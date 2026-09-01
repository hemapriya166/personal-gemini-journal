import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeFirestoreData } from '../lib/firebase';
import { JournalEntry, ChatMessage, UserProfile } from '../types';

/**
 * Saves or updates a journal interaction document in the user-isolated subcollection:
 * Path: /users/{userId}/interactions/{entryId}
 */
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) throw new Error('User ID is required for data isolation.');
  if (!entry.id) throw new Error('Entry ID is required.');

  const docRef = doc(db, 'users', userId, 'interactions', entry.id);
  const payload = sanitizeFirestoreData({
    ...entry,
    userId,
    updatedAt: new Date().toISOString()
  });

  await setDoc(docRef, payload, { merge: true });
}

/**
 * Fetch all journal interactions for a user, sorted by most recent
 */
export async function getUserJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) throw new Error('User ID is required.');

  const collectionRef = collection(db, 'users', userId, 'interactions');
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data() as JournalEntry);
}

/**
 * Real-time listener for user entries
 */
export function subscribeToUserJournalEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId) return () => {};

  const collectionRef = collection(db, 'users', userId, 'interactions');
  const q = query(collectionRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data() as JournalEntry);
      onUpdate(entries);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Deletes a single journal entry from the user's isolated store
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) throw new Error('User ID and Entry ID required.');
  const docRef = doc(db, 'users', userId, 'interactions', entryId);
  await deleteDoc(docRef);
}

/**
 * Updates messages thread for an existing entry
 */
export async function appendMessageToEntry(
  userId: string, 
  entryId: string, 
  newMessage: ChatMessage
): Promise<void> {
  if (!userId || !entryId) throw new Error('Missing IDs.');
  const docRef = doc(db, 'users', userId, 'interactions', entryId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Journal entry not found.');

  const existingData = snap.data() as JournalEntry;
  const updatedMessages = [...(existingData.messages || []), newMessage];

  await setDoc(docRef, sanitizeFirestoreData({
    ...existingData,
    messages: updatedMessages,
    updatedAt: new Date().toISOString()
  }), { merge: true });
}

/**
 * Upsert user profile record
 */
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  if (!profile.uid) return;
  const userRef = doc(db, 'users', profile.uid);
  await setDoc(userRef, sanitizeFirestoreData({
    ...profile,
    lastLoginAt: new Date().toISOString()
  }), { merge: true });
}
