import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, loading, error] = useAuthState(auth);
  const [verifiedOverride, setVerifiedOverride] = useState(false);

  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
  }, []);

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await sendEmailVerification(cred.user);
    return cred.user;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () =>
    signInWithRedirect(auth, googleProvider);

  const logout = () => signOut(auth);

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        setVerifiedOverride(true);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, verifiedOverride, register, login, loginWithGoogle, logout, resendVerification, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
