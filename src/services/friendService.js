import {
  doc, setDoc, deleteDoc, collection,
  getDocs, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : '';

export function generateInviteLink(uid) {
  return `${APP_URL}/invite?uid=${uid}`;
}

/* ── Email ile kullanıcı ara ── */
export async function searchUserByEmail(email) {
  const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, displayName: d.data().displayName || 'Kullanıcı', email: d.data().email };
}

/* ── Arkadaşlık isteği gönder ── */
export async function sendFriendRequest(myUid, myDisplayName, targetUid, targetDisplayName) {
  const id = [myUid, targetUid].sort().join('_');
  await setDoc(doc(db, 'friendships', id), {
    uids: [myUid, targetUid],
    displayNames: {
      [myUid]: myDisplayName || 'Kullanıcı',
      [targetUid]: targetDisplayName || 'Kullanıcı',
    },
    status: 'pending',
    requestedBy: myUid,
    createdAt: serverTimestamp(),
  });
  return id;
}

/* ── Arkadaşlık isteğini kabul et ── */
export async function acceptInvite(myUid, myDisplayName, inviterUid, inviterDisplayName) {
  const id = [myUid, inviterUid].sort().join('_');
  await setDoc(doc(db, 'friendships', id), {
    uids: [myUid, inviterUid],
    displayNames: { [myUid]: myDisplayName, [inviterUid]: inviterDisplayName || 'Kullanıcı' },
    status: 'accepted',
    createdAt: serverTimestamp(),
  });
  return id;
}

/* ── Arkadaşlığı kaldır ── */
export async function removeFriendship(myUid, friendUid) {
  const id = [myUid, friendUid].sort().join('_');
  await deleteDoc(doc(db, 'friendships', id));
}

/* ── Kullanıcının arkadaşlarını getir (Firestore'dan) ── */
export async function fetchFriendships(uid) {
  const q = query(
    collection(db, 'friendships'),
    where('uids', 'array-contains', uid),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    const friendUid = data.uids.find(u => u !== uid);
    return {
      id: d.id,
      uid: friendUid,
      displayName: data.displayNames?.[friendUid] || 'Kullanıcı',
      status: data.status || 'accepted',
      requestedBy: data.requestedBy,
    };
  });
}
