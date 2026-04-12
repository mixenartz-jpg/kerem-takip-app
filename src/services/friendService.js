import { doc, setDoc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const APP_URL = window.location.origin;

export function generateInviteLink(uid) {
  return `${APP_URL}/invite?uid=${uid}`;
}

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

export async function removeFriendship(myUid, friendUid) {
  const id = [myUid, friendUid].sort().join('_');
  await deleteDoc(doc(db, 'friendships', id));
}
