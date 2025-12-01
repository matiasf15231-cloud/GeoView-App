import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { showLoading, dismissToast, showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, metadata: { firstName: string, lastName: string }) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const toastId = showLoading('Redirigiendo a Google...');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.error_description || error.message);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const toastId = showLoading('Iniciando sesión...');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess('¡Bienvenido de nuevo!');
    } catch (error: any) {
      showError(error.error_description || error.message);
    } finally {
      dismissToast(toastId);
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata: { firstName: string, lastName: string }) => {
    const toastId = showLoading('Creando tu cuenta...');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: metadata.firstName,
            last_name: metadata.lastName,
          }
        }
      });
      if (error) throw error;
      showSuccess('¡Cuenta creada! Revisa tu correo para verificar tu cuenta.');
    } catch (error: any) {
      showError(error.error_description || error.message);
    } finally {
      dismissToast(toastId);
    }
  };

  const signOut = async () => {
    const toastId = showLoading('Cerrando sesión...');
    try {
      await supabase.auth.signOut();
      showSuccess('Has cerrado sesión correctamente.');
    } catch (error: any) {
      showError(error.error_description || error.message);
    } finally {
        dismissToast(toastId);
    }
  };

  const deleteAccount = async () => {
    const toastId = showLoading('Eliminando tu cuenta...');
    try {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
      await signOut();
      showSuccess('Tu cuenta ha sido eliminada permanentemente.');
    } catch (error: any) {
      showError(error.message || 'No se pudo eliminar la cuenta.');
    } finally {
      dismissToast(toastId);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};