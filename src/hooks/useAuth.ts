import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SYNC_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/sync-shopify-customer`;

async function ensureShopifySync(user: User) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("shopify_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.shopify_customer_id?.startsWith("gid://")) return; // Already synced with real GID

    await fetch(SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, email: user.email }),
    });
  } catch {
    // Never block auth flow
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Login sync safety check (fire-and-forget, once per user)
        if (session?.user && syncedRef.current !== session.user.id) {
          syncedRef.current = session.user.id;
          ensureShopifySync(session.user);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    syncedRef.current = null;
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
}
