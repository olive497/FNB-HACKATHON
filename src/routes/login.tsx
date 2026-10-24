import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Landmark,
  LifeBuoy,
  ShieldCheck,
  Sprout,
  Wallet,
} from "lucide-react";
import { Button, Input, Label, Badge } from "@/components/ui";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — SafeBank" },
      {
        name: "description",
        content:
          "Sign in to the SafeBank demo, or explore instantly with the demo account. Prototype with simulated data.",
      },
      { property: "og:title", content: "Log In — SafeBank" },
      { property: "og:description", content: "Sign in to the SafeBank demo by Team Finovators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

const PILLARS = [
  { icon: Wallet, label: "Prepare", body: "Smart budgeting for irregular incomes" },
  { icon: ShieldCheck, label: "Protect", body: "Scam awareness and privacy controls" },
  { icon: LifeBuoy, label: "Escape", body: "Confidential financial safety planning" },
  { icon: Sprout, label: "Rebuild", body: "Education and financial recovery" },
];

function BrandPanel() {
  return (
    <div className="hero-mesh hidden flex-col justify-between p-10 text-white lg:flex">
      <div>
        <span className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Landmark className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold">SafeBank</span>
        </span>
        <h2 className="mt-14 text-3xl font-extrabold leading-tight">
          Your Money. Your Safety. Your Future.
        </h2>
        <p className="mt-3 max-w-md text-white/75">
          Inclusive money management designed for South Africans — built by Team Finovators for the
          FNB App of the Year Hackathon.
        </p>
      </div>
      <div className="space-y-3">
        {PILLARS.map((p) => (
          <div key={p.label} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <p.icon className="h-5 w-5 shrink-0 text-white" />
            <div>
              <p className="text-sm font-bold tracking-wide">{p.label.toUpperCase()}</p>
              <p className="text-xs text-white/70">{p.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Login() {
  const { login, loginDemo } = useSafeBank();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    login(email);
    void navigate({ to: "/onboarding" });
  };

  const demo = () => {
    loginDemo();
    void navigate({ to: "/onboarding" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Landmark className="h-5 w-5" />
              </span>
              <span className="text-xl font-extrabold">SafeBank</span>
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo prototype — mock authentication, no real accounts.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Log In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="mint" size="lg" className="w-full" onClick={demo}>
            Try Demo Account
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Explore instantly as <span className="font-semibold">Thando Mokoena</span> with
            simulated data.
          </p>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to SafeBank?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <div className="mt-6 text-center">
            <Badge tone="brand">Demo build — all data is simulated</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
