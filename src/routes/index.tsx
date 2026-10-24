import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  ChartNoAxesCombined,
  ChevronDown,
  Coins,
  HandCoins,
  HeartHandshake,
  Landmark,
  LifeBuoy,
  Lock,
  Menu,
  PiggyBank,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { formatZAR } from "@/lib/format";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeBank — Your Money. Your Safety. Your Future." },
      {
        name: "description",
        content:
          "Budget smarter, save confidently, recognise scams and build financial independence — an inclusive money platform for South Africans by Team Finovators. Demo prototype.",
      },
      { property: "og:title", content: "SafeBank — Your Money. Your Safety. Your Future." },
      {
        property: "og:description",
        content:
          "Budgeting, savings, scam awareness and financial safety tools designed for South Africans with irregular incomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "About", href: "#about" },
  { label: "FAQs", href: "#faqs" },
];

const PILLARS = [
  {
    key: "prepare",
    title: "PREPARE",
    icon: Wallet,
    body: "Smart budgeting, income tracking and savings goals built for irregular incomes.",
    to: "/dashboard/smartbudget",
  },
  {
    key: "protect",
    title: "PROTECT",
    icon: ShieldCheck,
    body: "Scam awareness, financial security and privacy controls.",
    to: "/dashboard/scamshield",
  },
  {
    key: "escape",
    title: "ESCAPE",
    icon: LifeBuoy,
    body: "Optional, confidential financial safety planning and access to trusted support.",
    to: "/dashboard/safety",
  },
  {
    key: "rebuild",
    title: "REBUILD",
    icon: SproutIcon,
    body: "Financial education, recovery planning and long-term independence.",
    to: "/dashboard/rebuild",
  },
];

function SproutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 20h10" />
      <path d="M12 20v-9" />
      <path d="M12 11c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z" />
      <path d="M12 13c0-2.5-2-4.5-4.5-4.5 0 2.5 2 4.5 4.5 4.5z" />
    </svg>
  );
}

const BENEFITS = [
  {
    icon: ChartNoAxesCombined,
    title: "Manage irregular income",
    body: "Budget around changing earnings — daily, weekly or monthly — so a slow month never derails you.",
  },
  {
    icon: PiggyBank,
    title: "Build emergency savings",
    body: "Start small and stay consistent with flexible goals that adapt to what you can afford.",
  },
  {
    icon: ShieldCheck,
    title: "Recognise financial scams",
    body: "Check suspicious messages instantly and learn the tricks scammers use in South Africa.",
  },
  {
    icon: HeartHandshake,
    title: "Strengthen financial independence",
    body: "Private tools and education for anyone working towards control over their own money.",
  },
];

const STEPS = [
  {
    title: "Create your financial profile",
    body: "Tell SafeBank how you earn — fixed salary, weekly, freelance or irregular — and what you want to achieve.",
  },
  {
    title: "Track your income and expenses",
    body: "Log money in and out in seconds. SmartBudget recalculates everything instantly.",
  },
  {
    title: "Build flexible savings goals",
    body: "Set targets in SafePocket and contribute any amount, any time. Watch progress grow.",
  },
  {
    title: "Learn, protect and strengthen",
    body: "Take short MoneyWise lessons, check suspicious messages and plan for a safer future.",
  },
];

const INCLUSION = [
  { icon: ShoppingBasket, label: "Informal traders" },
  { icon: LaptopIcon, label: "Freelancers" },
  { icon: Brain, label: "Students" },
  { icon: ClockIcon, label: "Part-time workers" },
  { icon: Coins, label: "Gig workers" },
  { icon: HeartHandshake, label: "People experiencing financial instability" },
];

function LaptopIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9H3z" />
      <path d="M2 19h20" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const FAQS = [
  {
    q: "What is SafeBank?",
    a: "SafeBank is a financial planning and education platform by Team Finovators, built for the FNB App of the Year Hackathon. It combines smart budgeting, flexible savings goals, scam awareness and optional financial safety tools in one inclusive app.",
  },
  {
    q: "Is SafeBank a real bank?",
    a: "No. SafeBank is not a bank and is not registered as a financial services provider. It is a planning and education tool. This prototype uses simulated demo data only.",
  },
  {
    q: "Can SafeBank hold my money?",
    a: "No. SafeBank never holds, moves or transfers real money. SafePocket tracks your savings goals — the money itself stays wherever you choose to keep it.",
  },
  {
    q: "Is SafeBank free?",
    a: "The SafeBank prototype is free to explore via the demo account. No payment details are ever requested.",
  },
  {
    q: "Can I use SafeBank with irregular income?",
    a: "Yes — SafeBank is designed for irregular incomes first. Irregular Income Mode helps you budget on your lowest recent earnings and plan for good months.",
  },
  {
    q: "How does SafeBank help with financial safety?",
    a: "SafeBank includes a private Financial Safety section with education, an essential-costs planner, a trusted contacts list and privacy controls — designed never to require disclosure of personal circumstances, and never to share anything automatically.",
  },
];

