import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Languages,
  Sparkles,
  Wallet,
  Accessibility,
  Target,
} from "lucide-react";
import { Button, Switch, Badge } from "@/components/ui";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — SafeBank Setup" },
      {
        name: "description",
        content:
          "Set up your SafeBank demo profile: income type, goals, language and accessibility preferences.",
      },
      { property: "og:title", content: "Welcome — SafeBank Setup" },
      { property: "og:description", content: "Set up your SafeBank demo profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const INCOME_TYPES = [
  "Fixed monthly salary",
  "Weekly income",
  "Irregular income",
  "Freelance / self-employed",
  "Student allowance",
  "Other",
];

const GOAL_OPTIONS = [
  "Track spending",
  "Save for emergencies",
  "Improve budgeting",
  "Learn about money",
  "Avoid financial scams",
  "Build financial independence",
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zu", label: "isiZulu" },
] as const;

const TOTAL = 5;

function Onboarding() {
  const { user, completeOnboarding } = useSafeBank();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [incomeType, setIncomeType] = useState<string>("");
  const [goals, setGoals] = useState<string[]>([]);
  const [language, setLanguage] = useState<"en" | "zu">("en");
  const [prefs, setPrefs] = useState({
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    simpleLanguage: false,
  });

  const firstName = (user?.name ?? "Thando").split(" ")[0];

  const toggleGoal = (g: string) =>
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const canNext =
    (step === 1 && true) ||
    (step === 2 && incomeType !== "") ||
    (step === 3 && goals.length > 0) ||
    step >= 4;

  const next = () => {
    if (step === TOTAL) {
      completeOnboarding(incomeType, goals, { language, ...prefs });
      void navigate({ to: "/dashboard" });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-6 flex items-center justify-between">
          <Badge tone="brand">
            <Sparkles className="h-3.5 w-3.5" /> Step {step} of {TOTAL}
          </Badge>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${i < step ? "w-8 bg-primary" : "w-4 bg-border"}`}
              />
            ))}
          </div>
        </div>

        <div className="card-surface p-6 sm:p-8">
          {step === 1 && (
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                Welcome to SafeBank, {firstName}!
              </h1>
              <p className="mt-2 text-muted-foreground">
                Let's build your financial future together. This short setup takes under a minute —
                you can change everything later in Settings.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-extrabold tracking-tight">
                How do you usually earn money?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This helps SafeBank shape your budget around your income pattern.
              </p>
              <div className="mt-5 space-y-2">
                {INCOME_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setIncomeType(t)}
                    aria-pressed={incomeType === t}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3.5 text-left text-sm font-semibold transition-colors ${
                      incomeType === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {t}
                    {incomeType === t && <Check className="h-4.5 w-4.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-extrabold tracking-tight">
                What do you want to achieve?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Select everything that matters to you — you can change these anytime.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    aria-pressed={goals.includes(g)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-left text-sm font-semibold transition-colors ${
                      goals.includes(g)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {g}
                    {goals.includes(g) && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Languages className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-extrabold tracking-tight">Choose your language</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                SafeBank starts with English and isiZulu, with more South African languages planned.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    aria-pressed={language === l.code}
                    className={`cursor-pointer rounded-xl border p-4 text-center font-bold transition-colors ${
                      language === l.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              {language === "zu" && (
                <p className="mt-3 rounded-xl bg-accent/15 p-3 text-xs text-accent-foreground">
                  Demo note: isiZulu is shown as a preference in this prototype; interface copy is
                  still English while translations are prepared.
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Accessibility className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-extrabold tracking-tight">
                Accessibility preferences
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Make SafeBank comfortable for you. You can adjust these later.
              </p>
              <div className="mt-5 space-y-1">
                {(
                  [
                    ["largeText", "Large text", "Bigger text across the whole app"],
                    ["highContrast", "High contrast", "Stronger colours for easier reading"],
                    ["reducedMotion", "Reduced motion", "Minimise animations and transitions"],
                    [
                      "simpleLanguage",
                      "Simple language",
                      "Shorter, plainer wording where available",
                    ],
                  ] as const
                ).map(([key, label, body]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 rounded-xl p-3 hover:bg-muted"
                  >
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground">{body}</p>
                    </div>
                    <Switch
                      checked={prefs[key]}
                      onCheckedChange={(v) => setPrefs({ ...prefs, [key]: v })}
                      label={label}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button size="lg" onClick={next} disabled={!canNext}>
              {step === TOTAL ? "Finish Setup" : "Continue"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
