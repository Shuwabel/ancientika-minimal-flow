import { Ruler, Sparkles } from "lucide-react";
import { sizeCharts } from "@/lib/size-data";
import SizeGuideModal from "@/components/SizeGuideModal";
import SizeRecommenderModal from "@/components/SizeRecommenderModal";
import { useSizeStore } from "@/stores/sizeStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function SizeGuide() {
  const { recommendations } = useSizeStore();

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-light text-center mb-3">Size Guide</h1>
      <p className="text-sm text-muted-foreground text-center mb-10 max-w-md mx-auto">
        Find your perfect fit using our measurement charts or let our AI recommend your size.
      </p>

      <Tabs defaultValue="tops">
        <TabsList className="w-full justify-start gap-1 bg-transparent p-0 mb-6">
          {Object.keys(sizeCharts).map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="text-xs uppercase tracking-[0.15em] rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
            >
              {sizeCharts[key].category}
              {recommendations[key] && (
                <Badge variant="secondary" className="ml-2 text-[9px] px-1.5 py-0">{recommendations[key]}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(sizeCharts).map(([key, chart]) => (
          <TabsContent key={key} value={key} className="space-y-8 mt-0">
            {/* Recommended Size Banner */}
            {recommendations[key] && (
              <div className="bg-muted rounded-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Your recommended size</p>
                  <p className="text-lg font-light">{recommendations[key]}</p>
                </div>
                <SizeRecommenderModal category={key}>
                  <button className="text-xs text-accent underline underline-offset-2">Retake Quiz</button>
                </SizeRecommenderModal>
              </div>
            )}

            {/* Measurement Table */}
            <div className="border border-border rounded-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="text-[10px] uppercase tracking-[0.1em] font-medium">Measurement</TableHead>
                    {chart.sizes.map((s) => (
                      <TableHead key={s} className={`text-[10px] uppercase tracking-[0.1em] font-medium text-center ${recommendations[key] === s ? "bg-accent/10" : ""}`}>
                        {s}
                        {recommendations[key] === s && <span className="block text-[8px] text-accent">★</span>}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chart.measurements.map((m) => (
                    <TableRow key={m.label}>
                      <TableCell className="text-xs font-medium">{m.label}</TableCell>
                      {chart.sizes.map((s) => (
                        <TableCell key={s} className={`text-xs text-center text-muted-foreground ${recommendations[key] === s ? "bg-accent/5 font-medium text-foreground" : ""}`}>
                          {m.values[s]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* How to Measure */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs uppercase tracking-[0.15em] font-medium">How to Measure</h3>
              </div>
              <div className="space-y-3">
                {chart.howToMeasure.map((item) => (
                  <div key={item.label} className="bg-card rounded-sm p-3">
                    <p className="text-xs font-medium mb-0.5">{item.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.instruction}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            {!recommendations[key] && (
              <div className="text-center py-6 bg-muted rounded-sm">
                <p className="text-sm text-muted-foreground mb-3">Not sure which size to pick?</p>
                <SizeRecommenderModal category={key}>
                  <button className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] bg-primary text-primary-foreground px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity">
                    <Sparkles className="h-3.5 w-3.5" /> What's My Size?
                  </button>
                </SizeRecommenderModal>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
