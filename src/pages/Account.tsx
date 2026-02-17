import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSizeStore } from "@/stores/sizeStore";
import { toast } from "sonner";

interface Profile {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  gender: string | null;
  height: number | null;
  height_unit: string | null;
  weight: number | null;
  weight_unit: string | null;
  body_shape: string | null;
  fit_preference: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { setUserProfile } = useSizeStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) setProfile(data as unknown as Profile);
      setLoading(false);
    })();
  }, [user]);

  const updateField = (field: keyof Profile, value: string | number | null) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          gender: profile.gender,
          height: profile.height,
          height_unit: profile.height_unit,
          weight: profile.weight,
          weight_unit: profile.weight_unit,
          body_shape: profile.body_shape,
          fit_preference: profile.fit_preference,
          address_line1: profile.address_line1,
          address_line2: profile.address_line2,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postal_code,
          country: profile.country,
        })
        .eq("user_id", user.id);
      if (error) throw error;

      // Sync to sizeStore for size recommender
      if (profile.gender && profile.height && profile.weight) {
        setUserProfile({
          gender: profile.gender,
          height: profile.height,
          heightUnit: (profile.height_unit as "cm" | "in") || "cm",
          weight: profile.weight,
          weightUnit: (profile.weight_unit as "kg" | "lbs") || "kg",
          bodyShape: profile.body_shape || "regular",
          fitPreference: profile.fit_preference || "regular",
        });
      }

      toast.success("Profile updated!");

      // Fire-and-forget Shopify profile sync
      supabase.functions.invoke("sync-shopify-customer", {
        body: { userId: user.id, email: profile.email, syncProfile: true },
      }).catch(() => {});
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) return null;

  const optionButton = (label: string, selected: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-sm border text-xs uppercase tracking-[0.1em] transition-colors ${
        selected ? "border-foreground bg-primary text-primary-foreground" : "border-border hover:border-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="container max-w-lg py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light">My Account</h1>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 text-xs uppercase tracking-[0.1em]">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Contact</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 block">First Name</label>
                <Input value={profile.first_name || ""} onChange={(e) => updateField("first_name", e.target.value)} placeholder="First name" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 block">Last Name</label>
                <Input value={profile.last_name || ""} onChange={(e) => updateField("last_name", e.target.value)} placeholder="Last name" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 block">Email</label>
              <Input value={profile.email || ""} disabled className="bg-muted" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 block">Phone</label>
              <Input value={profile.phone || ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="+234..." />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Address</h2>
          <div className="space-y-3">
            <Input value={profile.address_line1 || ""} onChange={(e) => updateField("address_line1", e.target.value)} placeholder="Address line 1" />
            <Input value={profile.address_line2 || ""} onChange={(e) => updateField("address_line2", e.target.value)} placeholder="Address line 2" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={profile.city || ""} onChange={(e) => updateField("city", e.target.value)} placeholder="City" />
              <Input value={profile.state || ""} onChange={(e) => updateField("state", e.target.value)} placeholder="State" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={profile.postal_code || ""} onChange={(e) => updateField("postal_code", e.target.value)} placeholder="Postal code" />
              <Input value={profile.country || ""} onChange={(e) => updateField("country", e.target.value)} placeholder="Country" />
            </div>
          </div>
        </section>

        {/* Body Measurements */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Body Measurements</h2>
          <p className="text-xs text-muted-foreground mb-4">Used for automatic size recommendations across all products.</p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Gender</label>
              <div className="flex flex-wrap gap-2">
                {["Women's", "Men's", "Unisex"].map((g) => {
                  const val = g.toLowerCase().replace("'s", "");
                  return optionButton(g, profile.gender === val, () => updateField("gender", val));
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Height</label>
                  <div className="flex gap-1">
                    {(["cm", "in"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => updateField("height_unit", u)}
                        className={`text-[10px] px-2 py-0.5 rounded-sm border ${profile.height_unit === u ? "border-foreground bg-primary text-primary-foreground" : "border-border"}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <Input type="number" value={profile.height ?? ""} onChange={(e) => updateField("height", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Weight</label>
                  <div className="flex gap-1">
                    {(["kg", "lbs"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => updateField("weight_unit", u)}
                        className={`text-[10px] px-2 py-0.5 rounded-sm border ${profile.weight_unit === u ? "border-foreground bg-primary text-primary-foreground" : "border-border"}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <Input type="number" value={profile.weight ?? ""} onChange={(e) => updateField("weight", e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Body Shape</label>
              <div className="flex flex-wrap gap-2">
                {["Slim", "Regular", "Athletic", "Relaxed"].map((s) =>
                  optionButton(s, profile.body_shape === s.toLowerCase(), () => updateField("body_shape", s.toLowerCase()))
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Fit Preference</label>
              <div className="flex flex-wrap gap-2">
                {["Tight", "Regular", "Loose"].map((f) =>
                  optionButton(f, profile.fit_preference === f.toLowerCase(), () => updateField("fit_preference", f.toLowerCase()))
                )}
              </div>
            </div>
          </div>
        </section>

        <Button onClick={handleSave} className="w-full uppercase tracking-[0.1em] gap-2" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Profile</>}
        </Button>
      </motion.div>
    </div>
  );
}
