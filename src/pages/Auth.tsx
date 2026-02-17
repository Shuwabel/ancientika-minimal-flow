import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import CountryCodeSelect from "@/components/CountryCodeSelect";
import ProfileSetupForm from "@/components/ProfileSetupForm";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SYNC_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/sync-shopify-customer`;

type AuthMode = "signin" | "signup";
type Step = "form" | "otp" | "profile";

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<Step>("form");
  const [identifier, setIdentifier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryDial, setCountryDial] = useState("+1");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");

  useEffect(() => {
    if (!authLoading && user && step !== "profile") navigate("/account", { replace: true });
  }, [user, authLoading, navigate, step]);

  // --- Email OTP via custom Resend edge function ---
  const handleEmailOtpRequest = async (emailAddr: string) => {
    const res = await fetch(
      `https://${PROJECT_ID}.supabase.co/functions/v1/request-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddr }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send code");
    return data;
  };

  const handleEmailOtpVerify = async (emailAddr: string, code: string) => {
    const res = await fetch(
      `https://${PROJECT_ID}.supabase.co/functions/v1/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddr, otp: code }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verification failed");
    return data;
  };

  // --- Send code handler ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (method === "email") {
        const email = identifier.trim();
        if (!email) return;
        await handleEmailOtpRequest(email);
        setStep("otp");
        toast.success("Code sent! Check your email.");
      } else {
        const fullPhone = `${countryDial}${phoneNumber.trim()}`;
        if (!phoneNumber.trim()) return;
        const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
        if (error) throw error;
        setIdentifier(fullPhone);
        setStep("otp");
        toast.success("Code sent! Check your phone.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // --- Shopify customer sync (fire-and-forget) ---
  const syncShopifyCustomer = async (userId: string, email: string) => {
    try {
      await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
    } catch {
      // Never block auth flow
    }
  };

  // --- Verify OTP handler ---
  const handleVerify = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      let sessionUserId = "";
      let sessionEmail = "";

      if (method === "email") {
        const data = await handleEmailOtpVerify(identifier.trim(), otpCode);
        const { error, data: sessionData } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: data.type || "magiclink",
        });
        if (error) throw error;
        sessionUserId = sessionData?.user?.id || "";
        sessionEmail = identifier.trim();
      } else {
        const { error, data: sessionData } = await supabase.auth.verifyOtp({
          phone: identifier.trim(),
          token: otpCode,
          type: "sms" as const,
        });
        if (error) throw error;
        sessionUserId = sessionData?.user?.id || "";
        sessionEmail = sessionData?.user?.email || identifier.trim();
      }

      toast.success("Verified!");

      if (authMode === "signup") {
        // Show profile completion form
        setVerifiedUserId(sessionUserId);
        setVerifiedEmail(sessionEmail);
        setStep("profile");
      } else {
        // Sign in: fire-and-forget sync and navigate
        syncShopifyCustomer(sessionUserId, sessionEmail);
        navigate("/account", { replace: true });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // --- Resend handler ---
  const handleResend = async () => {
    setLoading(true);
    try {
      if (method === "email") {
        await handleEmailOtpRequest(identifier.trim());
        toast.success("Code resent!");
      } else {
        const { error } = await supabase.auth.signInWithOtp({ phone: identifier.trim() });
        if (error) throw error;
        toast.success("Code resent!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const handleProfileComplete = () => {
    navigate("/account", { replace: true });
  };

  const resetToForm = () => {
    setStep("form");
    setOtpCode("");
    setVerifiedUserId(null);
    setVerifiedEmail("");
  };

  if (authLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-sm py-20">
      {step === "profile" && verifiedUserId ? (
        <ProfileSetupForm
          userId={verifiedUserId}
          email={verifiedEmail}
          onComplete={handleProfileComplete}
        />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Sign In / Sign Up top-level tabs */}
          {step === "form" && (
            <div className="mb-6">
              <Tabs value={authMode} onValueChange={(v) => { setAuthMode(v as AuthMode); setIdentifier(""); setPhoneNumber(""); }}>
                <TabsList className="w-full">
                  <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <h1 className="text-2xl font-light mb-2 text-center">
            {step === "otp" ? "Verify Code" : authMode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {step === "form"
              ? authMode === "signin"
                ? "Sign in to your account"
                : "Create a new account"
              : `Enter the 6-digit code sent to ${identifier}`}
          </p>

          {step === "form" ? (
            <div className="space-y-6">
              {/* Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-3 h-11"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                <Separator className="flex-1" />
              </div>

              {/* Email / Phone tabs */}
              <Tabs value={method} onValueChange={(v) => { setMethod(v as "email" | "phone"); setIdentifier(""); setPhoneNumber(""); }}>
                <TabsList className="w-full">
                  <TabsTrigger value="email" className="flex-1 gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex-1 gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleSendCode} className="space-y-4">
                {method === "email" ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                ) : (
                  <div className="flex">
                    <CountryCodeSelect value={countryDial} onChange={setCountryDial} />
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                )}
                <Button type="submit" className="w-full uppercase tracking-[0.1em] gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><ArrowRight className="h-4 w-4" /> Send Code</>
                  )}
                </Button>
              </form>

              {/* Toggle hint */}
              <p className="text-xs text-center text-muted-foreground">
                {authMode === "signin" ? (
                  <>Don't have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("signup")} className="text-foreground hover:underline">Sign up</button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("signin")} className="text-foreground hover:underline">Sign in</button>
                  </>
                )}
              </p>
            </div>
          ) : (
            /* OTP verification step */
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full uppercase tracking-[0.1em]"
                onClick={handleVerify}
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resend code
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  type="button"
                  onClick={resetToForm}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Go back
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
