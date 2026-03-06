import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      toast.error("One or more fields exceed the maximum length.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        toast.error("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    toast.success("Message sent! We'll get back to you shortly.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container py-20 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-light text-center mb-4">Contact</h1>
        <p className="text-sm text-muted-foreground text-center mb-10">
          Questions, orders, or just to say hello — we'd love to hear from you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1 block">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-card border border-border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1 block">
              Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-card border border-border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1 block">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-card border border-border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <Button type="submit" className="w-full uppercase tracking-[0.1em]" size="lg" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
