import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { countryCodes, type CountryCode } from "@/lib/country-codes";

interface CountryCodeSelectProps {
  value: string;
  onChange: (dial: string) => void;
}

export default function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = countryCodes.find((c) => c.dial === value) ?? countryCodes[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className="flex items-center gap-1 h-10 px-2 border border-r-0 rounded-l-md bg-muted text-sm hover:bg-accent transition-colors min-w-[80px]"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-xs text-muted-foreground">{selected.dial}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-auto rounded-md border bg-popover shadow-lg z-50">
          <div className="sticky top-0 bg-popover p-2 border-b">
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
          </div>
          {filtered.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onChange(c.dial); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors ${
                c.dial === value ? "bg-accent" : ""
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="flex-1 text-left">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.dial}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground p-3 text-center">No results</p>
          )}
        </div>
      )}
    </div>
  );
}
