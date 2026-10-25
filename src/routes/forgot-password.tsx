import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MailCheck, Landmark } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — SafeBank" },
      {
        name: "description",
        content: "Reset your SafeBank demo password. Prototype with simulated data.",
      },
      { property: "og:title", content: "Reset Password — SafeBank" },
      { property: "og:description", content: "Reset your SafeBank demo password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to log in
        </Link>
        <div className="card-surface p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Landmark className="h-6 w-6" />
          </span>
          {sent ? (
            <div className="mt-5">
              <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                <MailCheck className="h-6 w-6 text-primary" /> Check your email
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for <span className="font-semibold">{email}</span>, a demo
                reset link has been sent. In this prototype no real email is delivered.
              </p>
              <Link to="/login" className="mt-6 block">
                <Button className="w-full">Back to Log In</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <h1 className="text-xl font-extrabold tracking-tight">Forgot your password?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email address and we'll send you a demo reset link.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                  />
                  {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
