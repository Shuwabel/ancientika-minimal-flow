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

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/account", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      const payload =
        method === "email"
          ? { email: identifier.trim() }
          : { phone: identifier.trim() };

      const { error } = await supabase.auth.signInWithOtp(payload);
      if (error) throw error;
      setStep("otp");
      toast.success("Code sent! Check your " + (method === "email" ? "email" : "phone"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const payload =
        method === "email"
          ? { email: identifier.trim(), token: otpCode, type: "email" as const }
          : { phone: identifier.trim(), token: otpCode, type: "sms" as const };

      const { error } = await supabase.auth.verifyOtp(payload);
      if (error) throw error;
      toast.success("Signed in successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const payload =
        method === "email"
          ? { email: identifier.trim() }
          : { phone: identifier.trim() };
      const { error } = await supabase.auth.signInWithOtp(payload);
      if (error) throw error;
      toast.success("Code resent!");
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

  if (authLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-sm py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-light mb-2 text-center">Sign In</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {step === "form"
            ? "Sign in or create an account"
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
            <Tabs value={method} onValueChange={(v) => { setMethod(v as "email" | "phone"); setIdentifier(""); }}>
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
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full uppercase tracking-[0.1em] gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Send Code</>}
              </Button>
            </form>
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
                onClick={() => { setStep("form"); setOtpCode(""); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
