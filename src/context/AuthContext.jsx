import { createContext, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await sendEmailVerification(cred.user);
    return cred.user;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, loginWithGoogle, logout, resendVerification, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
