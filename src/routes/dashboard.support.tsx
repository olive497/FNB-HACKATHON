import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Info, MapPin, Phone, Search } from "lucide-react";
import { Badge, Button, Card, CardTitle, EmptyState, Input, Label, Modal, Select } from "@/components/ui";
import { SAMPLE_SUPPORT, SUPPORT_CATEGORIES, type SupportEntry } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/support")({
  head: () => ({
    meta: [
      { title: "Support Navigator — SafeBank" },
      { name: "description", content: "Search sample support services: financial guidance, GBV support, legal help, counselling, employment and skills. Clearly labelled sample listings." },
      { property: "og:title", content: "Support Navigator — SafeBank" },
      { property: "og:description", content: "Find categories of trusted support organisations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportNavigator,
});

function SupportNavigator() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All");
  const [detail, setDetail] = useState<SupportEntry | null>(null);

  const regions = useMemo(() => ["All", ...new Set(SAMPLE_SUPPORT.map((s) => s.region.split(",")[0]?.trim() ?? ""))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_SUPPORT.filter((s) => {
      const matchesQ = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.region.toLowerCase().includes(q);
      const matchesC = category === "All" || s.category === category;
      const matchesR = region === "All" || s.region.startsWith(region);
      return matchesQ && matchesC && matchesR;
    });
  }, [query, category, region]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Support Navigator</h2>
        <p className="text-sm text-muted-foreground">Search categories of support organisations by name, service and region.</p>
      </div>

      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent-foreground">
        <p className="flex items-center gap-2 font-bold"><Info className="h-4.5 w-4.5 shrink-0" /> Sample listings</p>
        <p className="mt-1">
          Every entry below is a <strong>clearly labelled sample</strong> created for this hackathon prototype. No real
          organisation names, phone numbers or emergency contacts have been invented or verified. In a production build,
          listings would be sourced and date-verified from official directories.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="sup-q">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="sup-q" placeholder="Service, organisation, region…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="sup-cat">Category</Label>
            <Select id="sup-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All</option>
              {SUPPORT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="sup-region">Region</Label>
            <Select id="sup-region" value={region} onChange={(e) => setRegion(e.target.value)}>
              {regions.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.length === 0 && (
          <div className="sm:col-span-2">
            <EmptyState icon={<Search className="h-8 w-8" />} title="No matching listings" body="Try a different search term, category or region." />
          </div>
        )}
        {filtered.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <Badge tone="brand" className="self-start">{s.category}</Badge>
            <CardTitle className="mt-2">{s.name}</CardTitle>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {s.region}</p>
            <div className="mt-3 flex-1 space-y-1.5 text-sm">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-primary" /> {s.contact}</p>
              <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-primary" /> {s.hours}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge tone="warning">{s.verified}</Badge>
              <Button size="sm" variant="outline" onClick={() => setDetail(s)}>View Details</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail modal */}
      <Modal open={detail !== null} onClose={() => setDetail(null)} title={detail?.name ?? ""}>
        {detail && (
          <div className="space-y-3 text-sm">
            <Badge tone="brand">{detail.category}</Badge>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {detail.region}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {detail.contact}</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {detail.hours}</p>
            <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              Last verified: {detail.verified}. This is sample prototype data — do not rely on it. In the production
              version, every listing is verified against official sources before display.
            </p>
            <Button className="w-full" variant="outline" onClick={() => setDetail(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
