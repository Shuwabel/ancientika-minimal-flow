import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sizeCharts } from "@/lib/size-data";
import { Ruler } from "lucide-react";

interface SizeGuideModalProps {
  category?: string; // e.g. "tops"
  children: React.ReactNode;
}

export default function SizeGuideModal({ category, children }: SizeGuideModalProps) {
  const defaultTab = category && sizeCharts[category] ? category : "tops";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-light tracking-wide">Size Guide</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-2">
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0 mb-4">
            {Object.keys(sizeCharts).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-[10px] uppercase tracking-[0.15em] rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-1.5"
              >
                {sizeCharts[key].category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(sizeCharts).map(([key, chart]) => (
            <TabsContent key={key} value={key} className="space-y-6 mt-0">
              {/* Measurement Table */}
              <div className="border border-border rounded-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="text-[10px] uppercase tracking-[0.1em] font-medium">Measurement</TableHead>
                      {chart.sizes.map((s) => (
                        <TableHead key={s} className="text-[10px] uppercase tracking-[0.1em] font-medium text-center">{s}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chart.measurements.map((m) => (
                      <TableRow key={m.label}>
                        <TableCell className="text-xs font-medium">{m.label}</TableCell>
                        {chart.sizes.map((s) => (
                          <TableCell key={s} className="text-xs text-center text-muted-foreground">{m.values[s]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* How to Measure */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs uppercase tracking-[0.15em] font-medium">How to Measure</h3>
                </div>
                <div className="space-y-2.5">
                  {chart.howToMeasure.map((item) => (
                    <div key={item.label}>
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
