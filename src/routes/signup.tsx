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

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — SafeBank" },
      {
        name: "description",
        content:
          "Create a SafeBank demo profile with just a name, email and password — no ID numbers or bank details. Prototype with simulated data.",
      },
      { property: "og:title", content: "Sign Up — SafeBank" },
      { property: "og:description", content: "Create a SafeBank demo profile by Team Finovators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Signup,
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
          Start building a safer financial future today.
        </h2>
        <p className="mt-3 max-w-md text-white/75">
          We only ever ask for a name, an email and a password. No ID numbers, no bank details, no
          sensitive personal information.
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

function Signup() {
  const { signup, loginDemo } = useSafeBank();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const inputCls = (key: "name" | "email" | "password" | "confirm") =>
    errors[key] ? "border-destructive" : "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: {
      name?: string;
      email?: string;
      password?: string;
      confirm?: string;
    } = {};
    if (name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (confirm !== password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    signup(name.trim(), email);
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
          <h1 className="text-2xl font-extrabold tracking-tight">Create your free profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo prototype — no sensitive information is collected or stored.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="e.g. Thando Mokoena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls("email")}
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pr-10 ${inputCls("password")}`}
                  aria-invalid={!!errors.password}
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
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls("confirm")}
                aria-invalid={!!errors.confirm}
              />
              {errors.confirm && (
                <p className="mt-1 text-xs font-medium text-destructive">{errors.confirm}</p>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full">
              Create Profile <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="mint"
            size="lg"
            className="w-full"
            onClick={() => {
              loginDemo();
              void navigate({ to: "/onboarding" });
            }}
          >
            Try Demo Account
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have a profile?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
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
