import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Profile } from "../types/user";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      else setProfile(null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      setSession(nextSession);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile((data as Profile | null) ?? { id: userId, full_name: null, phone: null, city: null, address: null, delivery_notes: null, preferred_delivery_method: "delivery", role: "user" });
  }

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: new Error("Së pari konfiguro variablat e Supabase.") };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (!isSupabaseConfigured) return { error: new Error("Së pari konfiguro variablat e Supabase.") };
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { full_name: fullName, phone } } 
    });
    
    // Update profile with phone after signup
    if (!error && data.user) {
      await supabase.from("profiles").update({ phone }).eq("id", data.user.id);
    }
    
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return <AuthContext.Provider value={{ user: session?.user ?? null, session, profile, loading, refreshProfile, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
