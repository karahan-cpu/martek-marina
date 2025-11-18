import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('🔐 Signup attempt:', { email, supabaseUrl: import.meta.env.VITE_SUPABASE_URL });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    
    console.log('📧 Signup response:', { 
      user: data?.user?.id, 
      email: data?.user?.email,
      emailConfirmed: data?.user?.email_confirmed_at,
      hasSession: !!data?.session,
      error: error?.message 
    });
    
    if (error) {
      console.error('❌ Signup error:', error);
      return { error };
    }
    
    // Check if user was created but needs email confirmation
    if (data?.user) {
      console.log('✅ User created:', data.user.id);
      
      // If no session, email confirmation is required
      if (!data.session) {
        console.log('📬 Email confirmation required - no session returned');
        return { error: null };
      }
      
      // If session exists, user is automatically confirmed
      console.log('🎉 User auto-confirmed - session exists');
      return { error: null };
    }
    
    // No user created - this shouldn't happen if no error
    console.warn('⚠️ No user created and no error returned');
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
