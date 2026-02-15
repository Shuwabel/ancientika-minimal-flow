import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSizeStore } from "@/stores/sizeStore";
import { sizeCharts } from "@/lib/size-data";
import { supabase } from "@/integrations/supabase/client";

interface SizeRecommenderModalProps {
  category: string; // e.g. "tops"
  children: React.ReactNode;
  onRecommendation?: (size: string) => void;
}

type Step = "gender" | "measurements" | "body" | "fit" | "loading" | "result";

export default function SizeRecommenderModal({ category, children, onRecommendation }: SizeRecommenderModalProps) {
  const [open, setOpen] = useState(false);
  const { setRecommendation, setUserProfile, getRecommendation, clearRecommendation } = useSizeStore();
  const existingRec = getRecommendation(category);

  const [step, setStep] = useState<Step>(existingRec ? "result" : "gender");
  const [gender, setGender] = useState("unisex");
  const [height, setHeight] = useState(170);
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [bodyShape, setBodyShape] = useState("regular");
  const [fitPreference, setFitPreference] = useState("regular");
  const [result, setResult] = useState<{ size: string; explanation: string } | null>(
    existingRec ? { size: existingRec, explanation: "Based on your saved profile." } : null
  );
  const [error, setError] = useState("");

  const chart = sizeCharts[category];
  const categoryLabel = chart?.category || category;

  const resetQuiz = () => {
    setStep("gender");
    setResult(null);
    setError("");
    clearRecommendation(category);
  };

  const runRecommendation = async () => {
    setStep("loading");
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("size-recommender", {
        body: {
          gender,
          height,
          heightUnit,
          weight,
          weightUnit,
          bodyShape,
          fitPreference,
          category,
          sizeChart: chart,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        setStep("fit");
        return;
      }

      const rec = data as { size: string; explanation: string };
      setResult(rec);
      setRecommendation(category, rec.size);
      setUserProfile({ gender, height, heightUnit, weight, weightUnit, bodyShape, fitPreference });
      onRecommendation?.(rec.size);
      setStep("result");
    } catch (e) {
      console.error("Size recommendation error:", e);
      setError("Could not get recommendation. Please try again.");
      setStep("fit");
    }
  };

  const optionButton = (label: string, selected: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-sm border text-xs uppercase tracking-[0.1em] transition-colors ${
        selected
          ? "border-foreground bg-primary text-primary-foreground"
          : "border-border hover:border-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (v && existingRec && !result) {
        setResult({ size: existingRec, explanation: "Based on your saved profile." });
        setStep("result");
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-light tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            What's My Size?
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
            className="py-2"
          >
            {step === "gender" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">What's your preferred fit type?</p>
                <div className="flex flex-wrap gap-2">
                  {["Women's", "Men's", "Unisex"].map((g) => 
                    optionButton(g, gender === g.toLowerCase().replace("'s", ""), () => setGender(g.toLowerCase().replace("'s", "")))
                  )}
                </div>
                <Button className="w-full uppercase tracking-[0.1em] text-xs gap-1" onClick={() => setStep("measurements")}>
                  Next <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {step === "measurements" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Enter your measurements</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Height</label>
                      <div className="flex gap-1">
                        {(["cm", "in"] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => setHeightUnit(u)}
                            className={`text-[10px] px-2 py-0.5 rounded-sm border ${heightUnit === u ? "border-foreground bg-primary text-primary-foreground" : "border-border"}`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Weight</label>
                      <div className="flex gap-1">
                        {(["kg", "lbs"] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => setWeightUnit(u)}
                            className={`text-[10px] px-2 py-0.5 rounded-sm border ${weightUnit === u ? "border-foreground bg-primary text-primary-foreground" : "border-border"}`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 uppercase tracking-[0.1em] text-xs gap-1" onClick={() => setStep("gender")}>
                    <ChevronLeft className="h-3 w-3" /> Back
                  </Button>
                  <Button className="flex-1 uppercase tracking-[0.1em] text-xs gap-1" onClick={() => setStep("body")}>
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {step === "body" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">How would you describe your body shape?</p>
                <div className="flex flex-wrap gap-2">
                  {["Slim", "Regular", "Athletic", "Relaxed"].map((s) =>
                    optionButton(s, bodyShape === s.toLowerCase(), () => setBodyShape(s.toLowerCase()))
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 uppercase tracking-[0.1em] text-xs gap-1" onClick={() => setStep("measurements")}>
                    <ChevronLeft className="h-3 w-3" /> Back
                  </Button>
                  <Button className="flex-1 uppercase tracking-[0.1em] text-xs gap-1" onClick={() => setStep("fit")}>
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {step === "fit" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">How do you prefer your {categoryLabel.toLowerCase()} to fit?</p>
                <div className="flex flex-wrap gap-2">
                  {["Tight", "Regular", "Loose"].map((f) =>
                    optionButton(f, fitPreference === f.toLowerCase(), () => setFitPreference(f.toLowerCase()))
                  )}
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 uppercase tracking-[0.1em] text-xs gap-1" onClick={() => setStep("body")}>
                    <ChevronLeft className="h-3 w-3" /> Back
                  </Button>
                  <Button className="flex-1 uppercase tracking-[0.1em] text-xs gap-1" onClick={runRecommendation}>
                    <Sparkles className="h-3 w-3" /> Find My Size
                  </Button>
                </div>
              </div>
            )}

            {step === "loading" && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <p className="text-xs text-muted-foreground">Analyzing your measurements...</p>
              </div>
            )}

            {step === "result" && result && (
              <div className="space-y-4 text-center">
                <div className="bg-muted rounded-sm p-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Your recommended size for {categoryLabel}
                  </p>
                  <p className="text-4xl font-light">{result.size}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.explanation}</p>
                <p className="text-[10px] text-muted-foreground">
                  This size will be auto-selected for all {categoryLabel.toLowerCase()} products.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 uppercase tracking-[0.1em] text-xs gap-1" onClick={resetQuiz}>
                    <RotateCcw className="h-3 w-3" /> Retake Quiz
                  </Button>
                  <Button className="flex-1 uppercase tracking-[0.1em] text-xs" onClick={() => setOpen(false)}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
