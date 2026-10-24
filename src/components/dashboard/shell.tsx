import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bell,
  ChevronDown,
  GraduationCap,
  HeartHandshake,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  PiggyBank,
  Settings,
  ShieldCheck,
  Sprout,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import { Badge, Button, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useSafeBank } from "@/store/store";

export const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, pillar: null },
  { to: "/dashboard/smartbudget", label: "SmartBudget", icon: Wallet, pillar: "Prepare" },
  { to: "/dashboard/safepocket", label: "SafePocket", icon: PiggyBank, pillar: "Prepare" },
  { to: "/dashboard/scamshield", label: "ScamShield", icon: ShieldCheck, pillar: "Protect" },
  { to: "/dashboard/moneywise", label: "MoneyWise", icon: GraduationCap, pillar: "Protect" },
  { to: "/dashboard/safety", label: "Financial Safety", icon: LifeBuoy, pillar: "Escape" },
  { to: "/dashboard/rebuild", label: "Rebuild", icon: Sprout, pillar: "Rebuild" },
  { to: "/dashboard/support", label: "Support Navigator", icon: HeartHandshake, pillar: "Escape" },
  { to: "/dashboard/settings", label: "Settings", icon: Settings, pillar: null },
] as const;

const BOTTOM_NAV = NAV.slice(0, 4);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

function ThemeToggle() {
  const { theme, setTheme } = useSafeBank();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="cursor-pointer rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
        className="relative cursor-pointer rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-bold text-muted-foreground">DEMO NOTIFICATIONS</p>
          {[
            { t: "Budget alert", b: "Transport is at 89% of its monthly limit." },
            { t: "Savings milestone", b: "Emergency Fund reached 60% of its target." },
            { t: "Lesson completed", b: "Nice work — 'Your First Emergency Fund' is done." },
          ].map((n) => (
            <div key={n.t} className="rounded-xl p-2.5 hover:bg-muted">
              <p className="text-sm font-semibold">{n.t}</p>
              <p className="text-xs text-muted-foreground">{n.b}</p>
            </div>
          ))}
          <p className="px-2 pb-1 pt-2 text-[11px] text-muted-foreground">Simulated notifications for the prototype.</p>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const { user, logout } = useSafeBank();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const name = user?.name ?? "Demo User";
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Profile menu"
        className="flex cursor-pointer items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {initials(name)}
        </span>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-bold">{name}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? "Demo account"}</p>
          </div>
          <Link to="/dashboard/settings" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted">
              <Settings className="h-4 w-4" /> Settings
            </div>
          </Link>
          <button
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            onClick={() => {
              logout();
              setOpen(false);
              toast.success("Signed out of the SafeBank demo.");
              void navigate({ to: "/" });
            }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSafeBank();
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2.5 px-4 py-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-active text-sidebar-active-foreground">
          <Landmark className="h-5 w-5" />
        </span>
        {!collapsed && <span className="text-lg font-extrabold">SafeBank</span>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {NAV.map((item) => {
          const active =
            item.to === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link key={item.to} to={item.to} title={item.label}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-sidebar-active text-sidebar-active-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="border-t border-sidebar-border px-4 py-3">
          <Badge tone="gold" className="text-[10px]">FNB APP OF THE YEAR</Badge>
          <p className="mt-2 text-xs text-sidebar-foreground/60">
            Demo prototype · {user?.name ?? "Demo"} · Simulated data
          </p>
        </div>
      )}
    </aside>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useSafeBank();
  const navigate = useNavigate();
  if (!open) return null;
  const extra = NAV.slice(4);
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-card p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="More pages"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-bold">More</p>
          <button onClick={onClose} aria-label="Close menu" className="cursor-pointer rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {extra.map((item) => (
            <Link key={item.to} to={item.to} onClick={onClose}>
              <div className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-sm font-semibold">
                <item.icon className="h-5 w-5 text-primary" />
                {item.label}
              </div>
            </Link>
          ))}
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full text-destructive"
          onClick={() => {
            logout();
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, prefs, updatePrefs } = useSafeBank();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const firstName = (user?.name ?? "Thando").split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} />
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="h-4 w-4" />
          </span>
          <span className="font-extrabold">SafeBank</span>
        </span>
        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <NotificationBell />
          <ProfileMenu />
        </div>
      </header>

      {/* Desktop topbar */}
      <header
        className="sticky top-0 z-30 hidden items-center justify-between border-b border-border bg-background/95 px-6 py-3.5 backdrop-blur lg:flex"
        style={{ paddingLeft: collapsed ? 92 : 272 }}
      >
        <div>
          <h1 className="text-lg font-extrabold tracking-tight">
            {greeting()}, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground">Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Language"
            value={prefs.language}
            onChange={(e) => updatePrefs({ language: e.target.value as "en" | "zu" })}
            className="h-9 w-32 text-xs"
          >
            <option value="en">English</option>
            <option value="zu">isiZulu</option>
          </Select>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="cursor-pointer rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboard className="h-5 w-5" />
          </button>
          <NotificationBell />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </header>

      <main className={cn("px-4 pb-28 pt-4 lg:px-8 lg:pb-10", collapsed ? "lg:ml-[76px] lg:pt-6" : "lg:ml-64 lg:pt-6")}>
        <div className="mx-auto max-w-6xl">
          {/* Greeting repeated on mobile */}
          <div className="mb-4 lg:hidden">
            <h1 className="text-xl font-extrabold tracking-tight">
              {greeting()}, {firstName}!
            </h1>
            <p className="text-sm text-muted-foreground">Here's your financial overview.</p>
          </div>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {BOTTOM_NAV.map((item) => {
            const active =
              item.to === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link key={item.to} to={item.to}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className="flex cursor-pointer flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-muted-foreground">
            <Settings className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
