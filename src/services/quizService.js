import {
  collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const MAX_HASHES = 200;
const PRUNE_TO = 150;

export async function hashQuestion(subject, topic, questionText) {
  const raw = `${subject}|${topic}|${questionText.slice(0, 60)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchPreviousHashes(uid) {
  const col = collection(db, 'users', uid, 'quizHistory');
  const q = query(col, orderBy('createdAt', 'desc'), limit(MAX_HASHES));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, hash: d.data().questionHash }));
}

export async function saveQuestionHashes(uid, questions, subject, topic) {
  const col = collection(db, 'users', uid, 'quizHistory');

  const existing = await fetchPreviousHashes(uid);
  if (existing.length >= MAX_HASHES) {
    const toDelete = existing.slice(PRUNE_TO);
    await Promise.all(toDelete.map(d => deleteDoc(doc(db, 'users', uid, 'quizHistory', d.id))));
  }

  await Promise.all(
    questions.map(async (q) => {
      const questionHash = await hashQuestion(subject, topic, q.question);
      return addDoc(col, { subject, topic, questionHash, createdAt: serverTimestamp() });
    })
  );
}
