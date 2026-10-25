import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";

import {

  AlertTriangle,

  CheckCircle2,

  CircleAlert,

  GraduationCap,

  MessageSquareWarning,

  ScanSearch,

  ShieldCheck,

} from "lucide-react";

import { Badge, Button, Card, CardTitle, SectionTitle, Textarea } from "@/components/ui";

import { SCAM_EDUCATION, SCAM_QUIZ, analyseMessage, type ScamResult } from "@/lib/demo-data";

import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard/scamshield")({

  head: () => ({

    meta: [

      { title: "ScamShield — SafeBank" },

      {

        name: "description",

        content:

          "Check suspicious messages with transparent rule-based detection, learn common scams and test yourself. Demo.",

      },

      { property: "og:title", content: "ScamShield — SafeBank" },

      { property: "og:description", content: "Financial scam awareness and message checking." },

      { property: "og:type", content: "website" },

      { name: "twitter:card", content: "summary_large_image" },

    ],

  }),

  component: ScamShield,

});

function ScamShield() {

  const store = useSafeBank();

  const [text, setText] = useState("");

  const [result, setResult] = useState<ScamResult | null>(null);

  const [error, setError] = useState("");

  // Quiz state

  const [quizStarted, setQuizStarted] = useState(false);

  const [qIndex, setQIndex] = useState(0);

  const [selected, setSelected] = useState<number | null>(null);

  const [revealed, setRevealed] = useState(false);

  const [score, setScore] = useState(0);

  const [quizDone, setQuizDone] = useState(false);

  const analyse = () => {

    if (text.trim().length < 5) {

      setError("Paste or type the message you want to check (at least a few words).");

      return;

    }

    setError("");

    setResult(analyseMessage(text));

  };

  const answer = (idx: number) => {

    if (revealed) return;

    setSelected(idx);

    setRevealed(true);

    if (idx === SCAM_QUIZ[qIndex]!.answer) setScore((s) => s + 1);

  };

  const nextQuestion = () => {

    if (qIndex + 1 >= SCAM_QUIZ.length) {

      setQuizDone(true);

      if (score === SCAM_QUIZ.length) {

        store.updatePrefs({});

      }

      return;

    }

    setQIndex((i) => i + 1);

    setSelected(null);

    setRevealed(false);

  };

  const restartQuiz = () => {

    setQuizStarted(false);

    setQIndex(0);

    setSelected(null);

    setRevealed(false);

    setScore(0);

    setQuizDone(false);

  };

  const levelMeta = result

    ? result.level === "high"

      ? {

          label: "HIGH RISK",

          tone: "danger" as const,

          icon: AlertTriangle,

          cls: "border-destructive/30 bg-destructive/10",

        }

      : result.level === "medium"

        ? {

            label: "CAUTION",

            tone: "warning" as const,

            icon: CircleAlert,

            cls: "border-accent/40 bg-accent/10",

          }

        : {

            label: "LOW RISK",

            tone: "positive" as const,

            icon: CheckCircle2,

            cls: "border-primary/30 bg-primary/10",

          }

    : null;

  return (

    <div className="space-y-6">

      <div>

        <h2 className="text-xl font-bold tracking-tight">ScamShield</h2>

        <p className="text-sm text-muted-foreground">

          Recognise financial scams before they cost you. Prototype with rule-based checking.

        </p>

      </div>

      {/* Scam checker */}

      <Card>

        <div className="flex items-center gap-2">

          <ScanSearch className="h-5 w-5 text-primary" />

          <CardTitle>Scam Checker</CardTitle>

        </div>

        <p className="mt-1 text-sm text-muted-foreground">

          Paste a suspicious SMS, WhatsApp message or link.

        </p>

        <Textarea

          aria-label="Suspicious message"

          className="mt-3"

          placeholder="e.g. 'FNB: Your account has been blocked. Click http://fnb-verify.xyz to confirm your OTP now.'"

          value={text}

          onChange={(e) => setText(e.target.value)}

        />

        {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}

        <Button className="mt-3" onClick={analyse}>

          <ShieldCheck className="h-4 w-4" /> Analyse Message

        </Button>

        {result && levelMeta && (

          <div className={`mt-4 rounded-2xl border p-4 ${levelMeta.cls}`} role="status">

            <div className="flex items-center justify-between gap-2">

              <span className="flex items-center gap-2 font-extrabold">

                <levelMeta.icon className="h-5 w-5" /> {levelMeta.label}

              </span>

              <Badge tone={levelMeta.tone}>

  Rule-based risk score: {result.score}/100

</Badge>

            </div>

            {result.detected.length > 0 ? (

              <>

                <p className="mt-3 text-sm font-semibold">Warning signs detected:</p>

                <ul className="mt-2 space-y-2.5">

                  {result.detected.map(({ rule, matches }) => (

                    <li key={rule.id} className="rounded-xl bg-card p-3 text-sm">

                      <p className="font-bold">{rule.label}</p>

                      <p className="mt-0.5 text-muted-foreground">{rule.why}</p>

                      <p className="mt-1 text-xs italic text-muted-foreground">

                        Matched: “{matches.join(", ")}”

                      </p>

                    </li>

                  ))}

                </ul>

              </>

            ) : (

              <p className="mt-3 text-sm">

                No known scam indicators were found — but that does <strong>not</strong> mean the

                message is safe. New scams appear every day. Verify the sender through an official

                channel before acting.

              </p>

            )}

            <div className="mt-4 rounded-xl bg-card p-3.5 text-sm">

              <p className="font-bold">Suggested verification steps</p>

              <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-muted-foreground">

                <li>Do not tap any links or reply to the message.</li>

                <li>Never share an OTP, PIN or password with anyone.</li>

                <li>

                  Contact your bank using the number printed on your card or on its official app.

                </li>

                <li>

                  If it claims to be from a company, find its official contact details yourself.

                </li>

              </ol>

            </div>

            <p className="mt-3 text-xs font-medium">
              Reminder: no legitimate organisation will ever ask you to share OTPs or passwords.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              ScamShield uses rule-based detection to identify common warning signs.
              This score is not a probability of fraud, and a low score does not
              guarantee that a message is safe.
            </p>
          </div>

        )}

      </Card>

     cc

      <div>

        <SectionTitle

          title="Scam Education"

          subtitle="The tricks most commonly used in South Africa."

        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {SCAM_EDUCATION.map((s) => (

            <Card key={s.title}>

              <CardTitle className="flex items-center gap-2">

                <MessageSquareWarning className="h-4.5 w-4.5 text-destructive" /> {s.title}

              </CardTitle>

              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>

              <p className="mt-3 rounded-xl bg-primary/10 p-2.5 text-xs font-semibold text-primary">

                {s.tip}

              </p>

            </Card>

          ))}

        </div>

      </div>

      {/* Quiz */}

      <Card>

        <div className="flex items-center gap-2">

          <GraduationCap className="h-5 w-5 text-primary" />

          <CardTitle>Spot-the-Scam Quiz</CardTitle>

        </div>

        {!quizStarted && !quizDone && (

          <div className="mt-4">

            <p className="text-sm text-muted-foreground">

              {SCAM_QUIZ.length} questions · see how sharp your scam radar is.

            </p>

            <Button className="mt-3" onClick={() => setQuizStarted(true)}>

              Start Quiz

            </Button>

          </div>

        )}

        {quizStarted && !quizDone && (

          <div className="mt-4">

            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">

              <span>

                Question {qIndex + 1} of {SCAM_QUIZ.length}

              </span>

              <span>Score: {score}</span>

            </div>

            <p className="mt-2 font-bold">{SCAM_QUIZ[qIndex]!.q}</p>

            <div className="mt-3 space-y-2">

              {SCAM_QUIZ[qIndex]!.options.map((opt, i) => (

                <button

                  key={i}

                  onClick={() => answer(i)}

                  disabled={revealed}

                  className={`w-full cursor-pointer rounded-xl border p-3 text-left text-sm font-medium transition-colors disabled:cursor-default ${

                    !revealed

                      ? "border-border hover:bg-muted"

                      : i === SCAM_QUIZ[qIndex]!.answer

                        ? "border-primary bg-primary/10 text-primary"

                        : i === selected

                          ? "border-destructive bg-destructive/10 text-destructive"

                          : "border-border opacity-60"

                  }`}

                >

                  {opt}

                </button>

              ))}

            </div>

            {revealed && (

              <div className="mt-3 rounded-xl bg-muted p-3 text-sm">

                <p className="font-semibold">

                  {selected === SCAM_QUIZ[qIndex]!.answer ? "Correct!" : "Not quite."}

                </p>

                <p className="mt-1 text-muted-foreground">{SCAM_QUIZ[qIndex]!.explain}</p>

                <Button size="sm" className="mt-3" onClick={nextQuestion}>

                  {qIndex + 1 >= SCAM_QUIZ.length ? "See Result" : "Next Question"}

                </Button>

              </div>

            )}

          </div>

        )}

        {quizDone && (

          <div className="mt-4 rounded-2xl border border-border p-4 text-center">

            <p className="text-3xl font-extrabold text-primary">

              {score}/{SCAM_QUIZ.length}

            </p>

            <p className="mt-1 font-semibold">

              {score === SCAM_QUIZ.length

                ? "Scam radar fully calibrated!"

                : score > 0

                  ? "Good instincts — keep learning."

                  : "Everyone starts somewhere."}

            </p>

            <p className="mt-1 text-sm text-muted-foreground">

              {score === SCAM_QUIZ.length

                ? "You earned the Scam Spotter badge."

                : "Try again to earn the Scam Spotter badge."}

            </p>

            <Button size="sm" variant="outline" className="mt-3" onClick={restartQuiz}>

              Restart Quiz

            </Button>

          </div>

        )}

      </Card>

    </div>

  );

}