function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-md rotate-1 rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
      <div className="rounded-2xl bg-white p-4 text-card-foreground shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Good morning, Thando!</p>
            <p className="text-sm font-bold">October overview</p>
          </div>
          <Badge tone="brand">Demo</Badge>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-muted p-3">
            <p className="text-muted-foreground">Available</p>
            <p className="mt-0.5 text-base font-extrabold">{formatZAR(5945)}</p>
            <p className="mt-0.5 font-semibold text-primary">+12% vs Sep</p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <p className="text-muted-foreground">Emergency fund</p>
            <p className="mt-0.5 text-base font-extrabold">60%</p>
            <div className="mt-1.5 h-2 rounded-full bg-background">
              <div className="h-full w-3/5 rounded-full bg-primary" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex h-24 items-end gap-2 rounded-xl bg-muted p-3">
          {[45, 70, 52, 85, 60, 95, 74].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-primary/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 rounded-2xl bg-accent px-3 py-2 text-xs font-bold text-accent-foreground shadow-lg">
        Scam risk: HIGH ⚠️
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-surface overflow-hidden p-0">
      <button
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Landmark className="h-5 w-5" />
      </span>
      <span
        className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-foreground"}`}
      >
        Safe<span className="text-primary">Bank</span>
      </span>
    </span>
  );
}

function Landing() {
  const { loginDemo } = useSafeBank();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToDashboard = () => {
    loginDemo();
    void navigate({ to: "/onboarding" });
  };

  return (
    <div id="home" className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
          <button
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 font-medium"
              >
                {n.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero-mesh px-4 py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <Badge tone="gold" className="mb-4 text-[13px]">
              <Sparkles className="h-3.5 w-3.5" /> Built for South Africa. Powered by Finovators.
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Take Control of Your Money. Build a Safer Financial Future.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Budget smarter, save confidently, recognise financial scams and build financial
              independence — all in one inclusive platform designed for South Africans.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-brand hover:bg-white/90">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  Explore Features
                </Button>
              </a>
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* Why SafeBank */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Why SafeBank?</h2>
          <p className="mt-3 text-muted-foreground">
            Financial management should be accessible to everyone — including people with irregular
            incomes, students, informal workers and individuals experiencing financial
            vulnerability.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card-surface transition-shadow hover:shadow-lg">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Four Pillars */}
      <section id="features" className="bg-secondary py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">The Four Pillars of SafeBank</h2>
            <p className="mt-3 text-muted-foreground">
              Every feature in SafeBank supports one of four promises that stay visible across the
              whole product.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <Link key={p.key} to={p.to} className="group">
                <div className="card-surface h-full transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                      <p.icon className="h-6 w-6" />
                    </div>
                    <span className="text-4xl font-extrabold text-border">0{i + 1}</span>
                  </div>
                  <h3 className="flex items-center gap-1.5 font-extrabold tracking-wide">
                    {p.title}{" "}
                    <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">How SafeBank Works</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={i} className="relative card-surface">
              <span className="absolute -top-3 left-5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
                Step {i + 1}
              </span>
              <h3 className="mt-2 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Financial inclusion */}
      <section className="bg-secondary py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Designed for Financial Inclusion
              </h2>
              <p className="mt-3 text-muted-foreground">
                SafeBank is built for the millions of South Africans the traditional financial
                system struggles to serve — with simple language, flexible budgeting and tools that
                work even when income doesn't arrive on the same day each month.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INCLUSION.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-xl bg-background p-3 text-sm font-medium"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-primary" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="card-surface">
              <h3 className="flex items-center gap-2 font-bold">
                <Lock className="h-5 w-5 text-primary" /> Privacy and Trust
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                SafeBank is a financial planning and education platform, not a bank. Your control
                comes first:
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  "User control — you decide what to enter and what to delete",
                  "Privacy-first design — sensitive planning data is never saved or shared automatically",
                  "No real-money transfers — nothing moves without a bank, because there is no bank",
                  "No automatic sharing of sensitive information",
                  "Accessible financial tools — simple language, large text and high-contrast options",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="hero-mesh px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Your Money. Your Safety. Your Future.
          </h2>
          <p className="mt-3 text-white/80">
            Explore the full SafeBank experience with the demo account — no sign-up needed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-brand hover:bg-white/90"
              onClick={goToDashboard}
            >
              <UserRound className="h-5 w-5" /> Try Demo Account
            </Button>
            <Link to="/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Create Free Profile
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/60">
            Demo prototype — all financial information shown is simulated.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-brand py-10 text-brand-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          <div>
            <Logo light />
            <p className="mt-3 text-sm text-white/70">Your Money. Your Safety. Your Future.</p>
            <p className="mt-4 text-xs text-white/50">Developed by Team Finovators</p>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-bold">Explore</p>
            <ul className="space-y-2 text-white/70">
              <li>
                <a href="#about" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-bold">Hackathon</p>
            <p className="text-white/70">
              Built for the{" "}
              <span className="font-semibold text-white">FNB App of the Year Hackathon</span>
              <br />
              Financial Inclusion and Money Management category.
            </p>
            <p className="mt-3 text-xs text-white/50">
              Prototype only — no real banking, payments or data collection.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-4 pt-5 text-center text-xs text-white/50">
          Â© 2026 Team Finovators · SafeBank demo · Simulated data throughout
        </div>
      </footer>
    </div>
  );
}
