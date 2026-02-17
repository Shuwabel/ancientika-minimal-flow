import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import CountryCodeSelect from "@/components/CountryCodeSelect";
import { countryCodes } from "@/lib/country-codes";
import { supabase } from "@/integrations/supabase/client";
import { useSizeStore } from "@/stores/sizeStore";
import { toast } from "sonner";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SYNC_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/sync-shopify-customer`;

interface ProfileSetupFormProps {
  userId: string;
  email: string;
  onComplete: () => void;
}

export default function ProfileSetupForm({ userId, email, onComplete }: ProfileSetupFormProps) {
  const { setUserProfile } = useSizeStore();
  const [saving, setSaving] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneDial, setPhoneDial] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");

  // Size guide fields
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState<number | null>(null);
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weight, setWeight] = useState<number | null>(null);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [bodyShape, setBodyShape] = useState("");
  const [fitPreference, setFitPreference] = useState("");

  const filteredCountries = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountry = countryCodes.find((c) => c.name === country);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    setSaving(true);
    try {
      const fullPhone = phoneNumber.trim() ? `${phoneDial}${phoneNumber.trim()}` : null;

      const profileData: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: fullPhone,
        address_line1: addressLine1.trim() || null,
        address_line2: addressLine2.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        postal_code: postalCode.trim() || null,
        country: country || null,
      };

      if (showSizeGuide) {
        profileData.gender = gender || null;
        profileData.height = height;
        profileData.height_unit = heightUnit;
        profileData.weight = weight;
        profileData.weight_unit = weightUnit;
        profileData.body_shape = bodyShape || null;
        profileData.fit_preference = fitPreference || null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("user_id", userId);

      if (error) throw error;

      // Sync size store
      if (showSizeGuide && gender && height && weight) {
        setUserProfile({
          gender,
          height,
          heightUnit,
          weight,
          weightUnit,
          bodyShape: bodyShape || "regular",
          fitPreference: fitPreference || "slim_fit",
        });
      }

      // Fire-and-forget Shopify sync
      fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, syncProfile: true }),
      }).catch(() => {});

      toast.success("Profile created!");
      onComplete();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const optionBtn = (label: string, selected: boolean, onClick: () => void) => (
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-light">Complete Your Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Tell us about yourself so we can serve you better.</p>
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 block">First Name *</label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 block">Last Name *</label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" required />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 block">Phone</label>
        <div className="flex">
          <CountryCodeSelect value={phoneDial} onChange={setPhoneDial} />
          <Input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="rounded-l-none"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Address</label>
        <div className="space-y-3">
          <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address line 1" />
          <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address line 2" />
          <div className="grid grid-cols-2 gap-3">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State / Province" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" />
            {/* Country dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setCountryDropdownOpen(!countryDropdownOpen); setCountrySearch(""); }}
                className="flex items-center justify-between w-full h-10 px-3 border rounded-md bg-background text-sm"
              >
                <span className={country ? "text-foreground" : "text-muted-foreground"}>
                  {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : "Country"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {countryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-lg z-50">
                  <div className="sticky top-0 bg-popover p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                  </div>
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCountry(c.name); setCountryDropdownOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors ${
                        c.name === country ? "bg-accent" : ""
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="flex-1 text-left">{c.name}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="text-sm text-muted-foreground p-3 text-center">No results</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Checkbox */}
      <div className="flex items-center gap-3 pt-2">
        <Checkbox
          id="size-guide"
          checked={showSizeGuide}
          onCheckedChange={(checked) => setShowSizeGuide(!!checked)}
        />
        <label htmlFor="size-guide" className="text-sm cursor-pointer">
          Help me find my perfect size
        </label>
      </div>

      {/* Size Guide Fields */}
      {showSizeGuide && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 border-t pt-4"
        >
          <p className="text-xs text-muted-foreground">
            We'll use this to recommend your ideal size on every product.
          </p>

          {/* Gender */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Gender</label>
            <div className="flex flex-wrap gap-2">
              {["Women's", "Men's", "Unisex"].map((g) => {
                const val = g.toLowerCase().replace("'s", "");
                return optionBtn(g, gender === val, () => setGender(val));
              })}
            </div>
          </div>

          {/* Height / Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Height</label>
                <div className="flex gap-1">
                  {(["cm", "in"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setHeightUnit(u)}
                      className={`text-[10px] px-2 py-0.5 rounded-sm border ${heightUnit === u ? "border-foreground bg-primary text-primary-foreground" : "border-border"}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <Input type="number" value={height ?? ""} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Weight</label>
                <div className="flex gap-1">
                  {(["kg", "lbs"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setWeightUnit(u)}
                      className={`text-[10px] px-2 py-0.5 rounded-sm border ${weightUnit === u ? "border-foreground bg-primary text-primary-foreground" : "border-border"}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <Input type="number" value={weight ?? ""} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          {/* Body Shape */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Body Shape</label>
            <div className="flex flex-wrap gap-2">
              {["Slim", "Regular", "Athletic", "Relaxed"].map((s) =>
                optionBtn(s, bodyShape === s.toLowerCase(), () => setBodyShape(s.toLowerCase()))
              )}
            </div>
          </div>

          {/* Fit Preference */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Fit Preference</label>
            <div className="flex flex-wrap gap-2">
              {["Slim Fit", "Baggy"].map((f) => {
                const val = f.toLowerCase().replace(" ", "_");
                return optionBtn(f, fitPreference === val, () => setFitPreference(val));
              })}
            </div>
          </div>
        </motion.div>
      )}

      <Button onClick={handleSubmit} className="w-full uppercase tracking-[0.1em] gap-2" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Complete Setup</>}
      </Button>
    </motion.div>
  );
}
