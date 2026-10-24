import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, BookOpen, CheckCircle2, Clock, GraduationCap, Trophy } from "lucide-react";
import { Badge, Button, Card, CardTitle, Modal, Progress, SectionTitle } from "@/components/ui";
import { LESSONS, LESSON_CATEGORIES, type Lesson } from "@/lib/demo-data";
import { useSafeBank } from "@/store/store";

export const Route = createFileRoute("/dashboard/moneywise")({
  head: () => ({
    meta: [
      { title: "MoneyWise — SafeBank" },
      {
        name: "description",
        content:
          "Short financial literacy lessons with quizzes, progress tracking and badges. Demo content.",
      },
      { property: "og:title", content: "MoneyWise — SafeBank" },
      { property: "og:description", content: "Financial literacy learning hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MoneyWise,
});

type ProgressMap = Record<string, number>; // lessonId -> best quiz score %

function useStickyProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("safebank-lessons");
      if (raw) setProgress(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("safebank-lessons", JSON.stringify(progress));
      } catch {
        /* ignore */
      }
    }
  }, [progress, ready]);
  return [progress, setProgress] as const;
}

function MoneyWise() {
  const [progress, setProgress] = useStickyProgress();
  const [active, setActive] = useState<Lesson | null>(null);
  const [reading, setReading] = useState(false); // moved from sections to quiz
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const completed = Object.keys(progress).length;
  const totalLessons = LESSONS.length;
  const overallPct = Math.round((completed / totalLessons) * 100);
  const avgScore =
    completed > 0 ? Math.round(Object.values(progress).reduce((a, b) => a + b, 0) / completed) : 0;

  const openLesson = (lesson: Lesson) => {
    setActive(lesson);
    setReading(true);
    setQIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
  };

  const answer = (idx: number) => {
    if (revealed || !active) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === active.quiz[qIndex]!.answer) setScore((s) => s + 1);
  };

  const nextStep = () => {
    if (!active) return;
    if (qIndex + 1 < active.quiz.length) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
      return;
    }
    // Lesson finished — record best score
    const pct = Math.round((score / active.quiz.length) * 100);
    setProgress((p) => ({ ...p, [active.id]: Math.max(p[active.id] ?? 0, pct) }));
    setActive(null);
  };

  const badges = [
    { label: "First Steps", earned: completed >= 1, desc: "Complete your first lesson" },
    {
      label: "Scam Spotter",
      earned: (progress["l4"] ?? 0) >= 100 || (progress["l4"] ?? 0) > 0,
      desc: "Complete Understanding Financial Abuse",
    },
    { label: "Money Master", earned: completed === totalLessons, desc: "Complete every lesson" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">MoneyWise</h2>
        <p className="text-sm text-muted-foreground">
          Short, practical lessons in plain language. Encouraging, never judgmental.
        </p>
      </div>

      {/* Gamification summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Lessons completed</p>
          <p className="text-2xl font-extrabold">
            {completed}/{totalLessons}
          </p>
          <Progress value={overallPct} className="mt-2" />
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Average quiz score</p>
          <p className="text-2xl font-extrabold text-primary">{avgScore}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Best score per lesson</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Learning badges</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} tone={b.earned ? "gold" : "neutral"}>
                <Trophy className="h-3 w-3" /> {b.label}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Categories */}
      <div>
        <SectionTitle title="Learning Categories" />
        <div className="flex flex-wrap gap-2">
          {LESSON_CATEGORIES.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Four lessons are live today — more categories are in development.
        </p>
      </div>

      {/* Lessons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {LESSONS.map((lesson) => {
          const best = progress[lesson.id];
          return (
            <Card key={lesson.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge tone="brand">{lesson.category}</Badge>
                  <CardTitle className="mt-2">{lesson.title}</CardTitle>
                </div>
                {best !== undefined && (
                  <Badge tone="positive">
                    <CheckCircle2 className="h-3 w-3" /> {best}%
                  </Badge>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {lesson.minutes} min read · {lesson.quiz.length}{" "}
                quiz questions
              </p>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {lesson.sections[0]?.body.slice(0, 120) ?? ""}…
              </p>
              <Button
                className="mt-4 w-full"
                variant={best !== undefined ? "outline" : "default"}
                onClick={() => openLesson(lesson)}
              >
                <BookOpen className="h-4 w-4" />{" "}
                {best !== undefined ? "Review Lesson" : "Start Lesson"}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Lesson modal */}
      <Modal open={active !== null} onClose={() => setActive(null)} title={active?.title ?? ""}>
        {active && (
          <>
            <p className="text-xs font-semibold text-muted-foreground">
              {active.category} · {active.minutes} min read
            </p>
            {reading ? (
              <div className="mt-3 space-y-4">
                {active.sections.map((s) => (
                  <div key={s.heading} className="rounded-2xl bg-muted p-4">
                    <p className="font-bold">{s.heading}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                ))}
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm text-primary">
                  <GraduationCap className="h-4.5 w-4.5 shrink-0" />
                  Ready? A short quiz follows to check what you picked up.
                </div>
                <Button className="w-full" onClick={() => setReading(false)}>
                  Take the Quiz
                </Button>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>
                    Question {qIndex + 1} of {active.quiz.length}
                  </span>
                  <span>Score: {score}</span>
                </div>
                <p className="mt-2 font-bold">{active.quiz[qIndex]!.q}</p>
                <div className="mt-3 space-y-2">
                  {active.quiz[qIndex]!.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      disabled={revealed}
                      className={`w-full cursor-pointer rounded-xl border p-3 text-left text-sm font-medium transition-colors disabled:cursor-default ${
                        !revealed
                          ? "border-border hover:bg-muted"
                          : i === active.quiz[qIndex]!.answer
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
                      {selected === active.quiz[qIndex]!.answer ? "Correct!" : "Not quite."}
                    </p>
                    <p className="mt-1 text-muted-foreground">{active.quiz[qIndex]!.explain}</p>
                    <Button size="sm" className="mt-3" onClick={nextStep}>
                      {qIndex + 1 < active.quiz.length ? "Next Question" : "Finish Lesson"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>

      <Card className="flex items-center gap-3">
        <Award className="h-6 w-6 shrink-0 text-accent" />
        <p className="text-sm text-muted-foreground">
          Complete all {totalLessons} lessons to earn the{" "}
          <span className="font-bold text-foreground">Money Master</span> badge. Scores save on this
          device as part of the demo.
        </p>
      </Card>
    </div>
  );
}
