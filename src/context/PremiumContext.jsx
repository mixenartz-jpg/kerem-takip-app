import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    ai_merkezi: false,
    ileri_istatistikler: false,
    hata_defteri: false,
  });

  // Listen to user's isPremium field in Firestore
  useEffect(() => {
    if (!user) { setIsPremium(false); return; }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setIsPremium(!!snap.data().isPremium);
      }
    });
    return unsub;
  }, [user]);

  // Listen to global feature flags (admin can override per-feature)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'admin', 'feature_flags'), (snap) => {
      if (snap.exists()) {
        setFeatureFlags(prev => ({ ...prev, ...snap.data() }));
      }
    }, () => { /* Firestore doc may not exist yet — use defaults */ });
    return unsub;
  }, []);

  // A feature is accessible if user is premium OR admin has globally unlocked the flag
  const canAccess = (feature) => isPremium || !!featureFlags[feature];

  return (
    <PremiumContext.Provider value={{ isPremium, featureFlags, canAccess }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
