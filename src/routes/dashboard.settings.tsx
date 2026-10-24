import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  Database,
  Globe,
  Info,
  Lock,
  Moon,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge, Button, Card, CardTitle, Input, Label, Select, Switch } from "@/components/ui";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SafeBank" },
      {
        name: "description",
        content:
          "Profile, language, theme, accessibility, privacy and demo data settings for the SafeBank prototype.",
      },
      { property: "og:title", content: "Settings — SafeBank" },
      { property: "og:description", content: "SafeBank prototype settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Row({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Settings() {
  const store = useSafeBank();
  const navigate = useNavigate();
  const [name, setName] = useState(store.user?.name ?? "");
  const [notif, setNotif] = useState({ budget: true, savings: true, lessons: false, scam: true });

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Please enter a name with at least 2 characters.");
      return;
    }
    store.updateUser({ name: name.trim() });
    toast.success("Profile updated.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Preferences for your SafeBank demo experience.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-5 w-5 text-primary" /> Profile Settings
        </CardTitle>
        <form onSubmit={saveProfile} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Label htmlFor="p-name">Display name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit">Save Profile</Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Email: {store.user?.email ?? "Demo account"} (demo — not editable)
        </p>
      </Card>

      {/* Language & theme */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Language Preferences
          </CardTitle>
          <div className="mt-3">
            <Label htmlFor="s-lang">Interface language</Label>
            <Select
              id="s-lang"
              value={store.prefs.language}
              onChange={(e) => store.updatePrefs({ language: e.target.value as "en" | "zu" })}
            >
              <option value="en">English</option>
              <option value="zu">isiZulu</option>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              Starting with English and isiZulu — structured for more South African languages in
              future releases.
            </p>
          </div>
        </Card>
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" /> Theme Settings
          </CardTitle>
          <div className="mt-3">
            <Row title="Dark mode" body="Switch between light and dark appearances.">
              <Switch
                checked={store.theme === "dark"}
                onCheckedChange={(v) => store.setTheme(v ? "dark" : "light")}
                label="Dark mode"
              />
            </Row>
          </div>
        </Card>
      </div>

      {/* Accessibility */}
      <Card>
        <CardTitle>Accessibility Settings</CardTitle>
        <div className="mt-3 space-y-2.5">
          <Row title="Large text" body="Increase the size of all text in the app.">
            <Switch
              checked={store.prefs.largeText}
              onCheckedChange={(v) => store.updatePrefs({ largeText: v })}
              label="Large text"
            />
          </Row>
          <Row title="High contrast" body="Stronger colours and clearer boundaries.">
            <Switch
              checked={store.prefs.highContrast}
              onCheckedChange={(v) => store.updatePrefs({ highContrast: v })}
              label="High contrast"
            />
          </Row>
          <Row title="Reduced motion" body="Minimise animations and transitions.">
            <Switch
              checked={store.prefs.reducedMotion}
              onCheckedChange={(v) => store.updatePrefs({ reducedMotion: v })}
              label="Reduced motion"
            />
          </Row>
          <Row title="Simple language" body="Prefer shorter, plainer wording where available.">
            <Switch
              checked={store.prefs.simpleLanguage}
              onCheckedChange={(v) => store.updatePrefs({ simpleLanguage: v })}
              label="Simple language"
            />
          </Row>
        </div>
      </Card>

      {/* Privacy & data */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> Privacy and Data Controls
        </CardTitle>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="rounded-xl bg-muted p-3">
            Your demo budget data is stored only in this browser (browser storage). It is{" "}
            <strong>not secure storage</strong> — never enter real banking details, ID numbers or
            other sensitive information here.
          </li>
          <li className="rounded-xl bg-muted p-3">
            Financial Safety planning data is never saved to storage — it lives only for the current
            session.
          </li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              store.clearSensitiveData();
              void navigate({ to: "/dashboard/safety" });
            }}
          >
            <Trash2 className="h-4 w-4" /> Clear sensitive planning data
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Notification Preferences
        </CardTitle>
        <div className="mt-3 space-y-2.5">
          <Row title="Budget alerts" body="Warn me when a category exceeds its limit.">
            <Switch
              checked={notif.budget}
              onCheckedChange={(v) => {
                setNotif({ ...notif, budget: v });
                toast.success(v ? "Budget alerts on." : "Budget alerts off.");
              }}
              label="Budget alerts"
            />
          </Row>
          <Row title="Savings milestones" body="Celebrate progress towards goals.">
            <Switch
              checked={notif.savings}
              onCheckedChange={(v) => {
                setNotif({ ...notif, savings: v });
                toast.success(v ? "Savings milestones on." : "Savings milestones off.");
              }}
              label="Savings milestones"
            />
          </Row>
          <Row title="Learning reminders" body="Nudges to continue MoneyWise lessons.">
            <Switch
              checked={notif.lessons}
              onCheckedChange={(v) => {
                setNotif({ ...notif, lessons: v });
                toast.success(v ? "Learning reminders on." : "Learning reminders off.");
              }}
              label="Learning reminders"
            />
          </Row>
          <Row title="Scam alerts" body="Share trending scam warnings.">
            <Switch
              checked={notif.scam}
              onCheckedChange={(v) => {
                setNotif({ ...notif, scam: v });
                toast.success(v ? "Scam alerts on." : "Scam alerts off.");
              }}
              label="Scam alerts"
            />
          </Row>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Demo preferences — no real notifications are delivered. Financial Safety never generates
          notifications by default.
        </p>
      </Card>

      {/* Demo data */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" /> Demo Data Reset
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Restore the original sample budget, goals, debts and learning progress. Your profile,
          theme and preferences are kept.
        </p>
        <Button variant="destructive" className="mt-3" onClick={() => store.resetDemoData()}>
          <RotateCcw className="h-4 w-4" /> Reset Demo Data
        </Button>
      </Card>

      {/* About */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" /> About SafeBank
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          SafeBank — Your Money. Your Safety. Your Future. A financial inclusion and
          money-management platform developed by{" "}
          <span className="font-semibold text-foreground">Team Finovators</span> for the FNB App of
          the Year Hackathon, Financial Inclusion and Money Management category.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="brand">Version: Hackathon prototype</Badge>
          <Badge tone="warning">All financial data shown is simulated</Badge>
          <Badge tone="neutral">Not a real bank — no real-money transfers</Badge>
        </div>
      </Card>
    </div>
  );
}
