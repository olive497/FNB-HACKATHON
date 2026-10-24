import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  Calculator,
  EyeOff,
  HeartHandshake,
  Info,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardTitle,
  EmptyState,
  Input,
  Label,
  Modal,
  SectionTitle,
} from "@/components/ui";
import { SAFETY_EXPENSE_ITEMS } from "@/lib/demo-data";
import { formatZAR, parseAmount } from "@/lib/format";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard/safety")({
  head: () => ({
    meta: [
      { title: "Financial Safety — SafeBank" },
      {
        name: "description",
        content:
          "Private financial safety tools: education, essential-costs planning, trusted contacts and privacy controls. Nothing is saved or shared.",
      },
      { property: "og:title", content: "Financial Safety — SafeBank" },
      { property: "og:description", content: "Optional, confidential financial safety planning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinancialSafety,
});

const ABUSE_EXAMPLES = [
  "A partner controlling access to money — taking your wages, grant or savings.",
  "Being prevented from working or attending school.",
  "Forced debt — loans or accounts opened or run up in your name.",
  "Financial threats — money withheld as punishment or control.",
  "Restricted access to bank accounts, cards or PINs.",
  "Economic dependence — being kept financially powerless on purpose.",
];

function FinancialSafety() {
  const store = useSafeBank();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"home" | "learn" | "plan" | "circle" | "privacy">("home");
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState({ name: "", relation: "" });
  const [contactError, setContactError] = useState("");

  const safeExitTotal = SAFETY_EXPENSE_ITEMS.reduce(
    (a, item) => a + (store.safeExit[item] ?? 0),
    0,
  );

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name.trim()) {
      setContactError("Enter a name for this sample contact.");
      return;
    }
    store.addContact(contact.name.trim(), contact.relation.trim() || "Trusted contact");
    setContact({ name: "", relation: "" });
    setContactError("");
    setContactOpen(false);
  };

  const quickExit = () => {
    store.clearSensitiveData();
    void navigate({ to: "/" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Financial Safety</h2>
          <p className="text-sm text-muted-foreground">
            Optional, private tools. You never have to explain or disclose anything to use them.
          </p>
        </div>
        <Button variant="outline" onClick={quickExit}>
          <EyeOff className="h-4 w-4" /> Quick Exit
        </Button>
      </div>

      {/* Tab nav */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {(
          [
            ["home", "Overview", HeartHandshake],
            ["learn", "Understand Financial Abuse", BookOpen],
            ["plan", "Plan Essential Expenses", Calculator],
            ["circle", "Safety Circle", UserPlus],
            ["privacy", "Privacy Settings", Lock],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              [
                "learn",
                BookOpen,
                "Understand Financial Abuse",
                "Learn what financial control can look like — and that it is never your fault.",
              ],
              [
                "plan",
                Calculator,
                "Plan Essential Expenses",
                "Privately estimate what you would need to cover transport, food, accommodation and more.",
              ],
              [
                "circle",
                UserPlus,
                "Find Trusted Support",
                "Keep a private list of sample trusted contacts and browse support organisations.",
              ],
              [
                "privacy",
                Lock,
                "Review Privacy Settings",
                "Clear planning data, control notifications and understand what stays on your device.",
              ],
            ] as const
          ).map(([key, Icon, title, body]) => (
            <button key={key} onClick={() => setTab(key)} className="cursor-pointer text-left">
              <Card className="h-full transition-shadow hover:shadow-lg">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle>{title}</CardTitle>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </Card>
            </button>
          ))}
          <Card className="sm:col-span-2 border-primary/25 bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-primary" /> How SafeBank protects you here
            </CardTitle>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>
                • This section uses a neutral name — Financial Safety — and requires no disclosure
                of personal circumstances.
              </li>
              <li>
                • Nothing you plan here is saved to your device, exported, or shared with anyone
                automatically.
              </li>
              <li>• Quick Exit above closes this section immediately.</li>
            </ul>
          </Card>
        </div>
      )}

      {tab === "learn" && (
        <div className="space-y-4">
          <Card>
            <CardTitle>What financial abuse can look like</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Financial abuse is a pattern of control over someone's money or ability to earn. It
              can happen to anyone, in any kind of relationship. These are examples other people
              have described:
            </p>
            <ul className="mt-3 space-y-2">
              {ABUSE_EXAMPLES.map((ex) => (
                <li key={ex} className="flex items-start gap-2 rounded-xl bg-muted p-3 text-sm">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {ex}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>A few things worth knowing</CardTitle>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="rounded-xl bg-primary/5 p-3">
                It is not your fault. Economic control is often created gradually and deliberately.
              </li>
              <li className="rounded-xl bg-primary/5 p-3">
                Wanting financial independence is healthy and normal — small steps count: your own
                knowledge, your own plan, knowing what things cost.
              </li>
              <li className="rounded-xl bg-primary/5 p-3">
                You control the pace. Everything in this section is optional, private and erasable.
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              SafeBank offers education and planning tools, not crisis services. If you are in
              danger, contact your local emergency services. The Support Navigator lists sample
              categories of trusted organisations to explore.
            </p>
          </Card>
          <Button
            variant="outline"
            onClick={() => {
              setTab("plan");
            }}
          >
            Next: Plan Essential Expenses
          </Button>
        </div>
      )}

      {tab === "plan" && (
        <Card>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>SafeExit Calculator</CardTitle>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Privately estimate essential living costs. Entries live only in this session — nothing
            is saved, exported or shared.
          </p>
          <div className="mt-4 space-y-2.5">
            {SAFETY_EXPENSE_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-2.5"
              >
                <span className="text-sm font-semibold">{item}</span>
                <Input
                  aria-label={`Estimated monthly cost for ${item}`}
                  inputMode="decimal"
                  placeholder="R0"
                  className="h-9 w-32 text-right"
                  value={store.safeExit[item] ? String(store.safeExit[item]) : ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : parseAmount(e.target.value);
                    store.setSafeExitItem(item, v === null || !Number.isFinite(v) ? null : v);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary/10 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">Estimated total</p>
              <p className="text-2xl font-extrabold text-primary">{formatZAR(safeExitTotal)}</p>
              <p className="text-xs text-muted-foreground">
                Illustrative estimate only — real costs vary.
              </p>
            </div>
            <Button variant="destructive" onClick={() => store.clearSafeExit()}>
              <Trash2 className="h-4 w-4" /> Clear All Entries
            </Button>
          </div>
        </Card>
      )}

      {tab === "circle" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Safety Circle</CardTitle>
                <p className="text-sm text-muted-foreground">
                  A private list of people you could turn to.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setContactOpen(true);
                  setContactError("");
                }}
              >
                <Plus className="h-4 w-4" /> Add Contact
              </Button>
            </div>
            <div className="mt-4">
              {store.circle.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="h-8 w-8" />}
                  title="No sample contacts yet"
                  body="Add sample trusted contacts to see how your Safety Circle would look. Nothing is contacted or shared."
                />
              ) : (
                <div className="space-y-2">
                  {store.circle.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3.5 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.relation}</p>
                      </div>
                      <button
                        onClick={() => store.removeContact(c.id)}
                        aria-label={`Remove ${c.name}`}
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-4 rounded-xl bg-accent/10 p-3 text-xs text-accent-foreground">
              Prototype only: SafeBank does not send real messages, share your location, or share
              plans or financial information with anyone.
            </p>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="h-4.5 w-4.5 text-primary" /> Trusted support categories
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse clearly labelled sample organisations in the Support Navigator.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => {
                void navigate({ to: "/dashboard/support" });
              }}
            >
              Open Support Navigator
            </Button>
          </Card>
        </div>
      )}

      {tab === "privacy" && (
        <div className="space-y-4">
          <Card>
            <CardTitle>Privacy Controls</CardTitle>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-start gap-2 rounded-xl bg-muted p-3">
                <Badge tone="positive" className="mt-0.5">
                  On
                </Badge>
                <span>
                  No sensitive notifications — this section never generates alerts or notifications.
                </span>
              </li>
              <li className="flex items-start gap-2 rounded-xl bg-muted p-3">
                <Badge tone="positive" className="mt-0.5">
                  On
                </Badge>
                <span>
                  Planning data is memory-only — it disappears when you leave, log out, or clear it
                  below.
                </span>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="destructive" onClick={() => store.clearSensitiveData()}>
                <Trash2 className="h-4 w-4" /> Clear sensitive planning data
              </Button>
              <Button variant="outline" onClick={quickExit}>
                <EyeOff className="h-4 w-4" /> Quick Exit to neutral page
              </Button>
            </div>
          </Card>
          <Card>
            <CardTitle>Being honest about limits</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              SafeBank is designed to be private, but no app is completely invisible. Someone with
              access to your device or accounts — or your network or service provider — may still be
              able to see that you visited sites or apps, including this one. Device-level activity
              may remain visible regardless of what SafeBank does.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              If device monitoring is a concern in your situation, consider using a trusted device,
              private browsing, or asking a support organisation about safe device access.
            </p>
          </Card>
        </div>
      )}

      <SectionTitle
        title=""
        subtitle="You can leave this section at any time — nothing needs to be completed."
      />

      {/* Add contact modal */}
      <Modal open={contactOpen} onClose={() => setContactOpen(false)} title="Add Sample Contact">
        <form onSubmit={addContact} className="space-y-4">
          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              placeholder="e.g. Aunt Nomsa"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="c-rel">Relationship (optional)</Label>
            <Input
              id="c-rel"
              placeholder="e.g. Family, friend, colleague"
              value={contact.relation}
              onChange={(e) => setContact({ ...contact, relation: e.target.value })}
            />
          </div>
          {contactError && <p className="text-xs font-medium text-destructive">{contactError}</p>}
          <Button type="submit" className="w-full">
            Add Contact
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Sample contact only — no messages are sent and nothing is shared.
          </p>
        </form>
      </Modal>
    </div>
  );
}
